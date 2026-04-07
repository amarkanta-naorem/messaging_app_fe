"use client";

import { Permission } from "@/types/permission";
import DetailCard from "./components/DetailCard";
import { ArrowLeft, Key, FolderOpen, FileText } from "lucide-react";

interface PermissionDetailsProps {
  permission: Permission | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PermissionDetails({ permission, isOpen, onClose }: PermissionDetailsProps) {
  if (!isOpen || !permission) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Permission Details</h1>
          <p className="text-(--text-secondary)">Viewing information for {permission.name}</p>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to data table
        </button>
      </div>

      <div className="bg-(--bg-card) max-h-[84vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailCard icon={<FileText className="w-4 h-4 text-(--accent-primary)" />} label="Name" value={permission.name}/>
            <DetailCard icon={<Key className="w-4 h-4 text-(--accent-primary)" />} label="Slug" value={permission.slug} isCode/>
            <DetailCard icon={<FolderOpen className="w-4 h-4 text-(--accent-primary)" />} label="Module" value={permission.module} badge/>
          </div>

          {permission.description && (
            <div className="bg-(--bg-secondary) rounded-lg p-4 border border-(--border-primary)">
              <span className="text-(--text-muted) text-sm block mb-2">Description</span>
              <p className="text-(--text-primary) text-sm">{permission.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PermissionDetails;