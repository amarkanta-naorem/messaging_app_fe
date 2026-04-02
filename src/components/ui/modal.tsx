/**
 * Reusable Modal component for displaying content in an overlay.
 */

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg", showCloseButton = true }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-(--overlay-bg) backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-(--bg-card) rounded-xl shadow-2xl border border-(--border-primary) flex flex-col max-h-[90vh] animate-slide-in`}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-(--border-primary) shrink-0">
            <h3 className="font-semibold text-(--text-primary) text-lg">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors text-(--text-secondary) cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
