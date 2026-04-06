"use client";

import { Button } from "@/components/ui/button";

interface RoleFormActionsProps {
  loading?: boolean;
  onCancel: () => void;
  isEdit?: boolean;
}

export function RoleFormActions({ loading = false, onCancel, isEdit = false }: RoleFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="danger" size="md" type="button" onClick={onCancel} disabled={loading} className="px-5 py-2.5 rounded-xl font-medium">Cancel</Button>
      <Button variant="customBg" size="md" type="submit" loading={loading} className="px-6 py-2.5 rounded-xl font-medium">{isEdit ? "Update Role" : "Create Role"}</Button>
    </div>
  );
}

export default RoleFormActions;