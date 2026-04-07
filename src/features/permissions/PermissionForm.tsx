"use client";

import { useState, useEffect } from "react";
import { Key, FolderOpen, FileText } from "lucide-react";
import { FloatingLabelInput } from "@/features/branches/components";
import type { Permission, PermissionPayload } from "@/types/permission";
import { PermissionFormHeader, FormSection, FormActions } from "./components";

interface PermissionFormProps {
  initialData?: Permission | null;
  onSubmit: (payload: PermissionPayload) => Promise<void>;
  loading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function PermissionForm({ initialData, onSubmit, loading = false, isOpen, onClose }: PermissionFormProps) {
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
    } else if (isOpen) {
      setName("");
      setSlug("");
      setModule("");
      setDescription("");
    }
    setErrors({});
  }, [initialData, isOpen]);

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

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PermissionFormHeader initialData={initialData} onClose={onClose} />

      <form onSubmit={handleSubmit} className="flex flex-col bg-(--bg-card) min-h-[83vh] rounded-xl border border-(--border-primary) shadow-sm overflow-hidden p-5">
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-7">
          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingLabelInput
                id="permission-name"
                label="Permission Name"
                value={name}
                onChange={setName}
                required
                error={errors.name}
                icon={<FileText className="h-4 w-4" />}
              />
              <FloatingLabelInput
                id="permission-slug"
                label="Slug"
                value={slug}
                onChange={setSlug}
                required
                error={errors.slug}
                icon={<Key className="h-4 w-4" />}
              />
              <FloatingLabelInput
                id="permission-module"
                label="Module"
                value={module}
                onChange={setModule}
                required
                error={errors.module}
                icon={<FolderOpen className="h-4 w-4" />}
                placeholder="projects"
              />
            </div>
          </FormSection>

          <FormSection>
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Allows creating new projects"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) resize-none placeholder:text-(--text-muted) transition-all duration-200"
              />
            </div>
          </FormSection>
        </div>

        <div className="shrink-0 pt-4">
          <FormActions loading={loading} onCancel={handleCancel} isEdit={!!initialData} />
        </div>
      </form>
    </div>
  );
}

export default PermissionForm;