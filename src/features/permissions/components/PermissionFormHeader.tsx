"use client";

import { ArrowLeft } from "lucide-react";

interface PermissionFormHeaderProps {
  initialData?: unknown | null;
  onClose: () => void;
}

export function PermissionFormHeader({ initialData, onClose }: PermissionFormHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary)">{initialData ? "Edit Permission" : "Create New Permission"}</h1>
        <p className="text-(--text-secondary)">{initialData ? "Update permission information and settings" : "Add a new permission to the system"}</p>
      </div>
      <button type="button" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium">
        <ArrowLeft className="h-4 w-4" />
        Back to data table
      </button>
    </div>
  );
}