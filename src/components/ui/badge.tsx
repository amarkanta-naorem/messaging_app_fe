/**
 * Badge component for displaying counts and status indicators.
 */

import { ReactNode } from "react";

export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Badge variant */
  variant?: "default" | "success" | "warning" | "danger" | "primary";
  /** Size of the badge */
  size?: "sm" | "md";
  /** Whether to use pill/rounded style */
  pill?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const variantClasses = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  success: "bg-[var(--color-success)]/20 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]",
  danger: "bg-[var(--color-error)]/20 text-[var(--color-error)]",
  primary: "bg-[var(--accent-primary)] text-[var(--text-inverse)]",
};

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5 min-w-[18px] h-[18px]",
  md: "text-xs px-2 py-1 min-w-[20px] h-5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  pill = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pill ? "rounded-full" : "rounded"}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
