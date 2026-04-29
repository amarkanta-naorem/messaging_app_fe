import { forwardRef, InputHTMLAttributes } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, error = false, errorMessage, className = "", id, disabled, onCheckedChange, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex items-center pt-0.5">
          <input ref={ref} id={switchId} type="checkbox" role="switch" aria-checked={props.checked} disabled={disabled} onChange={(e) => onCheckedChange?.(e.target.checked)} className={`peer sr-only ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`} {...props}/>
          <label htmlFor={switchId} className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${props.checked ? "bg-(--accent-primary)" : "bg-(--bg-tertiary)"} focus-within:outline-none focus-within:ring-2 focus-within:ring-(--accent-primary) focus-within:ring-offset-2`}>
            <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${props.checked ? "translate-x-5" : "translate-x-0"}`}/>
          </label>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label htmlFor={switchId} className={`text-sm font-medium cursor-pointer ${disabled ? "text-(--text-muted)" : "text-(--text-primary)"}`}>{label}</label>
            )}
            {description && (
              <p className={`text-sm ${disabled ? "text-(--text-muted)" : "text-(--text-secondary)"} mt-0.5`}>{description}</p>
            )}
            {error && errorMessage && (
              <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;