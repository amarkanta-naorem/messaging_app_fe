"use client";

import { Check } from "lucide-react";
import { FormField } from "./FormField";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  hint?: string;
}

export function InputField({ label, value, onChange, placeholder, required, error, type = "text", icon, disabled, hint }: InputFieldProps) {
  return (
    <FormField label={label} required={required} error={error} icon={icon} hint={hint}>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200
            bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted)
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-(--border-primary) focus:ring-(--accent-primary)/20 focus:border-(--accent-primary)"}
            ${disabled ? "bg-(--bg-tertiary) text-(--text-muted) cursor-not-allowed opacity-60" : "hover:border-(--border-secondary)"}
          `}
        />
        {value && !disabled && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Check className="h-4 w-4 text-(--accent-primary)" />
          </div>
        )}
      </div>
    </FormField>
  );
}