import { ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef, ReactNode } from "react";

interface DropdownProps {
  children: ReactNode;
  trigger: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

interface DropdownSeparatorProps {
  className?: string;
}

interface DropdownLabelProps {
  children: ReactNode;
  className?: string;
}

export function Dropdown({ children, trigger, open: controlledOpen, onOpenChange, className = "", align = "start", side = "bottom" }: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const toggle = () => handleOpenChange(!isOpen);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        handleOpenChange(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const alignClass = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" }[align];
  const sideClass = { top: "bottom-full mb-2", right: "left-full ml-2", bottom: "top-full mt-2", left: "right-full mr-2" }[side];

  return (
    <div className="relative inline-block">
      <button ref={triggerRef} onClick={toggle} aria-haspopup="menu" aria-expanded={isOpen} className="flex items-center gap-2">
        {trigger}
        <ChevronDown size={16} className="text-(--text-muted)" />
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={`absolute z-50 min-w-32 bg-(--bg-card) border border-(--border-primary) rounded-lg shadow-lg p-1 animate-in fade-in-0 zoom-in-95 duration-100 ${alignClass} ${sideClass} ${className}`} role="menu">{children}</div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onSelect, disabled = false, className = "" }: DropdownItemProps) {
  return (
    <button
      onClick={() => {
        if (!disabled) {
          onSelect?.();
        }
      }}
      disabled={disabled}
      className={`flex items-center justify-between w-full px-2 py-1.5 text-sm text-(--text-primary) rounded-md cursor-pointer hover:bg-(--bg-hover) focus:bg-(--bg-hover) focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : "hover:text-(--text-primary)"} ${className}`}
      role="menuitem"
    >
      <span>{children}</span>
      <Check size={16} className="text-(--text-muted) opacity-0 group-hover:opacity-100" />
    </button>
  );
}

export function DropdownSeparator({ className = "" }: DropdownSeparatorProps) {
  return <hr className={`my-1 border-(--border-primary) ${className}`} />;
}

export function DropdownLabel({ children, className = "" }: DropdownLabelProps) {
  return (
    <div className={`px-2 py-1.5 text-xs font-semibold text-(--text-muted) uppercase tracking-wide ${className}`}>{children}</div>
  );
}

export default Dropdown;