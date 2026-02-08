import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash, CaretDown, CaretUp, DotsSixVertical, Lightning } from '@phosphor-icons/react';
import type { PieceSegment } from '../../../types/session';

const SEGMENTS: { value: PieceSegment; label: string }[] = [
  { value: 'WARMUP', label: 'Warmup' },
  { value: 'MAIN', label: 'Main' },
  { value: 'COOLDOWN', label: 'Cooldown' },
];

// Quick-add piece templates for common rowing workouts
const QUICK_TEMPLATES: {
  label: string;
  segment: PieceSegment;
  name: string;
  duration?: number;
  distance?: number;
  targetRate?: number;
  targetSplit?: number;
}[] = [
  { label: "40' SS", segment: 'MAIN', name: "40' Steady State", duration: 40, targetRate: 20 },
  {
    label: "5x4' @r24",
    segment: 'MAIN',
    name: "5x4' Intervals",
    duration: 4,
    targetRate: 24,
  },
  { label: '8x500m', segment: 'MAIN', name: '8x500m Pieces', distance: 500, targetRate: 28 },
  { label: '3x1K', segment: 'MAIN', name: '3x1000m Pieces', distance: 1000, targetRate: 26 },
  { label: '6K Test', segment: 'MAIN', name: '6K Test Piece', distance: 6000 },
  { label: '2K Test', segment: 'MAIN', name: '2K Test Piece', distance: 2000 },
];

interface PieceEditorProps {
  sessionType: string;
}

export function PieceEditor({ sessionType }: PieceEditorProps) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pieces',
  });

  const [expandedSegments, setExpandedSegments] = useState<Record<PieceSegment, boolean>>({
    WARMUP: true,
    MAIN: true,
    COOLDOWN: true,
  });

  // Auto-collapse segments with 4+ pieces
  const toggleSegment = (segment: PieceSegment) => {
    setExpandedSegments((prev) => ({ ...prev, [segment]: !prev[segment] }));
  };

  // Watch all piece segments
  const pieces = useWatch({ control, name: 'pieces' }) || [];

  // Group pieces by segment
  const piecesBySegment = SEGMENTS.map((segment) => ({
    ...segment,
    pieces: fields
      .map((field, index) => ({ ...field, index }))
      .filter((_, i) => pieces[i]?.segment === segment.value),
  }));

  const addPiece = (segment: PieceSegment) => {
    append({
      segment,
      name: '',
      description: '',
      order: fields.length,
      distance: undefined,
      duration: undefined,
      targetSplit: undefined,
      targetRate: undefined,
      targetWatts: undefined,
      notes: '',
    });
  };

  const addFromTemplate = (template: (typeof QUICK_TEMPLATES)[number]) => {
    append({
      segment: template.segment,
      name: template.name,
      description: '',
      order: fields.length,
      distance: template.distance || undefined,
      duration: template.duration || undefined,
      targetSplit: template.targetSplit || undefined,
      targetRate: template.targetRate || undefined,
      targetWatts: undefined,
      notes: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick-add templates */}
      <div>
        <label className="flex items-center gap-1.5 text-sm text-txt-secondary mb-2">
          <Lightning className="w-4 h-4" weight="fill" />
          Quick Add
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => addFromTemplate(template)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg
                bg-bg-surface border border-bdr-default text-txt-secondary
                hover:border-interactive-primary hover:text-interactive-primary transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Segments */}
      {piecesBySegment.map((segment) => {
        const shouldAutoCollapse = segment.pieces.length >= 4;
        return (
          <div key={segment.value} className="border border-bdr-default rounded-lg overflow-hidden">
            {/* Segment header */}
            <button
              type="button"
              onClick={() => toggleSegment(segment.value)}
              className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface
                text-txt-primary font-medium hover:bg-bg-hover transition-colors"
            >
              <span className="flex items-center gap-2">
                {segment.label}
                <span className="text-sm text-txt-muted">({segment.pieces.length} pieces)</span>
              </span>
              {expandedSegments[segment.value] ? (
                <CaretUp className="w-5 h-5" />
              ) : (
                <CaretDown className="w-5 h-5" />
              )}
            </button>

            {/* Pieces list */}
            {expandedSegments[segment.value] && (
              <div className="p-4 space-y-3 bg-bg-surface-elevated">
                {segment.pieces.length === 0 ? (
                  <div className="text-center py-4 text-txt-muted">
                    No {segment.label.toLowerCase()} pieces yet
                  </div>
                ) : (
                  segment.pieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="flex items-start gap-3 p-3 bg-bg-surface rounded-lg border border-bdr-default"
                    >
                      {/* Drag handle */}
                      <div className="mt-2 cursor-grab text-txt-muted hover:text-txt-secondary">
                        <DotsSixVertical className="w-5 h-5" />
                      </div>

                      {/* Piece fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Name */}
                        <div className="md:col-span-2">
                          <input
                            {...register(`pieces.${piece.index}.name`)}
                            placeholder="Piece name (e.g., 4x2000m, 40' SS)"
                            className="w-full px-3 py-2 rounded-lg bg-bg-surface-elevated border border-bdr-default
                              text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                          />
                        </div>

                        {/* Distance */}
                        <div>
                          <label className="block text-xs text-txt-muted mb-1">Distance (m)</label>
                          <input
                            type="number"
                            {...register(`pieces.${piece.index}.distance`, {
                              valueAsNumber: true,
                            })}
                            placeholder="2000"
                            className="w-full px-3 py-2 rounded-lg bg-bg-surface-elevated border border-bdr-default
                              text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-xs text-txt-muted mb-1">
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            {...register(`pieces.${piece.index}.duration`, {
                              valueAsNumber: true,
                            })}
                            placeholder="40"
                            className="w-full px-3 py-2 rounded-lg bg-bg-surface-elevated border border-bdr-default
                              text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                          />
                        </div>

                        {/* Erg-specific targets */}
                        {sessionType === 'ERG' && (
                          <>
                            <div>
                              <label className="block text-xs text-txt-muted mb-1">
                                Target Split (sec/500m)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                {...register(`pieces.${piece.index}.targetSplit`, {
                                  valueAsNumber: true,
                                })}
                                placeholder="105"
                                className="w-full px-3 py-2 rounded-lg bg-bg-surface-elevated border border-bdr-default
                                  text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-txt-muted mb-1">
                                Target Rate (spm)
                              </label>
                              <input
                                type="number"
                                {...register(`pieces.${piece.index}.targetRate`, {
                                  valueAsNumber: true,
                                })}
                                placeholder="24"
                                className="w-full px-3 py-2 rounded-lg bg-bg-surface-elevated border border-bdr-default
                                  text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                              />
                            </div>
                          </>
                        )}

                        {/* Notes */}
                        <div className="md:col-span-2">
                          <label className="block text-xs text-txt-muted mb-1">Notes</label>
                          <input
                            {...register(`pieces.${piece.index}.notes`)}
                            placeholder="Rest 3' between pieces"
                            className="w-full px-3 py-2 rounded-lg bg-bg-surface-elevated border border-bdr-default
                              text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-interactive-primary"
                          />
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => remove(piece.index)}
                        className="mt-2 p-1.5 rounded-lg text-txt-muted hover:text-data-poor hover:bg-data-poor/10 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}

                {/* Add piece button */}
                <button
                  type="button"
                  onClick={() => addPiece(segment.value)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-bdr-default
                    text-txt-muted hover:text-interactive-primary hover:border-interactive-primary transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add {segment.label} Piece
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
