"use client";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  loading?: boolean;
  onCancel: () => void;
  isEdit?: boolean;
}

export function FormActions({ loading = false, onCancel, isEdit = false }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondary" size="md" type="button" onClick={onCancel} disabled={loading}className="px-5 py-2.5 rounded-xl font-medium">Cancel</Button>
      <Button variant="primary" size="md" type="submit" loading={loading}className="px-6 py-2.5 rounded-xl font-medium">{isEdit ? "Update Branch" : "Create Branch"}</Button>
    </div>
  );
}