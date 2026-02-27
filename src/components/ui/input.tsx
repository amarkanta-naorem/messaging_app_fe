/**
 * Reusable Input component with consistent styling.
 */

import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error state styling */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Input label */
  label?: string;
  /** Whether label is required */
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error = false, 
    errorMessage, 
    required = false,
    className = "",
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
            focus:outline-none focus:ring-2 transition-all
            placeholder:text-[var(--text-muted)]
            ${error 
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" 
              : "border-[var(--border-primary)] focus:ring-emerald-500/20 focus:border-emerald-500"
            }
            disabled:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]
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
