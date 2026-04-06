"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartment } from "@/services/department.service";
import { setGlobalError } from "@/store/slices/errorSlice";
import { useAppDispatch } from "@/store/store";
import type { Department, DepartmentListItem, DepartmentPayload } from "@/types/department";
import { Search, Plus, Eye, SquarePen, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { DepartmentForm } from "./DepartmentForm";

export function DepartmentList() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const organisationId = user?.organisation_employees?.organisation?.id;

  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DepartmentListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    if (!organisationId) return;
    try {
      setLoading(true);
      const data = await getDepartments(organisationId);
      setDepartments(data.departments);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch departments";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [organisationId, dispatch]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (item: DepartmentListItem) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      const department = await getDepartment(organisationId, item.id);
      setEditingDepartment(department);
      setFormMode("edit");
      setIsFormOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch department details";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (item: DepartmentListItem) => {
    if (!organisationId) return;
    try {
      const department = await getDepartment(organisationId, item.id);
      setViewingDepartment(department);
      setIsViewOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch department details";
      dispatch(setGlobalError({ message, type: "error" }));
    }
  };

  const handleFormSubmit = async (payload: DepartmentPayload) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      if (formMode === "create") {
        await createDepartment(organisationId, payload);
      } else if (editingDepartment) {
        await updateDepartment(organisationId, editingDepartment.id, payload);
      }
      setIsFormOpen(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to ${formMode} department`;
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!organisationId || !deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDepartment(organisationId, deleteTarget.id);
      setDeleteTarget(null);
      fetchDepartments();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete department";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Departments</h1>
          <p className="text-(--text-secondary)">Manage your organization&apos;s departments</p>
        </div>
        <Button onClick={handleCreate} variant="customBg" size="md">
          <Plus size={20} />
          <span>Add Department</span>
        </Button>
      </div>

      <div className="bg-(--bg-card) max-h-[80vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-4 border-b border-(--border-primary) bg-(--bg-secondary)">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={20} />
            <input
              type="text"
              placeholder="Search departments..."
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
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-(--text-muted)">
                    Loading departments...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-(--text-muted)">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="group hover:bg-(--bg-hover) transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-(--text-primary) font-medium">{dept.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-(--text-secondary)">{dept.code || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-(--text-secondary)">{dept.level}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dept.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(dept)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${dept.name}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(dept)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Edit"
                          aria-label={`Edit ${dept.name}`}
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(dept)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Delete"
                          aria-label={`Delete ${dept.name}`}
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
        onClose={() => { setIsFormOpen(false); setEditingDepartment(null); }}
        title={formMode === "create" ? "Add Department" : "Edit Department"}
        maxWidth="max-w-lg"
      >
        <DepartmentForm
          initialData={editingDepartment}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingDepartment(null); }}
          loading={formLoading}
        />
      </Drawer>

      <Modal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setViewingDepartment(null); }}
        title="Department Details"
      >
        {viewingDepartment && (
          <div className="space-y-4">
            <DetailRow label="Name" value={viewingDepartment.name} />
            <DetailRow label="Code" value={viewingDepartment.code} />
            <DetailRow label="Description" value={viewingDepartment.description} />
            <DetailRow label="Level" value={String(viewingDepartment.level)} />
            <DetailRow label="Status" value={viewingDepartment.status} />
            <DetailRow label="Branch ID" value={viewingDepartment.branchId ? String(viewingDepartment.branchId) : null} />
            <DetailRow label="Parent Department ID" value={viewingDepartment.parentDepartmentId ? String(viewingDepartment.parentDepartmentId) : null} />
            <DetailRow label="Head of Department ID" value={viewingDepartment.headOfDepartmentId ? String(viewingDepartment.headOfDepartmentId) : null} />
            <DetailRow label="Created" value={new Date(viewingDepartment.createdAt).toLocaleString()} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
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

export default DepartmentList;
