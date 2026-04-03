import { Check, Loader2 } from "lucide-react";

interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    locationLocked: boolean;
    postalLoading: boolean;
  }

export const LocationInput = ({ value, onChange, placeholder, locationLocked, postalLoading }: LocationInputProps) => (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={locationLocked}
        disabled={locationLocked && postalLoading}
        placeholder={locationLocked ? "Auto-filled" : placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200
          ${locationLocked ? "cursor-not-allowed bg-(--bg-tertiary) text-(--text-muted) opacity-60" : "bg-(--bg-input) text-(--text-primary) hover:border-(--border-secondary) cursor-text"}
          ${postalLoading ? "bg-(--color-warning)/10 border-(--color-warning) text-(--color-warning)" : value && !locationLocked ? "border-(--accent-primary) bg-(--accent-primary)/5 dark:bg-(--accent-primary)/10" : "border-(--border-primary)"}
          placeholder:text-(--text-muted)
        `}
        aria-busy={postalLoading}
      />
      {postalLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Loader2 className="h-4 w-4 text-(--color-warning) animate-spin" />
        </div>
      )}
      {!postalLoading && value && locationLocked && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-5 h-5 rounded-full bg-(--accent-primary) flex items-center justify-center">
            <Check className="h-3 w-3 text-(--text-inverse)" />
          </div>
        </div>
      )}
    </div>
  );