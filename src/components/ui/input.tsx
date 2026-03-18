/**
 * Reusable Input component with consistent styling.
 */

import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error = false, errorMessage, required = false, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-(--text-primary) mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm bg-(--bg-input) text-(--text-primary)
            focus:outline-none focus:ring-2 transition-all
            placeholder:text-(--text-muted)
            ${error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-(--border-primary) focus:ring-emerald-500/20 focus:border-emerald-500"}
            disabled:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:text-(--text-muted)
            ${className}
          `}
          {...props}
        />
        {errorMessage && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
