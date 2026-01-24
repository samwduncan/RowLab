import * as Papa from 'papaparse';
import { z } from 'zod';

// Target column names for athlete import
export const ATHLETE_COLUMNS = [
  'firstName',
  'lastName',
  'email',
  'side',
  'canScull',
  'canCox',
  'heightCm',
  'weightKg',
] as const;

export type AthleteColumn = (typeof ATHLETE_COLUMNS)[number];

export interface ColumnMapping {
  [key: string]: string | null; // target -> source column
}

export interface ParsedCSV {
  headers: string[];
  data: Record<string, unknown>[];
  rowCount: number;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value: unknown;
}

export interface ValidatedRow {
  data: Record<string, unknown>;
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Parse CSV file using PapaParse
 * Uses worker thread for large files (per research Pitfall 5)
 */
export function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      worker: file.size > 500 * 1024, // Use worker for files > 500KB
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          // Log parse errors but continue with valid data
          console.warn('CSV parse warnings:', results.errors);
        }
        resolve({
          headers: results.meta.fields || [],
          data: results.data as Record<string, unknown>[],
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Normalize string for fuzzy matching
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[_\s\-\.]/g, '');
}

/**
 * Auto-map CSV columns to target athlete fields
 * Uses fuzzy matching per research Pattern 2
 */
export function autoMapColumns(csvHeaders: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  // Aliases for common variations
  const aliases: Record<AthleteColumn, string[]> = {
    firstName: ['first', 'fname', 'givenname', 'given'],
    lastName: ['last', 'lname', 'surname', 'family', 'familyname'],
    email: ['mail', 'emailaddress'],
    side: ['sidepreference', 'sidepref', 'rowing', 'rowingside', 'preferred'],
    canScull: ['scull', 'sculls', 'sculling', 'cansculling'],
    canCox: ['cox', 'coxswain', 'coxing', 'iscox', 'iscoxswain'],
    heightCm: ['height', 'heightincm', 'ht', 'cm'],
    weightKg: ['weight', 'weightinkg', 'wt', 'kg', 'mass'],
  };

  ATHLETE_COLUMNS.forEach((target) => {
    const normalizedTarget = normalize(target);
    const targetAliases = aliases[target] || [];

    // Find best matching header
    const match = csvHeaders.find((header) => {
      const normalizedHeader = normalize(header);

      // Exact match
      if (normalizedHeader === normalizedTarget) return true;

      // Alias match
      if (targetAliases.some((alias) => normalizedHeader === alias)) return true;

      // Contains match
      if (normalizedHeader.includes(normalizedTarget)) return true;
      if (targetAliases.some((alias) => normalizedHeader.includes(alias))) return true;

      // Reverse contains
      if (normalizedTarget.includes(normalizedHeader)) return true;

      return false;
    });

    mapping[target] = match || null;
  });

  return mapping;
}

/**
 * Validate a single athlete row
 */
const athleteRowSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').nullable().optional(),
  side: z
    .enum(['Port', 'Starboard', 'Both', 'Cox', 'P', 'S', 'B', 'C'])
    .nullable()
    .optional()
    .transform((val) => {
      // Normalize single-letter codes
      if (val === 'P') return 'Port';
      if (val === 'S') return 'Starboard';
      if (val === 'B') return 'Both';
      if (val === 'C') return 'Cox';
      return val;
    }),
  canScull: z
    .union([z.boolean(), z.string(), z.number()])
    .nullable()
    .optional()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val === 1;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'y';
      }
      return false;
    }),
  canCox: z
    .union([z.boolean(), z.string(), z.number()])
    .nullable()
    .optional()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val === 1;
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'y';
      }
      return false;
    }),
  heightCm: z.number().min(100, 'Height too low').max(250, 'Height too high').nullable().optional(),
  weightKg: z.number().min(30, 'Weight too low').max(200, 'Weight too high').nullable().optional(),
});

export type ValidatedAthleteData = z.infer<typeof athleteRowSchema>;

/**
 * Map and validate a CSV row using the column mapping
 */
export function validateAthleteRow(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  rowIndex: number
): ValidatedRow {
  // Map columns
  const mappedData: Record<string, unknown> = {};
  ATHLETE_COLUMNS.forEach((target) => {
    const source = mapping[target];
    if (source && row[source] !== undefined && row[source] !== '') {
      mappedData[target] = row[source];
    } else {
      mappedData[target] = null;
    }
  });

  // Validate
  const result = athleteRowSchema.safeParse(mappedData);

  if (result.success) {
    return {
      data: result.data,
      isValid: true,
      errors: [],
    };
  }

  // Convert Zod errors to our format
  const errors: ValidationError[] = result.error.issues.map((err) => ({
    row: rowIndex + 1, // 1-indexed for display
    column: err.path.join('.'),
    message: err.message,
    value: mappedData[err.path[0] as string],
  }));

  return {
    data: mappedData,
    isValid: false,
    errors,
  };
}

/**
 * Validate all rows and return summary
 */
export function validateAllRows(
  data: Record<string, unknown>[],
  mapping: ColumnMapping
): {
  validRows: ValidatedAthleteData[];
  invalidRows: { row: number; errors: ValidationError[] }[];
  totalValid: number;
  totalInvalid: number;
} {
  const validRows: ValidatedAthleteData[] = [];
  const invalidRows: { row: number; errors: ValidationError[] }[] = [];

  data.forEach((row, index) => {
    const result = validateAthleteRow(row, mapping, index);
    if (result.isValid) {
      validRows.push(result.data as ValidatedAthleteData);
    } else {
      invalidRows.push({ row: index + 1, errors: result.errors });
    }
  });

  return {
    validRows,
    invalidRows,
    totalValid: validRows.length,
    totalInvalid: invalidRows.length,
  };
}
