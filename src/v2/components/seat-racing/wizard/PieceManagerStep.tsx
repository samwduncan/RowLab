/**
 * PieceManagerStep - Wizard Step 2: Piece and Boat Management
 *
 * Allows coaches to:
 * - Add multiple pieces to session
 * - Add boats to each piece (2-4 boats per piece)
 * - Enter finish times for each boat
 * - Configure piece metadata (distance, direction, notes)
 */

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { BoatTimeEntry } from './BoatTimeEntry';
import { formatSecondsToTime } from '@v2/types/seatRacing';

/**
 * Boat row within a piece
 */
interface BoatRowProps {
  pieceIndex: number;
  boatIndex: number;
  onRemove: () => void;
}

function BoatRow({ pieceIndex, boatIndex, onRemove }: BoatRowProps) {
  const { register, setValue, watch } = useFormContext();
  const fieldPrefix = `pieces.${pieceIndex}.boats.${boatIndex}`;
  const timeSeconds = watch(`${fieldPrefix}.finishTimeSeconds`);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1">
        <input
          {...register(`${fieldPrefix}.name`)}
          placeholder="Boat name (e.g., Boat A)"
          className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div>
        <BoatTimeEntry
          value={formatSecondsToTime(timeSeconds)}
          onChange={(secs) => setValue(`${fieldPrefix}.finishTimeSeconds`, secs)}
          placeholder="M:SS.s"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 text-txt-tertiary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
        title="Remove boat"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Piece card containing piece metadata and boats
 */
interface PieceCardProps {
  pieceIndex: number;
  onRemove: () => void;
}

function PieceCard({ pieceIndex, onRemove }: PieceCardProps) {
  const { control, register, formState: { errors } } = useFormContext();
  const [isExpanded, setIsExpanded] = useState(true);

  const { fields: boats, append: addBoat, remove: removeBoat } = useFieldArray({
    control,
    name: `pieces.${pieceIndex}.boats`,
  });

  const handleAddBoat = () => {
    if (boats.length >= 4) return; // Max 4 boats per piece
    const nextLetter = String.fromCharCode(65 + boats.length); // A, B, C, D
    addBoat({
      name: `Boat ${nextLetter}`,
      finishTimeSeconds: null,
      handicapSeconds: 0,
      shellName: null,
    });
  };

  const pieceErrors = errors?.pieces?.[pieceIndex];

  return (
    <div className="border border-border rounded-lg bg-surface">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3 flex-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-bg-active rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-txt-tertiary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-txt-tertiary" />
            )}
          </button>
          <h4 className="text-sm font-semibold text-txt-primary">
            Piece #{pieceIndex + 1}
          </h4>
          <span className="text-xs text-txt-tertiary">
            {boats.length} boat{boats.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-txt-tertiary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
          title="Remove piece"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Piece Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-txt-secondary mb-1">
                Distance (meters)
              </label>
              <input
                {...register(`pieces.${pieceIndex}.distanceMeters`, {
                  valueAsNumber: true,
                })}
                type="number"
                placeholder="500"
                className="w-full px-3 py-1.5 text-sm bg-bg-default border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-txt-secondary mb-1">
                Direction
              </label>
              <select
                {...register(`pieces.${pieceIndex}.direction`)}
                className="w-full px-3 py-1.5 text-sm bg-bg-default border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="upstream">Upstream</option>
                <option value="downstream">Downstream</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-txt-secondary mb-1">
                Notes
              </label>
              <input
                {...register(`pieces.${pieceIndex}.notes`)}
                type="text"
                placeholder="Optional notes"
                className="w-full px-3 py-1.5 text-sm bg-bg-default border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Boats Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-txt-secondary">Boats</label>
              <button
                type="button"
                onClick={handleAddBoat}
                disabled={boats.length >= 4}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-interactive-primary hover:bg-interactive-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
                Add Boat
              </button>
            </div>

            {/* Boat List */}
            <div className="space-y-1 bg-bg-default rounded-md p-3 border border-border">
              {boats.length === 0 ? (
                <div className="text-sm text-txt-tertiary text-center py-4">
                  Add at least 2 boats to race
                </div>
              ) : (
                boats.map((boat, boatIndex) => (
                  <BoatRow
                    key={boat.id}
                    pieceIndex={pieceIndex}
                    boatIndex={boatIndex}
                    onRemove={() => removeBoat(boatIndex)}
                  />
                ))
              )}
            </div>

            {/* Validation Error */}
            {pieceErrors?.boats && (
              <p className="text-xs text-red-500 mt-1">
                {pieceErrors.boats.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Empty state when no pieces
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-surface rounded-lg border-2 border-dashed border-border">
      <svg
        className="w-12 h-12 text-txt-muted mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      <p className="text-sm text-txt-secondary">{message}</p>
    </div>
  );
}

/**
 * Main PieceManagerStep component (Wizard Step 2)
 */
export function PieceManagerStep() {
  const { control, formState: { errors } } = useFormContext();

  const { fields: pieces, append: addPiece, remove: removePiece } = useFieldArray({
    control,
    name: 'pieces',
  });

  const handleAddPiece = () => {
    const nextLetter = String.fromCharCode(65 + Math.min(pieces.length * 2, 6)); // A, C, E, G (staggered)
    addPiece({
      sequenceOrder: pieces.length + 1,
      distanceMeters: 500,
      direction: null,
      notes: '',
      boats: [
        { name: `Boat ${nextLetter}`, finishTimeSeconds: null, handicapSeconds: 0, shellName: null },
        { name: `Boat ${String.fromCharCode(nextLetter.charCodeAt(0) + 1)}`, finishTimeSeconds: null, handicapSeconds: 0, shellName: null },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-txt-primary">Pieces & Boats</h3>
          <p className="text-sm text-txt-secondary mt-1">
            Add race pieces and configure boats for each piece
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddPiece}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-interactive-primary text-white rounded-md hover:bg-interactive-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Piece
        </button>
      </div>

      {/* Piece List */}
      {pieces.length > 0 ? (
        <div className="space-y-4">
          {pieces.map((piece, index) => (
            <PieceCard
              key={piece.id}
              pieceIndex={index}
              onRemove={() => removePiece(index)}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Add at least one piece to continue" />
      )}

      {/* Global validation error */}
      {errors.pieces && typeof errors.pieces.message === 'string' && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.pieces.message}
          </p>
        </div>
      )}
    </div>
  );
}
