"use client";

import { useState, useEffect, useCallback } from "react";
import { getPermissions, createPermission, updatePermission, deletePermission, getPermission } from "@/services/permission.service";
import { setGlobalError } from "@/store/slices/errorSlice";
import { useAppDispatch } from "@/store/store";
import type { Permission, PermissionPayload } from "@/types/permission";
import { Search, Plus, Eye, SquarePen, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { PermissionForm } from "./PermissionForm";

export function PermissionList() {
  const dispatch = useAppDispatch();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [viewingPermission, setViewingPermission] = useState<Permission | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPermissions(1, 100);
      setPermissions(data.permissions);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch permissions";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingPermission(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (item: Permission) => {
    try {
      setFormLoading(true);
      const permission = await getPermission(item.id);
      setEditingPermission(permission);
      setFormMode("edit");
      setIsFormOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch permission details";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (item: Permission) => {
    try {
      const permission = await getPermission(item.id);
      setViewingPermission(permission);
      setIsViewOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch permission details";
      dispatch(setGlobalError({ message, type: "error" }));
    }
  };

  const handleFormSubmit = async (payload: PermissionPayload) => {
    try {
      setFormLoading(true);
      if (formMode === "create") {
        await createPermission(payload);
      } else if (editingPermission) {
        await updatePermission(editingPermission.id, payload);
      }
      setIsFormOpen(false);
      setEditingPermission(null);
      fetchPermissions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to ${formMode} permission`;
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deletePermission(deleteTarget.id);
      setDeleteTarget(null);
      fetchPermissions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete permission";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Permissions</h1>
          <p className="text-(--text-secondary)">Manage system permissions</p>
        </div>
        <Button onClick={handleCreate} variant="primary" size="md">
          <Plus size={20} />
          <span>Add Permission</span>
        </Button>
      </div>

      <div className="bg-(--bg-card) max-h-[80vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-4 border-b border-(--border-primary) bg-(--bg-secondary)">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={20} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-(--border-secondary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-(--text-secondary)">
            <thead className="bg-(--bg-secondary) text-(--text-primary) font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-(--text-muted)">
                    Loading permissions...
                  </td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-(--text-muted)">
                    No permissions found.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((perm) => (
                  <tr key={perm.id} className="group hover:bg-(--bg-hover) transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-(--text-primary) font-medium">{perm.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-(--bg-tertiary) px-2 py-1 rounded text-(--text-secondary)">{perm.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {perm.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(perm)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${perm.name}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(perm)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Edit"
                          aria-label={`Edit ${perm.name}`}
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(perm)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Delete"
                          aria-label={`Delete ${perm.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPermission(null); }}
        title={formMode === "create" ? "Add Permission" : "Edit Permission"}
        maxWidth="max-w-lg"
      >
        <PermissionForm
          initialData={editingPermission}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingPermission(null); }}
          loading={formLoading}
        />
      </Drawer>

      <Modal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setViewingPermission(null); }}
        title="Permission Details"
      >
        {viewingPermission && (
          <div className="space-y-4">
            <DetailRow label="Name" value={viewingPermission.name} />
            <DetailRow label="Slug" value={viewingPermission.slug} />
            <DetailRow label="Module" value={viewingPermission.module} />
            <DetailRow label="Description" value={viewingPermission.description} />
            <DetailRow label="Created" value={new Date(viewingPermission.createdAt).toLocaleString()} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Permission"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={isDeleting}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-(--text-muted) text-sm shrink-0">{label}</span>
      <span className="text-(--text-primary) text-sm font-medium text-right">{value || "-"}</span>
    </div>
  );
}

export default PermissionList;
