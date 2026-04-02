/**
 * Reusable ConfirmDialog component for delete confirmations and similar actions.
 */

import { Button } from "./button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-(--overlay-bg) backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-(--bg-card) rounded-xl shadow-2xl border border-(--border-primary) animate-slide-in">
        <div className="p-6">
          <h3 id="confirm-title" className="font-semibold text-(--text-primary) text-lg mb-2">{title}</h3>
          <p className="text-(--text-secondary) text-sm mb-6">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
