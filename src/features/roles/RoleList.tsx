"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRoles, createRole, updateRole, deleteRole, getRole } from "@/services/role.service";
import { setGlobalError } from "@/store/slices/errorSlice";
import { useAppDispatch } from "@/store/store";
import type { Role, RoleListItem, RolePayload } from "@/types/role";
import { Search, Plus, Eye, SquarePen, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { RoleForm } from "./RoleForm";

export function RoleList() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const organisationId = user?.organisation_employees?.organisation?.id;

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RoleListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!organisationId) return;
    try {
      setLoading(true);
      const data = await getRoles(organisationId);
      setRoles(data.roles);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch roles";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [organisationId, dispatch]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (item: RoleListItem) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      const role = await getRole(organisationId, item.id);
      setEditingRole(role);
      setFormMode("edit");
      setIsFormOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch role details";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (item: RoleListItem) => {
    if (!organisationId) return;
    try {
      const role = await getRole(organisationId, item.id);
      setViewingRole(role);
      setIsViewOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch role details";
      dispatch(setGlobalError({ message, type: "error" }));
    }
  };

  const handleFormSubmit = async (payload: RolePayload) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      if (formMode === "create") {
        await createRole(organisationId, payload);
      } else if (editingRole) {
        await updateRole(organisationId, editingRole.id, payload);
      }
      setIsFormOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to ${formMode} role`;
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!organisationId || !deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteRole(organisationId, deleteTarget.id);
      setDeleteTarget(null);
      fetchRoles();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete role";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Roles</h1>
          <p className="text-(--text-secondary)">Manage your organization&apos;s roles</p>
        </div>
        <Button onClick={handleCreate} variant="primary" size="md">
          <Plus size={20} />
          <span>Add Role</span>
        </Button>
      </div>

      <div className="bg-(--bg-card) max-h-[80vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-4 border-b border-(--border-primary) bg-(--bg-secondary)">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={20} />
            <input
              type="text"
              placeholder="Search roles..."
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
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">System</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-(--text-muted)">
                    Loading roles...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-(--text-muted)">
                    No roles found.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="group hover:bg-(--bg-hover) transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-(--text-primary) font-medium">{role.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-(--bg-tertiary) px-2 py-1 rounded text-(--text-secondary)">{role.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {role.scope}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {role.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {role.isSystem ? (
                        <span className="text-blue-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-(--text-muted)">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(role)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${role.name}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(role)}
                          disabled={role.isSystem}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit"
                          aria-label={`Edit ${role.name}`}
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
                          disabled={role.isSystem}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                          aria-label={`Delete ${role.name}`}
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
        onClose={() => { setIsFormOpen(false); setEditingRole(null); }}
        title={formMode === "create" ? "Add Role" : "Edit Role"}
        maxWidth="max-w-lg"
      >
        <RoleForm
          initialData={editingRole}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingRole(null); }}
          loading={formLoading}
        />
      </Drawer>

      <Modal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setViewingRole(null); }}
        title="Role Details"
      >
        {viewingRole && (
          <div className="space-y-4">
            <DetailRow label="Name" value={viewingRole.name} />
            <DetailRow label="Slug" value={viewingRole.slug} />
            <DetailRow label="Description" value={viewingRole.description} />
            <DetailRow label="Scope" value={viewingRole.scope} />
            <DetailRow label="Active" value={viewingRole.isActive ? "Yes" : "No"} />
            <DetailRow label="System Role" value={viewingRole.isSystem ? "Yes" : "No"} />
            <DetailRow label="Created" value={new Date(viewingRole.createdAt).toLocaleString()} />
            {viewingRole.permissions && viewingRole.permissions.length > 0 && (
              <div>
                <span className="text-(--text-muted) text-sm block mb-2">Permissions</span>
                <div className="flex flex-wrap gap-2">
                  {viewingRole.permissions.map((p) => (
                    <span key={p.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Role"
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

export default RoleList;
