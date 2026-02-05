"use client";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    const digits = value.padEnd(6, "").split("").slice(0, 6);
    digits[index] = digit.slice(-1);
    onChange(digits.join(""));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Verification Code</label>
      <div className="flex gap-2 justify-center">
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[0] || ""}
          onChange={(e) => handleChange(0, e.target.value)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Digit 1"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[1] || ""}
          onChange={(e) => handleChange(1, e.target.value)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Digit 2"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[2] || ""}
          onChange={(e) => handleChange(2, e.target.value)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Digit 3"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[3] || ""}
          onChange={(e) => handleChange(3, e.target.value)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Digit 4"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[4] || ""}
          onChange={(e) => handleChange(4, e.target.value)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Digit 5"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[5] || ""}
          onChange={(e) => handleChange(5, e.target.value)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Digit 6"
        />
      </div>
    </div>
  );
}
