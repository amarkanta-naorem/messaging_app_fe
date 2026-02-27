"use client";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  return (
    <div className="form-field">
      <label htmlFor="phone" className="form-label" style={{ color: '#334155' }}>
        Phone Number
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <input
          id="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="premium-input premium-input-with-icon"
          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
        />
      </div>
      <p className="text-sm text-slate-500 mt-1.5">We'll send a verification code to this number</p>
    </div>
  );
}
