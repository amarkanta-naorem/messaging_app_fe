"use client";

import { Department } from "@/types/department";
import { ArrowLeft } from "lucide-react";

interface DepartmentDetailsProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DepartmentDetails({ department, isOpen, onClose }: DepartmentDetailsProps) {
  if (!isOpen || !department) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Department Details</h1>
          <p className="text-(--text-secondary)">Viewing information for {department.name}</p>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to data table
        </button>
      </div>

      {/* Details Card */}
      <div className="bg-(--bg-card) max-h-[84vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DetailRow label="Department" value={department.name} />
            <div>
              <span className="text-(--text-muted) text-sm block mb-1">Head of Department</span>
              <div className="flex items-center gap-3">
                {department.headOfDepartment?.avatar ? (
                  <img src={department.headOfDepartment?.avatar} className="w-10 h-10 rounded-full object-cover" alt={department.headOfDepartment?.name || "HOD"} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) font-semibold text-lg md:text-xl">
                    {department.headOfDepartment?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="text-(--text-primary) font-medium">{department.headOfDepartment?.name}</p>
                  <p className="text-(--text-muted) font-medium text-xs">+{department.headOfDepartment?.phone}</p>
                </div>
              </div>
            </div>
            <DetailRow label="Code" value={department.code} />
            <DetailRow label="Parent Department" value={department.parentDepartment?.name ? String(department.parentDepartment.name) : null} />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DetailRow label="Branch" value={department.branch ? String(department.branch.name) : null} />
            <div>
              <span className="text-(--text-muted) text-sm block mb-1">Branch Manager</span>
              <div className="flex items-center gap-3">
                {department.headOfDepartment?.avatar ? (
                  <img src={department.branch?.managerAvatar} className="w-10 h-10 rounded-full object-cover" alt={department.branch?.managerName || "HOD"} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) font-semibold text-lg md:text-xl">
                    {department.branch?.managerName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="text-(--text-primary) font-medium">{department.branch?.managerName}</p>
                  <p className="text-(--text-muted) font-medium text-xs">+{department.branch?.managerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {department.description && (
            <div className="bg-(--bg-secondary) rounded-lg p-4">
              <span className="text-(--text-muted) text-sm block mb-2">Description</span>
              <span className="text-(--text-primary) text-sm">{department.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    const s = status.toLowerCase();
    if (s === "active") {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30";
    }
    if (s === "inactive") {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30";
    }
  };

  return (
    <div className="bg-(--bg-secondary) rounded-lg p-4">
      <span className="text-(--text-muted) text-sm block mb-2">Status</span>
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${getStatusStyles()}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status.toLowerCase() === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
        {status}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-(--bg-secondary) rounded-lg p-4">
      <span className="text-(--text-muted) text-sm block mb-1">{label}</span>
      <span className="text-(--text-primary) text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export default DepartmentDetails;