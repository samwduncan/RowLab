/**
 * EquipmentPicker - Phase 18 BOAT-03, BOAT-04
 *
 * Shell and oar set picker with availability status and conflict warnings.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { useEquipmentAvailability } from '@v2/hooks/useEquipment';
import type { ShellWithStatus, OarSetWithStatus } from '@v2/types/equipment';

interface EquipmentPickerProps {
  date: string;
  boatClass?: string;
  selectedShellId?: string | null;
  selectedOarSetId?: string | null;
  excludeLineupId?: string;
  onSelectShell: (shellId: string | null, shellName: string | null) => void;
  onSelectOarSet?: (oarSetId: string | null, oarSetName: string | null) => void;
  className?: string;
}

function ShellStatusIcon({ shell }: { shell: ShellWithStatus }) {
  if (shell.conflict) {
    if (shell.conflict.type === 'maintenance') {
      return <Wrench className="h-4 w-4 text-amber-500" />;
    }
    if (shell.conflict.type === 'unavailable') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  if (shell.status === 'AVAILABLE') {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  return null;
}

function ShellCard({
  shell,
  isSelected,
  onSelect,
}: {
  shell: ShellWithStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isUnavailable = ['MAINTENANCE', 'RETIRED'].includes(shell.status);
  const hasConflict = !!shell.conflict;
  const canSelect = !isUnavailable && shell.conflict?.type !== 'unavailable';

  return (
    <button
      onClick={canSelect ? onSelect : undefined}
      disabled={!canSelect}
      className={`
        w-full p-3 rounded-lg border text-left transition-all
        ${
          isSelected
            ? 'border-interactive-primary bg-interactive-primary/10'
            : hasConflict
            ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500'
            : 'border-bdr-default bg-bg-elevated hover:border-bdr-hover'
        }
        ${!canSelect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Ship className="h-5 w-5 text-txt-secondary" />
          <div>
            <p className="font-medium text-txt-primary">{shell.name}</p>
            <p className="text-xs text-txt-tertiary">
              {shell.boatClass} • {shell.weightClass.toLowerCase()}
            </p>
          </div>
        </div>
        <ShellStatusIcon shell={shell} />
      </div>

      {shell.conflict && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {shell.conflict.message}
        </div>
      )}

      {shell.hasRiggingProfile && !shell.conflict && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          Custom rigging saved
        </div>
      )}
    </button>
  );
}

function OarSetCard({
  oarSet,
  isSelected,
  onSelect,
}: {
  oarSet: OarSetWithStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isUnavailable = ['MAINTENANCE', 'RETIRED'].includes(oarSet.status);
  const hasConflict = !!oarSet.conflict;
  const canSelect = !isUnavailable && oarSet.conflict?.type !== 'unavailable';

  return (
    <button
      onClick={canSelect ? onSelect : undefined}
      disabled={!canSelect}
      className={`
        w-full p-3 rounded-lg border text-left transition-all
        ${
          isSelected
            ? 'border-interactive-primary bg-interactive-primary/10'
            : hasConflict
            ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500'
            : 'border-bdr-default bg-bg-elevated hover:border-bdr-hover'
        }
        ${!canSelect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-txt-primary">{oarSet.name}</p>
          <p className="text-xs text-txt-tertiary">
            {oarSet.type.toLowerCase()} • {oarSet.count} oars
          </p>
        </div>
        {hasConflict && <AlertTriangle className="h-4 w-4 text-amber-500" />}
        {!hasConflict && oarSet.status === 'AVAILABLE' && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
      </div>

      {oarSet.conflict && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {oarSet.conflict.message}
        </div>
      )}
    </button>
  );
}

export function EquipmentPicker({
  date,
  boatClass,
  selectedShellId,
  selectedOarSetId,
  excludeLineupId,
  onSelectShell,
  onSelectOarSet,
  className = '',
}: EquipmentPickerProps) {
  const [shellsExpanded, setShellsExpanded] = useState(true);
  const [oarsExpanded, setOarsExpanded] = useState(false);
  const [shellSearch, setShellSearch] = useState('');

  const { data: availability, isLoading } = useEquipmentAvailability(date, excludeLineupId);

  // Filter shells by boat class and search
  const filteredShells = useMemo(() => {
    if (!availability?.shells) return [];

    return availability.shells.filter((shell) => {
      const matchesClass = !boatClass || shell.boatClass === boatClass;
      const matchesSearch =
        !shellSearch ||
        shell.name.toLowerCase().includes(shellSearch.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [availability?.shells, boatClass, shellSearch]);

  // Filter oar sets by type (sweep/scull based on boat class)
  const filteredOarSets = useMemo(() => {
    if (!availability?.oarSets || !boatClass) return availability?.oarSets || [];

    const isScull = boatClass.includes('x') || boatClass === '1x';
    const requiredType = isScull ? 'SCULL' : 'SWEEP';

    return availability.oarSets.filter((oarSet) => oarSet.type === requiredType);
  }, [availability?.oarSets, boatClass]);

  if (isLoading) {
    return (
      <div className={`p-4 bg-bg-elevated rounded-lg border border-bdr-default ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 rounded bg-bg-hover" />
          <div className="h-20 rounded bg-bg-hover" />
          <div className="h-20 rounded bg-bg-hover" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-elevated rounded-lg border border-bdr-default ${className}`}>
      {/* Shells Section */}
      <div className="border-b border-bdr-default">
        <button
          onClick={() => setShellsExpanded(!shellsExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-bg-hover transition-colors"
        >
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-txt-secondary" />
            <span className="font-medium text-txt-primary">
              Shells
              {availability?.conflictCount ? (
                <span className="ml-2 text-xs text-amber-500">
                  {availability.conflictCount} conflicts
                </span>
              ) : null}
            </span>
          </div>
          {shellsExpanded ? (
            <ChevronUp className="h-4 w-4 text-txt-tertiary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-txt-tertiary" />
          )}
        </button>

        <AnimatePresence>
          {shellsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3">
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-tertiary" />
                  <input
                    type="text"
                    value={shellSearch}
                    onChange={(e) => setShellSearch(e.target.value)}
                    placeholder="Search shells..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-bdr-default
                               bg-bg-default focus:outline-none focus:ring-2 focus:ring-interactive-primary"
                  />
                </div>

                {/* Clear selection */}
                {selectedShellId && (
                  <button
                    onClick={() => onSelectShell(null, null)}
                    className="w-full mb-2 p-2 text-sm text-txt-secondary hover:text-txt-primary
                               hover:bg-bg-hover rounded transition-colors"
                  >
                    Clear shell selection
                  </button>
                )}

                {/* Shell list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredShells.map((shell) => (
                    <ShellCard
                      key={shell.id}
                      shell={shell}
                      isSelected={shell.id === selectedShellId}
                      onSelect={() => onSelectShell(shell.id, shell.name)}
                    />
                  ))}
                  {filteredShells.length === 0 && (
                    <p className="text-sm text-txt-tertiary py-4 text-center">
                      No shells found
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Oar Sets Section (optional) */}
      {onSelectOarSet && (
        <div>
          <button
            onClick={() => setOarsExpanded(!oarsExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-bg-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-txt-primary">Oar Sets</span>
            </div>
            {oarsExpanded ? (
              <ChevronUp className="h-4 w-4 text-txt-tertiary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-txt-tertiary" />
            )}
          </button>

          <AnimatePresence>
            {oarsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3">
                  {selectedOarSetId && (
                    <button
                      onClick={() => onSelectOarSet(null, null)}
                      className="w-full mb-2 p-2 text-sm text-txt-secondary hover:text-txt-primary
                                 hover:bg-bg-hover rounded transition-colors"
                    >
                      Clear oar set selection
                    </button>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredOarSets.map((oarSet) => (
                      <OarSetCard
                        key={oarSet.id}
                        oarSet={oarSet}
                        isSelected={oarSet.id === selectedOarSetId}
                        onSelect={() => onSelectOarSet(oarSet.id, oarSet.name)}
                      />
                    ))}
                    {filteredOarSets.length === 0 && (
                      <p className="text-sm text-txt-tertiary py-4 text-center">
                        No oar sets found
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default EquipmentPicker;
