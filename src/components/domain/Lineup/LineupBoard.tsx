import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { Plus, X, Users, Ship } from 'lucide-react';
import BoatColumn from '../Boat/BoatColumn';
import AthleteBankPanel from '../Athlete/AthleteBankPanel';
import useLineupStore from '../../../store/lineupStore';

interface Athlete {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  side?: string;
  ergScore?: number;
}

export default function LineupBoard() {
  const {
    activeBoats,
    boatConfigs,
    addBoat,
    removeBoat,
    assignToSeat,
    assignToCoxswain,
  } = useLineupStore();

  const [athletePanelOpen, setAthletePanelOpen] = useState(false);
  const [showBoatPicker, setShowBoatPicker] = useState(false);
  const [draggedAthlete, setDraggedAthlete] = useState<Athlete | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'athlete') {
      setDraggedAthlete(active.data.current.athlete);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDraggedAthlete(null);

      if (!over || !active.data.current) return;

      const draggedData = active.data.current;
      const dropData = over.data.current;

      if (draggedData.type === 'athlete' && dropData?.type === 'seat') {
        const athlete = draggedData.athlete;
        const { boatId, seatNumber, isCoxswain } = dropData;

        if (isCoxswain) {
          assignToCoxswain(boatId, athlete);
        } else {
          assignToSeat(boatId, seatNumber, athlete);
        }
      }
    },
    [assignToSeat, assignToCoxswain]
  );

  const handleAddBoat = useCallback(
    (boatType: string) => {
      const config = boatConfigs.find((c: any) => c.name.endsWith(boatType));
      if (config) {
        addBoat(config, undefined);
      } else {
        const numSeats = parseInt(boatType.replace(/[^\d]/g, '')) || 8;
        const hasCoxswain = boatType.includes('+');
        addBoat({ id: `config-${Date.now()}`, name: boatType, numSeats, hasCoxswain }, undefined);
      }
      setShowBoatPicker(false);
    },
    [boatConfigs, addBoat]
  );

  const filledSeats = activeBoats.reduce((acc, boat) => {
    const rowers = boat.seats?.filter((s: any) => s?.athlete !== null).length || 0;
    return acc + rowers + (boat.coxswain ? 1 : 0);
  }, 0);

  const totalSeats = activeBoats.reduce((acc, boat) => {
    return acc + (boat.numSeats || 0) + (boat.hasCoxswain ? 1 : 0);
  }, 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-3 p-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            {activeBoats.length > 0 && (
              <span className="text-sm text-[var(--text-secondary)]">
                {filledSeats}/{totalSeats} seats filled
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBoatPicker(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Boat</span>
            </button>
            <button
              onClick={() => setAthletePanelOpen(!athletePanelOpen)}
              className={`btn ${athletePanelOpen ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Users size={16} />
              <span className="hidden sm:inline">Athletes</span>
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="lineup-board">
          <AnimatePresence mode="popLayout">
            {activeBoats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state flex-1"
              >
                <div className="empty-state-icon">
                  <Ship size={48} />
                </div>
                <h2 className="empty-state-title">No boats yet</h2>
                <p className="empty-state-text">
                  Add a boat to start building your lineup
                </p>
                <button
                  onClick={() => setShowBoatPicker(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  Add Boat
                </button>
              </motion.div>
            ) : (
              <>
                {activeBoats.map((boat: any, index: number) => (
                  <BoatColumn
                    key={boat.id}
                    boat={boat}
                    index={index}
                    onRemove={() => removeBoat(boat.id)}
                  />
                ))}
                <button
                  onClick={() => setShowBoatPicker(true)}
                  className="add-boat"
                >
                  <Plus size={24} />
                  <span className="text-sm">Add Boat</span>
                </button>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Athlete Panel */}
        <AthleteBankPanel
          isOpen={athletePanelOpen}
          onClose={() => setAthletePanelOpen(false)}
        />

        {/* Boat Picker Modal */}
        <AnimatePresence>
          {showBoatPicker && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 modal-backdrop z-50"
                onClick={() => setShowBoatPicker(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm modal p-6 z-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Add Boat</h2>
                  <button
                    onClick={() => setShowBoatPicker(false)}
                    className="btn-icon"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['8+', '4+', '4x', '4-', '2x', '2-', '1x'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAddBoat(type)}
                      className="btn btn-secondary py-3 text-base"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedAthlete && (
          <div className="athlete-card dragging">
            <div className="athlete-avatar">
              {draggedAthlete.firstName?.[0] || draggedAthlete.name?.[0] || '?'}
            </div>
            <span className="athlete-name">
              {draggedAthlete.name ||
                `${draggedAthlete.firstName || ''} ${draggedAthlete.lastName || ''}`.trim()}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
