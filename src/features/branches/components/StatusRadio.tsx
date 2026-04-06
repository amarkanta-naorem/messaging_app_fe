import { BadgeAlert, BadgeCheck, BadgeX } from "lucide-react";

interface StatusRadioProps<T extends string> {
  status: T;
  onChange: (status: T) => void;
  options?: T[];
  headquartersValue?: boolean | null;
  label?: string | React.ReactNode;
  error?: string;
}

export default function StatusRadio<T extends string>({ status, onChange, options, headquartersValue, label = "Status", error }: StatusRadioProps<T>) {
  const bothSelected = headquartersValue !== undefined && headquartersValue !== null;
  const statusOptions = options || ["active", "inactive", "closed"] as T[];

  return (
    <div className="bg-(--bg-input) text-(--text-muted) p-2 rounded-xl">
      <legend className="mb-2">{label}</legend>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <ul className={`grid w-full gap-6 ${statusOptions.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {statusOptions.map((option) => (
          <li key={option}>
            <input type="radio" id={`status-${option}`} name="status" value={option} checked={status === option} onChange={() => onChange(option)} className="hidden peer" required/>
            <label htmlFor={`status-${option}`} className={`inline-flex items-center justify-between w-full p-2 text-(--text-secondary) bg-(--bg-input) border border-(--border-secondary) rounded-xl cursor-pointer hover:bg-(--bg-hover) peer-checked:bg-(--accent-muted) peer-checked:border-(--accent-primary) peer-checked:hover:bg-(--accent-muted) peer-checked:text-(--accent-primary) ${bothSelected ? "peer-focus:ring-2 peer-focus:ring-[--accent-primary]/20 peer-focus:border-[--accent-primary]" : ""}`}>
              <div className="w-full font-light">{option.charAt(0).toUpperCase() + option.slice(1)}</div>
              {option === "active" && <BadgeCheck className="h-4 w-4" />}
              {option === "inactive" && <BadgeAlert className="h-4 w-4" />}
              {option === "closed" && <BadgeX className="h-4 w-4" />}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
