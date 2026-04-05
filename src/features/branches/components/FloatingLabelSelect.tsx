"use client";

import { AlertCircle, ChevronDown } from "lucide-react";

export interface FloatingLabelSelectProps<T extends string | number> {
  id: string;
  label: string;
  value: T | "";
  onChange: (value: T) => void;
  options: T[];
  getDisplayValue: (option: T) => string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FloatingLabelSelect<T extends string | number>({ id, label, value, onChange, options, getDisplayValue, placeholder = "Select an option", required, error, disabled = false, hint, icon, className = "" }: FloatingLabelSelectProps<T>) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  const hasError = !!error;

  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`
          peer w-full px-4 py-3 pt-5 pb-2 rounded-xl border text-sm transition-all duration-200
          bg-(--bg-input) text-(--text-primary)
          focus:outline-none focus:ring-2 focus:ring-offset-0
          appearance-none cursor-pointer
          ${hasError ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-(--border-primary) focus:ring-(--accent-primary)/20 focus:border-(--accent-primary)"}
          ${disabled ? "bg-(--bg-tertiary) text-(--text-muted) cursor-not-allowed opacity-60" : "hover:border-(--border-secondary)"}
          ${icon ? "pl-10 pr-10" : "pr-10"}
        `}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option as unknown as string} value={option as unknown as string}>{getDisplayValue(option)}</option>
        ))}
      </select>

      <label
        htmlFor={id}
        data-floating={hasValue}
        className={`
          absolute transition-all duration-200 pointer-events-none
          text-(--text-muted) text-sm
          ${icon ? "left-10" : "left-4"}
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-(--accent-primary)
          ${hasValue ? "top-2 text-xs text-(--text-primary)" : "top-1/2 -translate-y-1/2 text-sm"}
          ${hasError ? "peer-focus:text-red-400" + (hasValue ? " text-red-400" : ""): ""}
          ${disabled ? "text-(--text-muted)/60" + (hasValue ? " text-(--text-muted)/60" : ""): ""}
          ${icon ? "peer-focus:left-10" + (hasValue ? " left-10" : ""): "peer-focus:left-4" + (hasValue ? " left-4" : "")}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Icon */}
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--text-muted)">{icon}</div>
      )}

      {/* Chevron dropdown indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className={`h-4 w-4 text-(--text-muted) transition-transform duration-200 ${disabled ? "opacity-50" : ""}`} />
      </div>

      {/* Error message */}
      {hasError && (
        <div id={`${id}-error`} className="flex items-center gap-1.5 mt-1.5" role="alert">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      )}

      {/* Hint text */}
      {!hasError && hint && (
        <p id={`${id}-hint`} className="text-(--text-muted) text-xs mt-1.5">{hint}</p>
      )}
    </div>
  );
}

export interface FloatingStatusSelectProps<T extends string = string> {
  id: string;
  label?: string;
  value: T | "";
  onChange: (value: T) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
  options?: T[];
}

export function FloatingStatusSelect<T extends string = string>({ id, label = "Status", value, onChange, required, error, disabled = false, hint, icon, className = "", options = ["active", "inactive", "closed"] as T[] }: FloatingStatusSelectProps<T>) {
  const getDisplayValue = (status: T) => {
    return (status as string).charAt(0).toUpperCase() + (status as string).slice(1);
  };

  return (
    <FloatingLabelSelect
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      getDisplayValue={getDisplayValue}
      placeholder="Select status"
      required={required}
      error={error}
      disabled={disabled}
      hint={hint}
      icon={icon}
      className={className}
    />
  );
}
