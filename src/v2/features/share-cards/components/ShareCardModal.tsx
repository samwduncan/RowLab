/**
 * ShareCardModal - Modal wrapper for share card preview flow
 * Phase 38-07
 *
 * Features:
 * - Modal overlay with ShareCardPreview
 * - Responsive: slide up on mobile, center on desktop
 * - Uses CanvasModal for consistent styling
 */

import { CanvasModal } from '@v2/components/canvas';
import { ShareCardPreview } from './ShareCardPreview';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  cardType?: string;
}

/**
 * ShareCardModal - Main modal component
 */
export function ShareCardModal({
  isOpen,
  onClose,
  workoutId,
  cardType = 'erg_summary',
}: ShareCardModalProps) {
  return (
    <CanvasModal isOpen={isOpen} onClose={onClose} title="Share Workout" size="lg">
      <div className="mt-4">
        <ShareCardPreview workoutId={workoutId} cardType={cardType} />
      </div>
    </CanvasModal>
  );
}
