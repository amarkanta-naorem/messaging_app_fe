"use client";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="phone" className="text-sm font-medium">
        Phone Number
      </label>
      <input
        id="phone"
        type="tel"
        placeholder="+1 234 567 8900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-describedby="phone-hint"
      />
    </div>
  );
}
