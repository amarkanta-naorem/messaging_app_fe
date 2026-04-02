import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

interface UseDropdownOptions {
  /** Called when the dropdown should close (Escape, outside click) */
  onClose?: () => void;
  /** Number of child items for arrow-key wrapping */
  itemCount: number;
}

interface UseDropdownReturn {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Toggle open/close */
  toggle: () => void;
  /** Open the dropdown */
  open: () => void;
  /** Close the dropdown */
  close: () => void;
  /** Currently focused item index (-1 = none) */
  focusedIndex: number;
  /** Reset focused index */
  resetFocus: () => void;
  /** Ref to attach to the trigger button */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Ref to attach to the dropdown container */
  dropdownRef: RefObject<HTMLUListElement | null>;
  /** Key-down handler for the trigger button */
  handleTriggerKeyDown: (e: KeyboardEvent) => void;
  /** Key-down handler for the dropdown list */
  handleDropdownKeyDown: (e: KeyboardEvent) => void;
  /** ARIA id for the dropdown list */
  listboxId: string;
}

export function useDropdown({
  onClose,
  itemCount,
}: UseDropdownOptions): UseDropdownReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const listboxId = useId();

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    onClose?.();
    triggerRef.current?.focus();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const resetFocus = useCallback(() => setFocusedIndex(-1), []);

  // Click-outside handler
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  // Focus the active item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex < 0 || !dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll<HTMLElement>(
      "[data-dropdown-item]"
    );
    items[focusedIndex]?.focus();
  }, [focusedIndex]);

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) open();
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) open();
          setFocusedIndex(Math.max(0, itemCount - 1));
          break;
        case "Escape":
          if (isOpen) {
            e.preventDefault();
            close();
          }
          break;
      }
    },
    [isOpen, open, close, itemCount]
  );

  const handleDropdownKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % itemCount);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(itemCount - 1);
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "Tab":
          close();
          break;
      }
    },
    [itemCount, close]
  );

  return {
    isOpen,
    toggle,
    open,
    close,
    focusedIndex,
    resetFocus,
    triggerRef,
    dropdownRef,
    handleTriggerKeyDown,
    handleDropdownKeyDown,
    listboxId,
  };
}
