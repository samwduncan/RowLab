import { useDroppable } from '@dnd-kit/core';
import { User } from 'lucide-react';

interface Athlete {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  side?: string;
}

interface SeatSlotProps {
  boatId: string;
  seatNumber: number;
  athlete: Athlete | null;
  side: string;
  isCoxswain?: boolean;
}

export default function SeatSlot({
  boatId,
  seatNumber,
  athlete,
  side,
  isCoxswain = false,
}: SeatSlotProps) {
  const droppableId = isCoxswain ? `${boatId}-cox` : `${boatId}-seat-${seatNumber}`;

  const { setNodeRef, isOver, active } = useDroppable({
    id: droppableId,
    data: {
      type: 'seat',
      boatId,
      seatNumber,
      isCoxswain,
    },
  });

  const isEmpty = !athlete;
  const canDrop = isOver && active;

  const getSeatLabel = () => {
    if (isCoxswain) return 'C';
    if (seatNumber === 1) return 'B';
    return seatNumber.toString();
  };

  const getAthleteName = () => {
    if (!athlete) return '';
    return athlete.name ||
      `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() ||
      'Unknown';
  };

  const getInitials = () => {
    if (!athlete) return '';
    if (athlete.name) {
      return athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    }
    return `${athlete.firstName?.[0] || ''}${athlete.lastName?.[0] || ''}`;
  };

  return (
    <div
      ref={setNodeRef}
      className={`seat ${isEmpty ? 'empty' : ''} ${canDrop ? 'drop-target' : ''}`}
    >
      {/* Seat number */}
      <div className={`seat-number ${isCoxswain ? 'cox' : side}`}>
        {getSeatLabel()}
      </div>

      {isEmpty ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <User size={16} />
          <span className="text-sm">{isCoxswain ? 'Coxswain' : 'Empty seat'}</span>
        </div>
      ) : (
        <>
          <span className="seat-name">{getAthleteName()}</span>
          {!isCoxswain && athlete?.side && (
            <span className="seat-meta capitalize">{athlete.side}</span>
          )}
        </>
      )}
    </div>
  );
}
