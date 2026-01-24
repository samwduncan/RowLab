import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CrudModal } from '../common/CrudModal';
import { useSaveLineup, useUpdateLineup } from '../../hooks/useLineups';
import type { Lineup, LineupAssignment } from '../../hooks/useLineups';
import { Loader2 } from 'lucide-react';
import useLineupStore from '../../../store/lineupStore';

/**
 * Validation schema for lineup save form
 */
const saveLineupSchema = z.object({
  name: z.string().min(1, 'Lineup name is required').max(100, 'Name must be 100 characters or less'),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

type SaveLineupFormData = z.infer<typeof saveLineupSchema>;

/**
 * Props for SaveLineupDialog component
 */
export interface SaveLineupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingLineup?: Lineup | null;
  onSuccess?: (lineup: Lineup) => void;
}

/**
 * Modal dialog for saving/updating lineups
 *
 * Features:
 * - Create new lineup or update existing
 * - Name and notes input with Zod validation
 * - Automatically extracts assignments from lineupStore
 * - Loading state during save
 * - Success callback for post-save actions
 *
 * Per CONTEXT.md: "Auto-save versions on each explicit save - system maintains version history automatically"
 */
export function SaveLineupDialog({ isOpen, onClose, existingLineup, onSuccess }: SaveLineupDialogProps) {
  const { saveLineupAsync, isSaving } = useSaveLineup();
  const { updateLineupAsync, isUpdating } = useUpdateLineup();
  const activeBoats = useLineupStore((state) => state.activeBoats);

  const isUpdate = !!existingLineup;
  const isProcessing = isSaving || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaveLineupFormData>({
    resolver: zodResolver(saveLineupSchema),
    defaultValues: {
      name: existingLineup?.name || '',
      notes: existingLineup?.notes || '',
    },
  });

  // Reset form when dialog opens with different lineup
  useEffect(() => {
    if (isOpen) {
      reset({
        name: existingLineup?.name || '',
        notes: existingLineup?.notes || '',
      });
    }
  }, [isOpen, existingLineup, reset]);

  /**
   * Convert activeBoats to assignment array
   */
  const buildAssignments = (): LineupAssignment[] => {
    const assignments: LineupAssignment[] = [];

    for (const boat of activeBoats) {
      // Add seat assignments
      for (const seat of boat.seats) {
        if (seat.athlete) {
          assignments.push({
            athleteId: seat.athlete.id,
            boatClass: boat.name,
            shellName: boat.shellName,
            seatNumber: seat.seatNumber,
            side: seat.side,
            isCoxswain: false,
          });
        }
      }

      // Add coxswain
      if (boat.coxswain) {
        assignments.push({
          athleteId: boat.coxswain.id,
          boatClass: boat.name,
          shellName: boat.shellName,
          seatNumber: 0,
          side: 'Port',
          isCoxswain: true,
        });
      }
    }

    return assignments;
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: SaveLineupFormData) => {
    try {
      const assignments = buildAssignments();

      let savedLineup: Lineup;

      if (isUpdate && existingLineup) {
        // Update existing lineup
        savedLineup = await updateLineupAsync({
          id: existingLineup.id,
          name: data.name,
          notes: data.notes,
          assignments,
        });
      } else {
        // Create new lineup
        savedLineup = await saveLineupAsync({
          name: data.name,
          notes: data.notes,
          assignments,
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(savedLineup);
      }

      // Close dialog
      onClose();
    } catch (error) {
      console.error('Failed to save lineup:', error);
      // Error is already handled by React Query mutation hooks
    }
  };

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdate ? 'Update Lineup' : 'Save Lineup'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-txt-primary mb-1.5">
            Lineup Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            disabled={isProcessing}
            className="w-full px-3 py-2 bg-surface-primary border border-bdr-primary rounded-lg text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., 'Practice Lineup - Jan 24' or 'Race Day V8+'"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Notes textarea */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-txt-primary mb-1.5">
            Notes <span className="text-txt-tertiary">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            disabled={isProcessing}
            className="w-full px-3 py-2 bg-surface-primary border border-bdr-primary rounded-lg text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Add any notes about this lineup..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-400">{errors.notes.message}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-txt-secondary hover:text-txt-primary bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {isProcessing ? 'Saving...' : isUpdate ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </CrudModal>
  );
}
