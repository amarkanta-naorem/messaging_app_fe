"use client";

import { Role } from "@/types/role";
import { ArrowLeft } from "lucide-react";

interface RoleDetailsProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleDetails({ role, isOpen, onClose }: RoleDetailsProps) {
  if (!isOpen || !role) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Role Details</h1>
          <p className="text-(--text-secondary)">Viewing information for {role.name}</p>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to data table
        </button>
      </div>

      <div className="bg-(--bg-card) max-h-[84vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DetailRow label="Name" value={role.name} />
            <DetailRow label="Slug" value={role.slug} />
            <div className="bg-(--bg-secondary) rounded-lg p-4">
              <span className="text-(--text-muted) text-sm block mb-1">Scope</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">{role.scope}</span>
            </div>
            <div className="bg-(--bg-secondary) rounded-lg p-4">
              <span className="text-(--text-muted) text-sm block mb-1">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${role.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${role.isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                {role.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {role.description && (
            <div className="bg-(--bg-secondary) rounded-lg p-4">
              <span className="text-(--text-muted) text-sm block mb-2">Description</span>
              <span className="text-(--text-primary) text-sm">{role.description}</span>
            </div>
          )}

          {role.permissions && role.permissions.length > 0 && (
            <div className="bg-(--bg-secondary) rounded-lg p-4">
              <span className="text-(--text-muted) text-sm block mb-2">Permissions</span>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((p) => (
                  <span key={p.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{p.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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

export default RoleDetails;