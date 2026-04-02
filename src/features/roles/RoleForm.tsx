"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Role, RolePayload, RoleScope } from "@/types/role";

interface RoleFormProps {
  initialData?: Role | null;
  onSubmit: (payload: RolePayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const SCOPE_OPTIONS: RoleScope[] = ["global", "branch", "department", "custom"];

export function RoleForm({ initialData, onSubmit, onCancel, loading = false }: RoleFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<RoleScope>("global");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setDescription(initialData.description || "");
      setScope(initialData.scope || "global");
      setIsActive(initialData.isActive);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (slug.length > 100) newErrors.slug = "Slug must be 100 characters or less";
    if (!/^[a-z0-9-]+$/.test(slug) && slug.trim()) newErrors.slug = "Slug must be lowercase alphanumeric with hyphens";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: RolePayload = {
      name: name.trim(),
      slug: slug.trim(),
      scope,
      isActive,
    };
    if (description.trim()) payload.description = description.trim();
    await onSubmit(payload);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialData) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Input label="Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required error={!!errors.name} errorMessage={errors.name} placeholder="Project Manager" />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required error={!!errors.slug} errorMessage={errors.slug} placeholder="project-manager" />
      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Can manage projects and teams"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder:text-(--text-muted)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">Scope</label>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as RoleScope)}
          className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          {SCOPE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-(--border-primary) text-(--accent-primary) focus:ring-(--accent-primary)"
          />
          <span className="text-sm text-(--text-primary)">Active</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border-primary)">
        <Button variant="secondary" size="md" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" loading={loading}>
          {initialData ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </form>
  );
}

export default RoleForm;
