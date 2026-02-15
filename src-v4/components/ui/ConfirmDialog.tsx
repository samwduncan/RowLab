/**
 * Confirmation dialog for destructive or warning actions.
 * Composes Dialog component with danger/warning variant styling.
 * Loading state uses shimmer, NEVER a spinner.
 */

import { Dialog } from './Dialog';
import { Button } from './Button';

type ConfirmVariant = 'danger' | 'warning';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: ConfirmVariant;
}

const variantStyles: Record<ConfirmVariant, string> = {
  danger: 'bg-data-poor text-ink-deep hover:bg-data-poor/90',
  warning: 'bg-data-warning text-ink-deep hover:bg-data-warning/90',
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`
            inline-flex items-center justify-center
            h-10 px-4 text-sm font-medium rounded-xl
            transition-all duration-150 ease-out
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-data-poor/60
            disabled:opacity-50 disabled:pointer-events-none
            cursor-pointer
            ${variantStyles[variant]}
          `.trim()}
        >
          {loading ? (
            <span className="h-4 w-16 bg-ink-deep/20 animate-shimmer rounded-sm" />
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Dialog>
  );
}
