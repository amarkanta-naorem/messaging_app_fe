"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Department, DepartmentPayload, DepartmentStatus } from "@/types/department";

interface DepartmentFormProps {
  initialData?: Department | null;
  onSubmit: (payload: DepartmentPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS: DepartmentStatus[] = ["active", "inactive"];

export function DepartmentForm({ initialData, onSubmit, onCancel, loading = false }: DepartmentFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("");
  const [parentDepartmentId, setParentDepartmentId] = useState("");
  const [headOfDepartmentId, setHeadOfDepartmentId] = useState("");
  const [status, setStatus] = useState<DepartmentStatus>("active");
  const [level, setLevel] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setDescription(initialData.description || "");
      setBranchId(initialData.branchId ? String(initialData.branchId) : "");
      setParentDepartmentId(initialData.parentDepartmentId ? String(initialData.parentDepartmentId) : "");
      setHeadOfDepartmentId(initialData.headOfDepartmentId ? String(initialData.headOfDepartmentId) : "");
      setStatus(initialData.status);
      setLevel(String(initialData.level || 1));
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (code.length > 50) newErrors.code = "Code must be 50 characters or less";
    const lvl = parseInt(level);
    if (isNaN(lvl) || lvl < 1) newErrors.level = "Level must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: DepartmentPayload = {
      name: name.trim(),
      status,
      level: parseInt(level),
    };
    if (code.trim()) payload.code = code.trim();
    if (description.trim()) payload.description = description.trim();
    if (branchId.trim()) payload.branchId = parseInt(branchId);
    if (parentDepartmentId.trim()) payload.parentDepartmentId = parseInt(parentDepartmentId);
    if (headOfDepartmentId.trim()) payload.headOfDepartmentId = parseInt(headOfDepartmentId);
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required error={!!errors.name} errorMessage={errors.name} placeholder="Engineering" />
      <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} error={!!errors.code} errorMessage={errors.code} placeholder="ENG" />
      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Software Engineering Department"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder:text-(--text-muted)"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Branch ID" type="number" value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="1" />
        <Input label="Level" type="number" min="1" value={level} onChange={(e) => setLevel(e.target.value)} error={!!errors.level} errorMessage={errors.level} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Parent Department ID" type="number" value={parentDepartmentId} onChange={(e) => setParentDepartmentId(e.target.value)} placeholder="Optional" />
        <Input label="Head of Department ID" type="number" value={headOfDepartmentId} onChange={(e) => setHeadOfDepartmentId(e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DepartmentStatus)}
          className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border-primary)">
        <Button variant="secondary" size="md" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" loading={loading}>
          {initialData ? "Update Department" : "Create Department"}
        </Button>
      </div>
    </form>
  );
}

export default DepartmentForm;
