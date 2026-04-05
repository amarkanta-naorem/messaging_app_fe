"use client";

import { FormField } from "./FormField";
import { ChevronDown, Search, Loader2, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";

type SearchableDropdownProps<T extends string | number> = {
  label: string;
  value: T | "";
  onChange: (value: T) => void;
  options: T[];
  placeholder?: string;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  getDisplayValue: (option: T) => string;
  getSearchValue: (option: T) => string;
  icon?: React.ReactNode;
  /** Whether to show the search input in the dropdown. Defaults to true. */
  searchable?: boolean;
}

export function SearchableDropdown<T extends string | number>({ label, value, onChange, options, placeholder = "Select an option", loading = false, error = false, errorMessage, disabled = false, getDisplayValue, getSearchValue, icon, searchable = true }: SearchableDropdownProps<any>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) => getSearchValue(option).toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedLabel = value ? getDisplayValue(value) : "";

  const handleSelect = useCallback(
    (option: T) => {
      onChange(option);
      setIsOpen(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
      if (disabled || loading) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen) {
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
              handleSelect(filteredOptions[highlightedIndex]);
            } else {
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case "Home":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex(0);
          }
          break;
        case "End":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex(filteredOptions.length - 1);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(-1);
          break;
        case "Tab":
          if (isOpen) {
            setIsOpen(false);
            setSearchQuery("");
            setHighlightedIndex(-1);
          }
          break;
      }
    },
    [disabled, loading, isOpen, highlightedIndex, filteredOptions, handleSelect]
  );

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current && dropdownMenuRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect();
      const menuRect = dropdownMenuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const menuHeight = menuRect.height;
      
      // If there's not enough space below but there is enough space above, position on top
      if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  return (
    <FormField label={label} error={errorMessage} icon={icon}>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${label.toLowerCase().replace(/\s+/g, "-")}-list`}
          aria-label={label}
          className={`w-full px-4 py-3 rounded-xl border text-left text-sm transition-all duration-200 flex items-center justify-between gap-2 bg-(--bg-input) text-(--text-primary)
            ${error ? "border-red-400 focus-within:ring-red-500/20 focus-within:border-red-500" : "border-(--border-primary) focus-within:ring-(--accent-primary)/20 focus-within:border-(--accent-primary)"}
            ${disabled || loading ? "bg-(--bg-tertiary) text-(--text-muted) cursor-not-allowed opacity-60" : "hover:border-(--border-secondary) cursor-pointer"}
            ${selectedLabel ? "" : "text-(--text-muted)"}
          `}
        >
          <span className="truncate flex items-center gap-2">{selectedLabel || placeholder}</span>
          {loading ? (
            <Loader2 className="h-4 w-4 text-(--text-muted) shrink-0 animate-spin" />
          ) : (
            <ChevronDown className={`h-4 w-4 text-(--text-muted) shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          )}
        </button>

        {isOpen && !disabled && !loading && (
          <div ref={dropdownMenuRef} className={`absolute z-60 w-full bg-(--bg-card) border border-(--border-primary) rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5 ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
            {searchable && (
              <div className="p-2 border-b border-(--border-primary)/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedIndex(0);
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedIndex(filteredOptions.length - 1);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setIsOpen(false);
                        setSearchQuery("");
                      } else if (e.key === "Enter" && searchQuery && filteredOptions.length > 0) {
                        e.preventDefault();
                        handleSelect(filteredOptions[0]);
                      }
                    }}
                    placeholder="Type to search..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-(--border-secondary) text-sm bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) transition-all duration-150"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <ul ref={listRef} id={`${label.toLowerCase().replace(/\s+/g, "-")}-list`} role="listbox" className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-3 text-sm text-(--text-muted) text-center flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  No options found
                </li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li
                    key={option as unknown as string}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2.5 text-sm cursor-pointer transition-all duration-150 flex items-center justify-between gap-2
                      ${index === highlightedIndex ? "bg-(--accent-primary)/10 text-(--accent-primary)" : "text-(--text-primary) hover:bg-(--bg-hover)"}
                      ${getDisplayValue(option) === selectedLabel ? "bg-(--accent-primary)/10 text-(--accent-primary)" : ""}
                    `}
                  >
                    <span className="truncate flex-1">{getDisplayValue(option)}</span>
                    {getDisplayValue(option) === selectedLabel && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-(--accent-primary)">
                        <Check className="h-3 w-3 text-(--text-inverse)" />
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </FormField>
  );
}