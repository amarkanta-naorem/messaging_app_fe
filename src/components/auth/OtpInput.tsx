"use client";

import React from "react";
import { OtpDigit } from "./OtpDigit";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, disabled }) => {
  const handleChange = (index: number, digit: string) => {
    const digits = value.padEnd(6, "").split("").slice(0, 6);
    digits[index] = digit;
    onChange(digits.join(""));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    // Extract only digits from pasted content
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      onChange(digits);
      // Focus the last filled input or the first empty input
      const inputs = document.querySelectorAll('.otp-input');
      const focusIndex = Math.min(digits.length, 5);
      const inputToFocus = inputs[focusIndex] as HTMLInputElement;
      if (inputToFocus) {
        inputToFocus.focus();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2.5" onPaste={handlePaste}>
      <label className="form-label" style={{ color: '#334155' }}>Verification Code</label>
      <div className="flex gap-2.5 justify-center">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <OtpDigit
            key={index}
            value={value[index] || ""}
            onChange={(digit) => handleChange(index, digit)}
            disabled={disabled}
            isFirst={index === 0}
            isLast={index === 5}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-slate-500 mt-2">
        Enter the 6-digit code sent to your phone
      </p>
    </div>
  );
};

export default OtpInput;
