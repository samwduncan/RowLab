import { useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Barbell, Boat, PersonSimpleRun, HeartHalf, Bicycle, Timer } from '@phosphor-icons/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCreateSession } from '../../../hooks/useSessions';
import { RecurrenceEditor } from './RecurrenceEditor';
import { PieceEditor } from './PieceEditor';
import { MODAL_VARIANTS, SPRING_CONFIG } from '../../../utils/animations';
import type { SessionType, CreateSessionInput } from '../../../types/session';

// --- Constants ---

const SESSION_TYPES: {
  value: SessionType;
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: string }>;
  defaultDuration: number;
}[] = [
  { value: 'ERG', label: 'Erg', icon: Timer, defaultDuration: 60 },
  { value: 'ROW', label: 'Row', icon: Boat, defaultDuration: 90 },
  { value: 'LIFT', label: 'Lift', icon: Barbell, defaultDuration: 45 },
  { value: 'RUN', label: 'Run', icon: PersonSimpleRun, defaultDuration: 45 },
  { value: 'CROSS_TRAIN', label: 'Cross-Train', icon: Bicycle, defaultDuration: 45 },
  { value: 'RECOVERY', label: 'Recovery', icon: HeartHalf, defaultDuration: 30 },
];

type WizardStep = 'metadata' | 'pieces';

// --- Schema ---

const sessionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['ERG', 'ROW', 'LIFT', 'RUN', 'CROSS_TRAIN', 'RECOVERY']),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string(),
  endTime: z.string(),
  recurrenceRule: z.string().optional(),
  notes: z.string(),
  athleteVisibility: z.boolean(),
  pieces: z.array(
    z.object({
      segment: z.enum(['WARMUP', 'MAIN', 'COOLDOWN']),
      name: z.string(),
      description: z.string().optional(),
      order: z.number(),
      distance: z.number().optional(),
      duration: z.number().optional(),
      targetSplit: z.number().optional(),
      targetRate: z.number().optional(),
      targetWatts: z.number().optional(),
      targetHRZone: z.string().optional(),
      targetRPE: z.number().optional(),
      notes: z.string(),
      boatClass: z.string().optional(),
      sets: z.number().optional(),
      reps: z.number().optional(),
    })
  ),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// --- Step transition variants (slide left/right) ---

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export function SessionForm({ onSuccess, onCancel }: SessionFormProps) {
  const navigate = useNavigate();
  const { createSessionAsync, isCreating } = useCreateSession();
  const [step, setStep] = useState<WizardStep>('metadata');
  const [direction, setDirection] = useState(0);

  const methods = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: '',
      type: 'ERG',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      recurrenceRule: undefined,
      notes: '',
      athleteVisibility: true,
      pieces: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const sessionType = useWatch({ control, name: 'type' }) || 'ERG';
  const sessionDate = useWatch({ control, name: 'date' }) || new Date().toISOString().split('T')[0];
  const recurrenceRule = useWatch({ control, name: 'recurrenceRule' });

  // Auto-set end time based on session type defaults
  const handleTypeSelect = (type: SessionType) => {
    setValue('type', type);
    const config = SESSION_TYPES.find((t) => t.value === type);
    if (config) {
      // Auto-generate a name based on the type if empty
      const currentName = methods.getValues('name');
      if (!currentName) {
        const today = new Date();
        const hours = today.getHours();
        const timeOfDay = hours < 12 ? 'Morning' : hours < 17 ? 'Afternoon' : 'Evening';
        setValue('name', `${timeOfDay} ${config.label}`);
      }
    }
  };

  const goToStep2 = async () => {
    // Validate step 1 fields before advancing
    const valid = await trigger(['name', 'type', 'date']);
    if (valid) {
      setDirection(1);
      setStep('pieces');
    }
  };

  const goToStep1 = () => {
    setDirection(-1);
    setStep('metadata');
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      const input: CreateSessionInput = {
        ...data,
        pieces: data.pieces.map((piece, index) => ({
          ...piece,
          order: index,
          duration: piece.duration ? piece.duration * 60 : undefined, // Convert minutes to seconds
        })),
      };

      const session = await createSessionAsync(input);
      onSuccess?.();
      navigate(`/app/training/sessions/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const selectedTypeConfig = SESSION_TYPES.find((t) => t.value === sessionType);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => step === 'pieces' && goToStep1()}
            className={`flex items-center gap-2 text-sm font-medium transition-colors
              ${step === 'metadata' ? 'text-txt-primary' : 'text-txt-muted hover:text-txt-secondary'}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === 'metadata' ? 'bg-interactive-primary text-txt-inverse' : 'bg-bg-surface-elevated text-txt-muted'}`}
            >
              1
            </span>
            Session Details
          </button>
          <div className="flex-1 h-px bg-bdr-default" />
          <button
            type="button"
            onClick={() => step === 'metadata' && goToStep2()}
            className={`flex items-center gap-2 text-sm font-medium transition-colors
              ${step === 'pieces' ? 'text-txt-primary' : 'text-txt-muted hover:text-txt-secondary'}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === 'pieces' ? 'bg-interactive-primary text-txt-inverse' : 'bg-bg-surface-elevated text-txt-muted'}`}
            >
              2
            </span>
            Workout Pieces
          </button>
        </div>

        {/* Step content with AnimatePresence transitions */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 'metadata' ? (
            <motion.div
              key="metadata"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING_CONFIG}
              className="space-y-5"
            >
              {/* Session Type Cards */}
              <div>
                <label className="block text-sm text-txt-secondary mb-2">Session Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {SESSION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = sessionType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeSelect(type.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
                          ${
                            isSelected
                              ? 'border-interactive-primary bg-interactive-primary/5 text-txt-primary'
                              : 'border-bdr-default bg-bg-surface text-txt-secondary hover:border-bdr-strong hover:text-txt-primary'
                          }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isSelected ? 'text-interactive-primary' : ''}`}
                          weight={isSelected ? 'fill' : 'regular'}
                        />
                        <span className="text-xs font-medium">{type.label}</span>
                        <span className="text-[10px] text-txt-muted font-mono">
                          ~{type.defaultDuration}min
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-txt-secondary mb-1">Session Name</label>
                <input
                  {...register('name')}
                  placeholder={`e.g., Morning ${selectedTypeConfig?.label || 'Session'}`}
                  className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-bdr-default
                    text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                />
                {errors.name && (
                  <p className="text-data-poor text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-txt-secondary mb-1">Date</label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-bdr-default
                      text-txt-primary focus:outline-none focus:border-interactive-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-txt-secondary mb-1">Start Time</label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-bdr-default
                      text-txt-primary focus:outline-none focus:border-interactive-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-txt-secondary mb-1">End Time</label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-bdr-default
                      text-txt-primary focus:outline-none focus:border-interactive-primary"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-txt-secondary mb-1">Notes (optional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Any notes for this session..."
                  className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-bdr-default
                    text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary resize-none"
                />
              </div>

              {/* Recurrence Toggle + Editor */}
              <div className="space-y-3 pt-3 border-t border-bdr-default">
                <RecurrenceEditor
                  value={recurrenceRule}
                  onChange={(rrule) => setValue('recurrenceRule', rrule)}
                  startDate={sessionDate ? new Date(sessionDate) : new Date()}
                />
              </div>

              {/* Athlete Visibility */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('athleteVisibility')}
                  className="w-4 h-4 rounded border-bdr-default text-interactive-primary focus:ring-interactive-primary"
                />
                <span className="text-sm text-txt-primary">
                  Athletes can see session details before it starts
                </span>
              </label>

              {/* Step 1 actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-bdr-default">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-bdr-default text-txt-secondary
                      hover:text-txt-primary hover:border-bdr-strong transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToStep2}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-interactive-primary text-txt-inverse font-medium
                    hover:bg-interactive-primary/90 transition-colors"
                >
                  Next: Add Pieces
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pieces"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING_CONFIG}
              className="space-y-5"
            >
              {/* Pieces editor */}
              <PieceEditor sessionType={sessionType} />

              {/* Step 2 actions */}
              <div className="flex items-center justify-between pt-4 border-t border-bdr-default">
                <button
                  type="button"
                  onClick={goToStep1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-bdr-default text-txt-secondary
                    hover:text-txt-primary hover:border-bdr-strong transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Details
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCreating}
                  className="px-4 py-2 rounded-lg bg-interactive-primary text-txt-inverse font-medium
                    hover:bg-interactive-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting || isCreating ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </FormProvider>
  );
}
