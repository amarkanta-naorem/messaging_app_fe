/**
 * Reusable Drawer component that slides in from the right.
 */

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export function Drawer({ isOpen, onClose, title, children, className = "", maxWidth = "max-w-md", showCloseButton = true }: DrawerProps) {
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

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-(--overlay-light) backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={onClose}/>

      {/* Drawer */}
      <div className={`absolute inset-y-0 right-0 w-full ${maxWidth} bg-(--bg-card) shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"} ${className}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-(--border-primary) shrink-0">
            <h3 className="font-semibold text-(--text-primary)">{title}</h3>
            {showCloseButton && (
              <button onClick={onClose} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors text-(--text-secondary) cursor-pointer">
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;
