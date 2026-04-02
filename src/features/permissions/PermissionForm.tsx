"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Permission, PermissionPayload } from "@/types/permission";

interface PermissionFormProps {
  initialData?: Permission | null;
  onSubmit: (payload: PermissionPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PermissionForm({ initialData, onSubmit, onCancel, loading = false }: PermissionFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [module, setModule] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setModule(initialData.module || "");
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (slug.length > 100) newErrors.slug = "Slug must be 100 characters or less";
    if (!/^[a-z0-9._-]+$/.test(slug) && slug.trim()) newErrors.slug = "Slug must be lowercase with dots, underscores, or hyphens";
    if (!module.trim()) newErrors.module = "Module is required";
    if (module.length > 50) newErrors.module = "Module must be 50 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: PermissionPayload = {
      name: name.trim(),
      slug: slug.trim(),
      module: module.trim(),
    };
    if (description.trim()) payload.description = description.trim();
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required error={!!errors.name} errorMessage={errors.name} placeholder="Create Project" />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required error={!!errors.slug} errorMessage={errors.slug} placeholder="project.create" />
      <Input label="Module" value={module} onChange={(e) => setModule(e.target.value)} required error={!!errors.module} errorMessage={errors.module} placeholder="projects" />
      <div>
        <label className="block text-sm font-medium text-(--text-primary) mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Allows creating new projects"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder:text-(--text-muted)"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border-primary)">
        <Button variant="secondary" size="md" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" loading={loading}>
          {initialData ? "Update Permission" : "Create Permission"}
        </Button>
      </div>
    </form>
  );
}

export default PermissionForm;
