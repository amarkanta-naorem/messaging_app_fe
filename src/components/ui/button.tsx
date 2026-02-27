/**
 * Reusable Button component with various variants and sizes.
 */

import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

const variantClasses = {
  primary: "bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] focus:ring-[var(--accent-primary)]",
  secondary: "bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-active)] focus:ring-[var(--border-secondary)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] focus:ring-[var(--border-secondary)]",
  danger: "bg-[var(--color-error)] text-[var(--text-inverse)] hover:opacity-90 focus:ring-[var(--color-error)]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = "primary", 
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    children,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
