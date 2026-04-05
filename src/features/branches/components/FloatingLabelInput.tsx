"use client";

import { AlertCircle } from "lucide-react";

export interface FloatingLabelInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: "text" | "email" | "tel" | "password" | "number" | "url";
  disabled?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FloatingLabelInput({ id, label, value, onChange, required, error, type = "text", disabled = false, hint, icon, className = "" }: FloatingLabelInputProps) {
  const hasValue = value.length > 0;
  const hasError = !!error;

  const labelPositionClasses = hasValue ? "top-2 text-xs text-(--text-primary)" : "top-1/2 -translate-y-1/2 text-sm text-(--text-muted)";

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`
          w-full px-4 py-3 pt-5 pb-2 rounded-xl border text-sm transition-all duration-200
          bg-(--bg-input) text-(--text-primary) 
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${hasError ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-(--border-primary) focus:ring-(--accent-primary)/20 focus:border-(--accent-primary)"}
          ${disabled ? "bg-(--bg-tertiary) text-(--text-muted) cursor-not-allowed opacity-60" : "hover:border-(--border-secondary)"}
          ${icon ? "pl-10" : ""}
        `}
      />

      <label
        htmlFor={id}
        className={`
          absolute transition-all duration-200 pointer-events-none
          ${icon ? "left-10" : "left-4"}
          ${hasValue ? "text-(--text-primary)" : "text-(--text-muted)"}
          ${hasValue ? (icon ? "left-10" : "left-4") : (icon ? "left-10" : "left-4")}
          ${hasError ? "text-red-400" : ""}
          ${disabled ? "text-(--text-muted)/60" : ""}
          ${labelPositionClasses}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Icon */}
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--text-muted)">{icon}</div>
      )}


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

export function FloatingEmailInput({ id, label = "Email", value, onChange, required, error, disabled = false, hint, icon, className = "" }: Omit<FloatingLabelInputProps, "type" | "label"> & { label?: string }) {
  return (
    <FloatingLabelInput
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      type="email"
      disabled={disabled}
      hint={hint}
      icon={icon}
      className={className}
    />
  );
}

export function FloatingPhoneInput({ id, label = "Phone", value, onChange, required, error, disabled = false, hint, icon, className = "" }: Omit<FloatingLabelInputProps, "type" | "label"> & { label?: string }) {
  return (
    <FloatingLabelInput
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      type="tel"
      disabled={disabled}
      hint={hint}
      icon={icon}
      className={className}
    />
  );
}