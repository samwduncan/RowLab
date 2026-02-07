import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, SkipForward } from 'lucide-react';
import { SPRING_GENTLE, FADE_IN_VARIANTS, usePrefersReducedMotion } from '@v2/utils/animations';

interface ColumnMappingStepProps {
  columns: string[];
  sampleData: string[][];
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
}

// Target athlete fields with labels and required status
const ATHLETE_FIELDS: Array<{
  key: string;
  label: string;
  required: boolean;
  description: string;
}> = [
  { key: 'firstName', label: 'First Name', required: true, description: 'Athlete first name' },
  { key: 'lastName', label: 'Last Name', required: true, description: 'Athlete last name' },
  { key: 'email', label: 'Email', required: false, description: 'Email address' },
  {
    key: 'side',
    label: 'Side Preference',
    required: false,
    description: 'Port, Starboard, Both, or Cox',
  },
  { key: 'weightKg', label: 'Weight (kg)', required: false, description: 'Weight in kilograms' },
  { key: 'heightCm', label: 'Height (cm)', required: false, description: 'Height in centimeters' },
  { key: 'classYear', label: 'Class Year', required: false, description: 'Graduation year' },
  { key: 'canScull', label: 'Can Scull', required: false, description: 'true/false, yes/no, 1/0' },
  { key: 'canCox', label: 'Can Cox', required: false, description: 'true/false, yes/no, 1/0' },
];

const REQUIRED_FIELDS = ATHLETE_FIELDS.filter((f) => f.required).map((f) => f.key);

/**
 * Normalize a string for fuzzy column matching.
 * Strips whitespace, underscores, hyphens, dots and lowercases.
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[_\s\-\.]/g, '');
}

/**
 * Auto-map CSV columns to athlete fields using fuzzy matching.
 * Returns a mapping of { csvColumnName: athleteFieldKey } for matched columns.
 */
export function autoMapColumns(csvColumns: string[]): Record<string, string> {
  const aliases: Record<string, string[]> = {
    firstName: ['first', 'fname', 'givenname', 'given', 'firstname'],
    lastName: ['last', 'lname', 'surname', 'family', 'familyname', 'lastname'],
    email: ['email', 'mail', 'emailaddress', 'e-mail'],
    side: ['side', 'sidepreference', 'sidepref', 'rowing', 'rowingside', 'preferred', 'preference'],
    weightKg: ['weight', 'weightkg', 'weightinkg', 'wt', 'kg', 'mass'],
    heightCm: ['height', 'heightcm', 'heightincm', 'ht', 'cm'],
    classYear: ['classyear', 'year', 'class', 'gradyear', 'graduationyear', 'grad'],
    canScull: ['canscull', 'scull', 'sculls', 'sculling'],
    canCox: ['cancox', 'cox', 'coxswain', 'coxing', 'iscox'],
  };

  const mapping: Record<string, string> = {};
  const usedFields = new Set<string>();

  // For each CSV column, find the best matching athlete field
  csvColumns.forEach((col) => {
    const normalizedCol = normalize(col);

    for (const [fieldKey, fieldAliases] of Object.entries(aliases)) {
      if (usedFields.has(fieldKey)) continue;

      // Exact normalized match
      if (normalizedCol === normalize(fieldKey)) {
        mapping[col] = fieldKey;
        usedFields.add(fieldKey);
        return;
      }

      // Alias match
      if (fieldAliases.some((alias) => normalizedCol === alias)) {
        mapping[col] = fieldKey;
        usedFields.add(fieldKey);
        return;
      }

      // Contains match (CSV column contains the alias)
      if (fieldAliases.some((alias) => normalizedCol.includes(alias) && alias.length >= 3)) {
        mapping[col] = fieldKey;
        usedFields.add(fieldKey);
        return;
      }
    }
  });

  return mapping;
}

/**
 * Get the sample values for a given CSV column index from sample data.
 */
function getSampleValues(columns: string[], sampleData: string[][], columnName: string): string[] {
  const colIndex = columns.indexOf(columnName);
  if (colIndex === -1) return [];
  return sampleData
    .slice(0, 3)
    .map((row) => row[colIndex] ?? '')
    .filter((v) => v !== '');
}

export function ColumnMappingStep({
  columns,
  sampleData,
  mapping,
  onChange,
}: ColumnMappingStepProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const transition = prefersReducedMotion ? { duration: 0 } : SPRING_GENTLE;

  // Track which athlete fields are currently mapped (to prevent duplicates)
  const mappedFields = useMemo(() => {
    const fields = new Set<string>();
    Object.values(mapping).forEach((field) => {
      if (field && field !== '__skip__') {
        fields.add(field);
      }
    });
    return fields;
  }, [mapping]);

  // Count required fields that are mapped
  const requiredMappedCount = useMemo(() => {
    return REQUIRED_FIELDS.filter((reqField) => Object.values(mapping).includes(reqField)).length;
  }, [mapping]);

  const allRequiredMapped = requiredMappedCount === REQUIRED_FIELDS.length;

  const handleColumnMappingChange = (csvColumn: string, targetField: string) => {
    const newMapping = { ...mapping };

    if (targetField === '__skip__' || targetField === '') {
      delete newMapping[csvColumn];
    } else {
      // Remove any other CSV column that was mapped to this target field
      Object.keys(newMapping).forEach((key) => {
        if (newMapping[key] === targetField && key !== csvColumn) {
          delete newMapping[key];
        }
      });
      newMapping[csvColumn] = targetField;
    }

    onChange(newMapping);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-txt-secondary">
          Match your CSV columns to athlete fields. Auto-detected mappings are pre-selected.
        </p>
      </div>

      {/* Column mapping rows */}
      <div className="space-y-2">
        {columns.map((csvColumn, index) => {
          const currentTarget = mapping[csvColumn] || '';
          const isAutoMapped = currentTarget !== '' && currentTarget !== '__skip__';
          const fieldInfo = ATHLETE_FIELDS.find((f) => f.key === currentTarget);
          const isRequiredField = fieldInfo?.required ?? false;
          const samples = getSampleValues(columns, sampleData, csvColumn);

          return (
            <motion.div
              key={csvColumn}
              variants={FADE_IN_VARIANTS}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: prefersReducedMotion ? 0 : index * 0.03 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-colors
                ${
                  isAutoMapped
                    ? 'bg-status-success/5 border-status-success/20'
                    : 'bg-bg-surface-elevated border-bdr-subtle'
                }
              `}
            >
              {/* CSV column name + sample */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-txt-primary truncate">{csvColumn}</span>
                  {isAutoMapped && (
                    <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  )}
                </div>
                {samples.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {samples.map((val, i) => (
                      <span
                        key={i}
                        className="text-xs text-txt-tertiary bg-bg-surface px-1.5 py-0.5 rounded
                                   max-w-[120px] truncate inline-block"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight size={16} className="text-txt-tertiary shrink-0" />

              {/* Target field dropdown */}
              <div className="w-44 shrink-0">
                <select
                  value={currentTarget}
                  onChange={(e) => handleColumnMappingChange(csvColumn, e.target.value)}
                  className={`
                    w-full px-3 py-2 text-sm rounded-lg bg-bg-surface border
                    text-txt-primary focus:outline-none focus:border-interactive-primary
                    transition-colors cursor-pointer
                    ${
                      isRequiredField && !isAutoMapped
                        ? 'border-status-error/50'
                        : 'border-bdr-default'
                    }
                  `}
                >
                  <option value="">-- Skip this column --</option>
                  {ATHLETE_FIELDS.map((field) => {
                    const isUsedElsewhere =
                      mappedFields.has(field.key) && currentTarget !== field.key;
                    return (
                      <option key={field.key} value={field.key} disabled={isUsedElsewhere}>
                        {field.label}
                        {field.required ? ' *' : ''}
                        {isUsedElsewhere ? ' (mapped)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Validation summary */}
      <div
        className={`
          flex items-center gap-2 px-4 py-3 rounded-lg border text-sm
          ${
            allRequiredMapped
              ? 'bg-status-success/5 border-status-success/20 text-status-success'
              : 'bg-status-warning/5 border-status-warning/20 text-status-warning'
          }
        `}
      >
        {allRequiredMapped ? (
          <>
            <CheckCircle2 size={16} />
            <span>
              All required fields mapped ({requiredMappedCount} of {REQUIRED_FIELDS.length}).{' '}
              {Object.values(mapping).filter((v) => v && v !== '__skip__').length -
                requiredMappedCount}{' '}
              optional field
              {Object.values(mapping).filter((v) => v && v !== '__skip__').length -
                requiredMappedCount !==
              1
                ? 's'
                : ''}{' '}
              mapped.
            </span>
          </>
        ) : (
          <>
            <AlertCircle size={16} />
            <span>
              {requiredMappedCount} of {REQUIRED_FIELDS.length} required fields mapped. Please map{' '}
              <strong>First Name</strong> and <strong>Last Name</strong>.
            </span>
          </>
        )}
      </div>

      {/* Unmapped columns info */}
      {columns.length > Object.keys(mapping).length && (
        <div className="flex items-start gap-2 px-3 py-2 text-xs text-txt-tertiary">
          <SkipForward size={14} className="shrink-0 mt-0.5" />
          <span>
            Unmapped columns will be skipped: {columns.filter((c) => !mapping[c]).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
