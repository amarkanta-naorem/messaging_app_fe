"use client";

import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, required, error, icon, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-[--text-primary]">
        {icon && (
          <span className="text-[--text-muted] flex items-center justify-center">{icon}</span>
        )}
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[--text-muted] text-xs mt-1">{hint}</p>
      )}
      {error && (
        <div className="flex items-center gap-1.5 mt-1">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}