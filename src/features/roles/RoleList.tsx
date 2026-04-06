"use client";

import { RoleForm } from "./RoleForm";
import { RoleDetails } from "./RoleDetails";
import { useAppDispatch } from "@/store/store";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setGlobalError } from "@/store/slices/errorSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Role, RoleListItem, RolePayload } from "@/types/role";
import { Search, Plus, Eye, SquarePen, Trash2 } from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole, getRole } from "@/services/role.service";

export function RoleList() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const organisationId = user?.organisation_employees?.organisation?.id;

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    router.push(`${pathname}?roleForm=open`);
  };

  const handleEdit = async (item: RoleListItem) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      const role = await getRole(organisationId, item.id);
      setEditingRole(role);
      setFormMode("edit");
      setIsFormOpen(true);
      router.push(`${pathname}?roleForm=open`);
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
      setIsDetailsOpen(true);
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
        const newRole = await createRole(organisationId, payload);
        const newRoleItem: RoleListItem = {
          id: newRole.id,
          name: newRole.name,
          slug: newRole.slug,
          scope: newRole.scope,
          isActive: newRole.isActive,
          isSystem: newRole.isSystem,
          createdAt: newRole.createdAt,
        };
        setRoles((prev) => [newRoleItem, ...prev]);
      } else if (editingRole) {
        await updateRole(organisationId, editingRole.id, payload);
        setRoles((prev) => prev.map((r) => r.id === editingRole.id ? { ...r, name: payload.name, scope: payload.scope ?? r.scope, isActive: payload.isActive ?? r.isActive } : r));
      }
      setIsFormOpen(false);
      setEditingRole(null);
      router.push(pathname);
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

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.slug.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {!isFormOpen && !isDetailsOpen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary)">Roles</h1>
            <p className="text-(--text-secondary)">Manage your organization's roles</p>
          </div>
          <Button onClick={handleCreate} variant="customBg" size="md">
            <Plus size={20} />
            <span>Add Role</span>
          </Button>
        </div>
      )}

      {isFormOpen ? (
        <RoleForm
          isOpen={isFormOpen}
          initialData={editingRole}
          onSubmit={handleFormSubmit}
          onClose={() => { setIsFormOpen(false); setEditingRole(null); router.push(pathname); }}
          loading={formLoading}
        />
      ) : isDetailsOpen ? (
        <RoleDetails
          isOpen={isDetailsOpen}
          role={viewingRole}
          onClose={() => { setIsDetailsOpen(false); setViewingRole(null); }}
        />
      ) : (
        <div className="bg-(--bg-card) h-[84vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
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
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-primary)">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-(--text-muted)">Loading roles...</td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-(--text-muted)">No roles found.</td>
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">{role.scope}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>{role.isActive ? "active" : "inactive"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleView(role)} className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer" title="View Details" aria-label={`View details for ${role.name}`}>
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleEdit(role)} disabled={role.isSystem} className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" title="Edit" aria-label={`Edit ${role.name}`}>
                            <SquarePen size={18} />
                          </button>
                          <button onClick={() => setDeleteTarget(role)} disabled={role.isSystem} className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" title="Delete" aria-label={`Delete ${role.name}`}>
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
      )}

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

export default RoleList;