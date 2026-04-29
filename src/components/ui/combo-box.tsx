import { Search, X, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";

export interface ComboBoxOption {
  value: string;
  label: string;
  avatar?: string;
  subtitle?: string;
}

export interface ComboBoxProps {
  options: ComboBoxOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  maxItems?: number;
}

export function ComboBox({ options, selectedValues, onSelectionChange, placeholder = "Select options...", searchPlaceholder = "Search...", emptyMessage = "No options found.", disabled = false, className = "", maxItems }: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = options.filter((option) => !selectedValues.includes(option.value) && (option.label.toLowerCase().includes(searchQuery.toLowerCase()) || option.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())));
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      setSearchQuery("");
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    if (maxItems && selectedValues.length >= maxItems && !selectedValues.includes(value)) {
      return;
    }
    
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onSelectionChange(selectedValues.filter((v) => v !== value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && searchQuery === "" && selectedValues.length > 0) {
      onSelectionChange(selectedValues.slice(0, -1));
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <div onClick={handleToggle} className={`min-h-11 w-full px-3 py-2 rounded-lg border bg-(--bg-input) border-(--border-primary) cursor-text transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-(--border-secondary)"} ${isOpen ? "border-(--accent-primary) ring-2 ring-(--accent-primary)/20" : ""} flex flex-wrap items-center gap-1.5`}>
        {selectedOptions.map((option) => (
          <span key={option.value} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--accent-muted) text-(--text-primary) rounded-full text-sm font-medium animate-in fade-in-0 zoom-in-95 duration-100">
            {option.avatar && (
              <img src={option.avatar} alt={option.label} className="w-5 h-5 rounded-full object-cover"/>
            )}
            {option.label}
            <button onClick={(e) => handleRemove(e, option.value)} className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors" aria-label={`Remove ${option.label}`}>
              <X size={12} />
            </button>
          </span>
        ))}

        <input ref={inputRef} type="text" value={searchQuery} onChange={handleSearchChange} placeholder={selectedValues.length === 0 ? placeholder : ""} className={`flex-1 min-w-30 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)`} disabled={disabled}/>
        <ChevronDown size={16} className={`text-(--text-muted) transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}/>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-(--bg-card) border border-(--border-primary) rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-100" role="listbox" >
          <div className="sticky top-0 bg-(--bg-card) border-b border-(--border-primary) p-2">
            <div className="relative">
              <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
              <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder={searchPlaceholder} autoFocus className="w-full pl-8 pr-3 py-1.5 text-sm bg-(--bg-input) border border-(--border-primary) rounded-md outline-none focus:border-(--accent-primary) focus:ring-1 focus:ring-(--accent-primary) text-(--text-primary) placeholder:text-(--text-muted)"/>
            </div>
          </div>

          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li key={option.value}>
                  <button onClick={() => handleSelect(option.value)} className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-(--bg-hover) transition-colors duration-150 group" role="option" aria-selected={selectedValues.includes(option.value)}>
                    {option.avatar ? (
                      <img src={option.avatar} alt={option.label} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-(--bg-tertiary) flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-(--text-secondary)">{option.label.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-(--text-primary)">{option.label}</div>
                      {option.subtitle && (
                        <div className="text-xs text-(--text-muted) truncate">{option.subtitle}</div>
                      )}
                    </div>
                    <Check size={16} className={`shrink-0 transition-opacity duration-150 ${selectedValues.includes(option.value) ? "text-(--accent-primary) opacity-100" : "opacity-0 group-hover:opacity-50"}`}/>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-(--text-muted)">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComboBox;