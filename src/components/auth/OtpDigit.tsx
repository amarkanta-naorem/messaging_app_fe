/**
 * OtpDigit - Single digit input for OTP code entry.
 * Handles individual digit input with auto-focus on change.
 */

import { InputHTMLAttributes, forwardRef, useRef, useEffect, useImperativeHandle } from "react";

export interface OtpDigitProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Callback when digit changes */
  onChange: (value: string) => void;
  /** Whether this is the first digit */
  isFirst?: boolean;
  /** Whether this is the last digit */
  isLast?: boolean;
}

export const OtpDigit = forwardRef<HTMLInputElement, OtpDigitProps>(
  ({ onChange, value, disabled, className = "", isFirst, isLast, ...props }, ref) => {
    const localRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digit = e.target.value;
      // Only allow numeric values
      if (!/^\d*$/.test(digit)) return;
      // Take only the last character entered
      const singleDigit = digit.slice(-1);
      onChange(singleDigit);

      // Auto-focus next input when digit is entered
      if (singleDigit && !isLast) {
        const inputs = document.querySelectorAll('.otp-input');
        const currentIndex = Array.from(inputs).indexOf(e.target);
        const nextInput = inputs[currentIndex + 1] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace - focus previous input when current is empty
      if (e.key === 'Backspace' && !value && !isFirst) {
        const inputs = document.querySelectorAll('.otp-input');
        const currentIndex = Array.from(inputs).indexOf(e.target as HTMLInputElement);
        const prevInput = inputs[currentIndex - 1] as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }
      
      // Handle left arrow - focus previous input
      if (e.key === 'ArrowLeft' && !isFirst) {
        const inputs = document.querySelectorAll('.otp-input');
        const currentIndex = Array.from(inputs).indexOf(e.target as HTMLInputElement);
        const prevInput = inputs[currentIndex - 1] as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }

      // Handle right arrow - focus next input
      if (e.key === 'ArrowRight' && !isLast) {
        const inputs = document.querySelectorAll('.otp-input');
        const currentIndex = Array.from(inputs).indexOf(e.target as HTMLInputElement);
        const nextInput = inputs[currentIndex + 1] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select content on focus for easy replacement
      e.target.select();
    };

    // Focus first input on mount
    useEffect(() => {
      if (isFirst && !value && localRef.current) {
        localRef.current.focus();
      }
    }, [isFirst, value]);

    return (
      <input
        ref={localRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value || ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        disabled={disabled}
        className={`
          otp-input
          ${className}
        `}
        style={{ 
          backgroundColor: '#ffffff', 
          borderColor: value ? '#8b5cf6' : '#e2e8f0', 
          color: '#1e293b',
          transition: 'all 0.2s ease'
        }}
        aria-label={`Digit ${props['aria-label']}`}
        {...props}
      />
    );
  }
);

OtpDigit.displayName = "OtpDigit";

export default OtpDigit;
