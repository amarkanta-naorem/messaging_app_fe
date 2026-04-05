import { BadgeAlert, BadgeCheck, BadgeX } from "lucide-react";

interface StatusRadioProps {
  status: "active" | "inactive" | "closed";
  onChange: (status: "active" | "inactive" | "closed") => void;
  headquartersValue?: boolean | null;
}

export default function StatusRadio({ status, onChange, headquartersValue }: StatusRadioProps) {
  const bothSelected = headquartersValue !== undefined && headquartersValue !== null;

  return (
    <div className="bg-(--bg-input) text-(--text-muted) p-2 rounded-xl">
      <legend className="mb-2 font-medium">Status</legend>
      <ul className="grid w-full gap-6 md:grid-cols-3">
        <li>
          <input type="radio" id="status-active" name="status" value="active" checked={status === "active"} onChange={() => onChange("active")} className="hidden peer" required/>
          <label htmlFor="status-active" className={`inline-flex items-center justify-between w-full p-2 text-(--text-secondary) bg-(--bg-input) border border-(--border-secondary) rounded-xl cursor-pointer hover:bg-(--bg-hover) peer-checked:bg-(--accent-muted) peer-checked:border-(--accent-primary) peer-checked:hover:bg-(--accent-muted) peer-checked:text-(--accent-primary) ${bothSelected ? "peer-focus:ring-2 peer-focus:ring-[--accent-primary]/20 peer-focus:border-[--accent-primary]" : ""}`}>
            <div className="w-full font-light">Active</div>
            <BadgeCheck className="h-4 w-4" />
          </label>
        </li>
        <li>
          <input type="radio" id="status-inactive" name="status" value="inactive" checked={status === "inactive"} onChange={() => onChange("inactive")} className="hidden peer"/>
          <label htmlFor="status-inactive" className={`inline-flex items-center justify-between w-full p-2 text-(--text-secondary) bg-(--bg-input) border border-(--border-secondary) rounded-xl cursor-pointer hover:bg-(--bg-hover) peer-checked:bg-(--accent-muted) peer-checked:border-(--accent-primary) peer-checked:hover:bg-(--accent-muted) peer-checked:text-(--accent-primary) ${bothSelected ? "peer-focus:ring-2 peer-focus:ring-[--accent-primary]/20 peer-focus:border-[--accent-primary]" : ""}`}>
            <div className="w-full font-light">Inactive</div>
            <BadgeAlert className="h-4 w-4" />
          </label>
        </li>
        <li>
          <input type="radio" id="status-closed" name="status" value="closed" checked={status === "closed"} onChange={() => onChange("closed")} className="hidden peer"/>
          <label htmlFor="status-closed" className={`inline-flex items-center justify-between w-full p-2 text-(--text-secondary) bg-(--bg-input) border border-(--border-secondary) rounded-xl cursor-pointer hover:bg-(--bg-hover) peer-checked:bg-(--accent-muted) peer-checked:border-(--accent-primary) peer-checked:hover:bg-(--accent-muted) peer-checked:text-(--accent-primary) ${bothSelected ? "peer-focus:ring-2 peer-focus:ring-[--accent-primary]/20 peer-focus:border-[--accent-primary]" : ""}`}>
            <div className="w-full font-light">Closed</div>
            <BadgeX className="h-4 w-4" />
          </label>
        </li>
      </ul>
    </div>
  );
}
