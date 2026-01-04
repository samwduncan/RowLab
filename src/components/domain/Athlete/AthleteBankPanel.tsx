import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { Search, X, User } from 'lucide-react';
import useLineupStore from '../../../store/lineupStore';

interface Athlete {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  side?: string;
  position?: string;
}

interface AthleteBankPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function AthleteCard({ athlete, isAssigned }: { athlete: Athlete; isAssigned: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `athlete-${athlete.id}`,
    data: { type: 'athlete', athlete },
    disabled: isAssigned,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const name = athlete.name ||
    `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || 'Unknown';

  const initials = athlete.name
    ? athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : `${athlete.firstName?.[0] || ''}${athlete.lastName?.[0] || ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`athlete-card ${isAssigned ? 'assigned' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="athlete-avatar">{initials}</div>
      <span className="athlete-name">{name}</span>
      {athlete.side && (
        <span className="athlete-info capitalize">{athlete.side}</span>
      )}
    </div>
  );
}

export default function AthleteBankPanel({ isOpen, onClose }: AthleteBankPanelProps) {
  const { athletes, activeBoats } = useLineupStore();
  const [searchQuery, setSearchQuery] = useState('');

  const assignedAthleteIds = useMemo(() => {
    const ids = new Set<string>();
    activeBoats.forEach((boat: any) => {
      boat.seats?.forEach((seat: any) => {
        if (seat?.athlete?.id) ids.add(seat.athlete.id);
      });
      if (boat.coxswain?.id) ids.add(boat.coxswain.id);
    });
    return ids;
  }, [activeBoats]);

  const filteredAthletes = useMemo(() => {
    if (!searchQuery) return athletes;
    const query = searchQuery.toLowerCase();
    return athletes.filter((athlete: Athlete) => {
      const name = athlete.name ||
        `${athlete.firstName || ''} ${athlete.lastName || ''}`;
      return name.toLowerCase().includes(query);
    });
  }, [athletes, searchQuery]);

  const availableCount = filteredAthletes.filter(
    (a: Athlete) => !assignedAthleteIds.has(a.id)
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - mobile only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-40 sm:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="athlete-panel"
          >
            {/* Header */}
            <div className="athlete-panel-header">
              <div>
                <h2 className="athlete-panel-title">Athletes</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {availableCount} available
                </p>
              </div>
              <button onClick={onClose} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--border)]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="input pl-9"
                />
              </div>
            </div>

            {/* List */}
            <div className="athlete-list">
              {filteredAthletes.length === 0 ? (
                <div className="empty-state">
                  <User size={32} className="empty-state-icon" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No athletes found
                  </p>
                </div>
              ) : (
                filteredAthletes.map((athlete: Athlete) => (
                  <AthleteCard
                    key={athlete.id}
                    athlete={athlete}
                    isAssigned={assignedAthleteIds.has(athlete.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
