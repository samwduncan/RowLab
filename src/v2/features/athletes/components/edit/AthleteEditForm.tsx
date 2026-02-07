import { useCallback } from 'react';
import { z } from 'zod';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAutoSaveForm, type SaveStatus } from '../../hooks/useAutoSaveForm';
import { useAthletes } from '@v2/hooks/useAthletes';
import type { Athlete, SidePreference, AthleteStatus } from '@v2/types/athletes';

// ============================================
// Helpers
// ============================================

/** Convert NaN / empty values to null for optional number fields */
function toNullableNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// ============================================
// Zod Schema
// ============================================

const optionalNumber = (min: number, max: number, minMsg: string, maxMsg: string) =>
  z.preprocess(toNullableNumber, z.number().min(min, minMsg).max(max, maxMsg).nullable());

const athleteEditSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  side: z.enum(['Port', 'Starboard', 'Both', 'Cox']).nullable(),
  canScull: z.boolean(),
  canCox: z.boolean(),
  status: z.enum(['active', 'inactive', 'injured', 'graduated']),
  classYear: optionalNumber(
    2020,
    2035,
    'Year must be 2020 or later',
    'Year must be 2035 or earlier'
  ),
  weightKg: optionalNumber(
    30,
    200,
    'Weight must be at least 30 kg',
    'Weight must be at most 200 kg'
  ),
  heightCm: optionalNumber(
    100,
    250,
    'Height must be at least 100 cm',
    'Height must be at most 250 cm'
  ),
});

type AthleteEditFormValues = z.infer<typeof athleteEditSchema>;

// ============================================
// Props
// ============================================

interface AthleteEditFormProps {
  athlete: Athlete;
  onClose?: () => void;
}

// ============================================
// Save Status Indicator
// ============================================

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs ml-2 transition-opacity duration-300">
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-txt-tertiary" />
          <span className="text-txt-tertiary">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-red-500">Failed to save</span>
        </>
      )}
    </span>
  );
}

// ============================================
// Section Header
// ============================================

function SectionHeader({ title, saveStatus }: { title: string; saveStatus: SaveStatus }) {
  return (
    <div className="flex items-center mb-3">
      <h3 className="text-xs font-semibold text-txt-tertiary uppercase tracking-wider">{title}</h3>
      <SaveStatusIndicator status={saveStatus} />
    </div>
  );
}

// ============================================
// Field Components
// ============================================

function TextInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-txt-secondary mb-1">{label}</label>
      <input
        {...props}
        className={`
          w-full px-3 py-2 text-sm rounded-lg
          bg-bg-surface border
          ${error ? 'border-red-500/50' : 'border-bdr-default'}
          text-txt-primary placeholder-txt-tertiary
          focus:outline-none focus:ring-2
          ${error ? 'focus:ring-red-500/30' : 'focus:ring-interactive-primary/30'}
          transition-colors
        `}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function NumberInputWithSuffix({
  label,
  suffix,
  error,
  ...props
}: {
  label: string;
  suffix: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-txt-secondary mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          {...props}
          className={`
            w-full px-3 py-2 pr-10 text-sm rounded-lg
            bg-bg-surface border
            ${error ? 'border-red-500/50' : 'border-bdr-default'}
            text-txt-primary placeholder-txt-tertiary
            focus:outline-none focus:ring-2
            ${error ? 'focus:ring-red-500/30' : 'focus:ring-interactive-primary/30'}
            transition-colors
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          `}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-tertiary pointer-events-none">
          {suffix}
        </span>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectInput({
  label,
  options,
  error,
  ...props
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-txt-secondary mb-1">{label}</label>
      <select
        {...props}
        className={`
          w-full px-3 py-2 text-sm rounded-lg
          bg-bg-surface border
          ${error ? 'border-red-500/50' : 'border-bdr-default'}
          text-txt-primary
          focus:outline-none focus:ring-2
          ${error ? 'focus:ring-red-500/30' : 'focus:ring-interactive-primary/30'}
          transition-colors cursor-pointer
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function ToggleInput({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <span className="text-sm text-txt-secondary group-hover:text-txt-primary transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
          transition-colors duration-200
          ${checked ? 'bg-interactive-primary' : 'bg-bg-hover'}
          focus:outline-none focus:ring-2 focus:ring-interactive-primary/30
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}
          `}
        />
      </button>
    </label>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * Auto-save edit form for athlete profiles.
 *
 * Notion-like: no save button. Text inputs auto-save after 1.5s of inactivity.
 * Dropdowns and toggles save immediately on change.
 * Shows inline save status indicator (Saving.../Saved/Error).
 * Uses Zod validation with react-hook-form.
 */
export function AthleteEditForm({ athlete, onClose: _onClose }: AthleteEditFormProps) {
  const { updateAthlete } = useAthletes();

  const defaultValues: AthleteEditFormValues = {
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    email: athlete.email ?? '',
    side: athlete.side ?? null,
    canScull: athlete.canScull,
    canCox: athlete.canCox,
    status: athlete.status || 'active',
    classYear: athlete.classYear ?? null,
    weightKg: athlete.weightKg ?? null,
    heightCm: athlete.heightCm ?? null,
  };

  const handleSave = useCallback(
    async (data: AthleteEditFormValues) => {
      // Validate before sending
      const result = athleteEditSchema.safeParse(data);
      if (!result.success) return;

      return new Promise<void>((resolve, reject) => {
        updateAthlete(
          {
            id: athlete.id,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            email: result.data.email || null,
            side: result.data.side as SidePreference,
            canScull: result.data.canScull,
            canCox: result.data.canCox,
            status: result.data.status as AthleteStatus,
            classYear: result.data.classYear ?? null,
            weightKg: result.data.weightKg ?? null,
            heightCm: result.data.heightCm ?? null,
          },
          {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          }
        );
      });
    },
    [athlete.id, updateAthlete]
  );

  const { form, saveStatus } = useAutoSaveForm<AthleteEditFormValues>({
    athleteId: athlete.id,
    defaultValues,
    onSave: handleSave,
    immediateFields: ['side', 'canScull', 'canCox', 'status'],
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const canScull = watch('canScull');
  const canCox = watch('canCox');

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <section>
        <SectionHeader title="Personal Info" saveStatus={saveStatus} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="First Name"
            placeholder="First name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextInput
            label="Last Name"
            placeholder="Last name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <div className="mt-3">
          <TextInput
            label="Email"
            type="email"
            placeholder="athlete@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      </section>

      {/* Athletic Profile */}
      <section>
        <SectionHeader title="Athletic Profile" saveStatus={saveStatus} />
        <div className="space-y-3">
          <SelectInput
            label="Side Preference"
            error={errors.side?.message}
            value={watch('side') ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setValue('side', val === '' ? null : (val as SidePreference), {
                shouldDirty: true,
              });
            }}
            options={[
              { value: '', label: 'No preference' },
              { value: 'Port', label: 'Port' },
              { value: 'Starboard', label: 'Starboard' },
              { value: 'Both', label: 'Both' },
              { value: 'Cox', label: 'Cox' },
            ]}
          />
          <div className="space-y-2 py-1">
            <ToggleInput
              label="Can Scull"
              checked={canScull}
              onChange={(checked) => setValue('canScull', checked, { shouldDirty: true })}
            />
            <ToggleInput
              label="Can Cox"
              checked={canCox}
              onChange={(checked) => setValue('canCox', checked, { shouldDirty: true })}
            />
          </div>
        </div>
      </section>

      {/* Status */}
      <section>
        <SectionHeader title="Status" saveStatus={saveStatus} />
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="Status"
            error={errors.status?.message}
            value={watch('status')}
            onChange={(e) =>
              setValue('status', e.target.value as AthleteStatus, {
                shouldDirty: true,
              })
            }
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'injured', label: 'Injured' },
              { value: 'graduated', label: 'Graduated' },
            ]}
          />
          <NumberInputWithSuffix
            label="Class Year"
            suffix="yr"
            placeholder="2026"
            error={errors.classYear?.message}
            {...register('classYear', { valueAsNumber: true })}
          />
        </div>
      </section>

      {/* Physical */}
      <section>
        <SectionHeader title="Physical" saveStatus={saveStatus} />
        <div className="grid grid-cols-2 gap-3">
          <NumberInputWithSuffix
            label="Weight"
            suffix="kg"
            placeholder="75"
            step="0.1"
            error={errors.weightKg?.message}
            {...register('weightKg', { valueAsNumber: true })}
          />
          <NumberInputWithSuffix
            label="Height"
            suffix="cm"
            placeholder="185"
            step="0.1"
            error={errors.heightCm?.message}
            {...register('heightCm', { valueAsNumber: true })}
          />
        </div>
      </section>
    </div>
  );
}

export default AthleteEditForm;
