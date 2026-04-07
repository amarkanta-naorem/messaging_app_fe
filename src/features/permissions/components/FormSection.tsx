"use client";

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ children, className = "" }: FormSectionProps) {
  return (
    <div className={`${className}`}>{children}</div>
  );
}