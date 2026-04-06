"use client";

import { useState, useEffect } from "react";
import type { Role, RolePayload, RoleScope } from "@/types/role";
import { Shield, BadgeX, Globe, ArrowLeft } from "lucide-react";
import { FloatingLabelInput, FloatingSearchableDropdown } from "@/features/branches/components";
import StatusRadio from "@/features/branches/components/StatusRadio";
import { RoleFormActions } from "./components/RoleFormActions";

interface RoleFormProps {
  initialData?: Role | null;
  onSubmit: (payload: RolePayload) => Promise<void>;
  loading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const SCOPE_OPTIONS: RoleScope[] = ["global", "branch", "department", "custom"];

const getScopeDisplay = (scope: RoleScope) => {
  return scope.charAt(0).toUpperCase() + scope.slice(1);
};

const getScopeSearch = (scope: RoleScope) => {
  return scope.toLowerCase();
};

export function RoleForm({ initialData, onSubmit, loading = false, isOpen, onClose }: RoleFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<RoleScope>("global");
  const [status, setStatus] = useState<string>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setScope(initialData.scope || "global");
      setStatus(initialData.isActive ? "active" : "inactive");
    } else if (isOpen) {
      setName("");
      setDescription("");
      setScope("global");
      setStatus("active");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: RolePayload = {
      name: name.trim(),
      scope,
      isActive: status === "active",
    };
    if (description.trim()) payload.description = description.trim();
    await onSubmit(payload);
  };

  const handleNameChange = (value: string) => {
    setName(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">{initialData ? "Edit Role" : "Create New Role"}</h1>
          <p className="text-(--text-secondary)">{initialData ? "Update role information and settings" : "Add a new role to your organization"}</p>
        </div>
        <button type="button" onClick={handleCancel} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to data table
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col bg-(--bg-card) min-h-[83vh] rounded-xl border border-(--border-primary) shadow-sm overflow-hidden p-5">
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-baseline-last">
            <FloatingLabelInput
              id="role-name"
              label="Role Name"
              value={name}
              onChange={handleNameChange}
              required
              error={errors.name}
              icon={<Shield className="h-4 w-4" />}
            />
            <FloatingSearchableDropdown<RoleScope>
              id="role-scope"
              label="Scope"
              value={scope}
              onChange={setScope}
              options={SCOPE_OPTIONS}
              getDisplayValue={getScopeDisplay}
              getSearchValue={getScopeSearch}
              placeholder="Select scope"
              icon={<Globe className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder:text-(--text-muted)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-12">
              <StatusRadio status={status} onChange={setStatus} options={["active", "inactive"]} label="Status" />
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-4">
          <RoleFormActions loading={loading} onCancel={handleCancel} isEdit={!!initialData} />
        </div>
      </form>
    </div>
  );
}

export default RoleForm;