"use client";

import { House, HouseHeart } from "lucide-react";

interface HeadquartersRadioProps {
  isHeadquarters: boolean;
  onToggle: () => void;
  statusValue?: string | null;
}

export function HeadquartersRadio({ isHeadquarters, onToggle, statusValue }: HeadquartersRadioProps) {
  const handleHeadquarterChange = () => onToggle();
  const handleBranchChange = () => onToggle();

  const bothSelected = isHeadquarters !== undefined && statusValue != null && statusValue !== "";

  return (
    <div className="bg-(--bg-input) text-(--text-muted) p-2 rounded-xl">
      <legend className="mb-2 font-medium">Location Type</legend>
      <ul className="grid w-full gap-6 md:grid-cols-2">
        <li>
          <input type="radio" id="headquarter" name="locationType" value="true" checked={isHeadquarters === true} onChange={handleHeadquarterChange} className="hidden peer" required />
          <label htmlFor="headquarter" className={`inline-flex items-center justify-between w-full p-2 font-light text-(--text-secondary) bg-(--bg-input) border border-(--border-secondary) rounded-xl cursor-pointer hover:bg-(--bg-hover) peer-checked:bg-(--accent-muted) peer-checked:border-(--accent-primary) peer-checked:hover:bg-(--accent-muted) peer-checked:text-(--accent-primary) ${bothSelected ? "peer-focus:ring-2 peer-focus:ring-[--accent-primary]/20 peer-focus:border-[--accent-primary]" : ""}`} >
            <div className="w-full">Headquarter</div>
            <HouseHeart className="h-4 w-4" />
          </label>
        </li>
        <li>
          <input type="radio" id="branch" name="locationType" value="false" checked={isHeadquarters === false} onChange={handleBranchChange} className="hidden peer" />
          <label htmlFor="branch" className={`inline-flex items-center justify-between w-full p-2 font-light text-(--text-secondary) bg-(--bg-input) border border-(--border-secondary) rounded-xl cursor-pointer hover:bg-(--bg-hover) peer-checked:bg-(--accent-muted) peer-checked:border-(--accent-primary) peer-checked:hover:bg-(--accent-muted) peer-checked:text-(--accent-primary) ${bothSelected ? "peer-focus:ring-2 peer-focus:ring-[--accent-primary]/20 peer-focus:border-[--accent-primary]" : ""}`} >
            <div className="w-full">Branch</div>
            <House className="h-4 w-4" />
          </label>
        </li>
      </ul>
    </div>
  );
}
