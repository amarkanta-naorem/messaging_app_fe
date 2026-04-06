"use client";

import { DepartmentForm } from "./DepartmentForm";
import { DepartmentDetails } from "./DepartmentDetails";
import { useAppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setGlobalError } from "@/store/slices/errorSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Search, Plus, Eye, SquarePen, Trash2 } from "lucide-react";
import type { Department, DepartmentListItem, DepartmentPayload } from "@/types/department";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartment } from "@/services/department.service";

export function DepartmentList() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DepartmentListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data.departments);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch departments";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingDepartment(null);
    setIsFormOpen(true);
    router.push(`${pathname}?departmentForm=open`);
  };

  const handleEdit = async (item: DepartmentListItem) => {
    try {
      setFormLoading(true);
      const department = await getDepartment(item.id);
      setEditingDepartment(department);
      setFormMode("edit");
      setIsFormOpen(true);
      router.push(`${pathname}?departmentForm=open`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch department details";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (item: DepartmentListItem) => {
    try {
      const department = await getDepartment(item.id);
      setViewingDepartment(department);
      setIsDetailsOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch department details";
      dispatch(setGlobalError({ message, type: "error" }));
    }
  };

  const handleFormSubmit = async (payload: DepartmentPayload) => {
    try {
      setFormLoading(true);
      if (formMode === "create") {
        const newDepartment = await createDepartment(payload);
        const newDepartmentItem: DepartmentListItem = {
          id: newDepartment.id,
          name: newDepartment.name,
          code: newDepartment.code,
          status: newDepartment.status,
          level: newDepartment.level,
          createdAt: newDepartment.createdAt,
          branchId: newDepartment.branchId,
          branchName: newDepartment.branch?.name ?? null,
          parentDepartmentId: newDepartment.parentDepartmentId,
          headOfDepartmentId: newDepartment.headOfDepartmentId,
          headOfDepartmentName: newDepartment.headOfDepartment?.name ?? null,
          headOfDepartmentPhone: newDepartment.headOfDepartment?.phone ?? null,
          headOfDepartmentAvatar: newDepartment.headOfDepartment?.avatar ?? null,
        };
        setDepartments((prev) => [newDepartmentItem, ...prev]);
      } else if (editingDepartment) {
        await updateDepartment(editingDepartment.id, payload);
        setDepartments((prev) => prev.map((d) => d.id === editingDepartment.id ? { ...d, name: payload.name, code: payload.code ?? d.code, status: payload.status ?? d.status, level: payload.level ?? d.level } : d));
      }
      setIsFormOpen(false);
      setEditingDepartment(null);
      router.push(pathname);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to ${formMode} department`;
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
      fetchDepartments();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete department";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepartments = departments.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || (d.code || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {!isFormOpen && !isDetailsOpen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary)">Departments</h1>
            <p className="text-(--text-secondary)">Manage your organization's departments</p>
          </div>
          <Button onClick={handleCreate} variant="customBg" size="md">
            <Plus size={20} />
            <span>Add Department</span>
          </Button>
        </div>
      )}

      {isFormOpen ? (
        <DepartmentForm isOpen={isFormOpen} initialData={editingDepartment} onSubmit={handleFormSubmit} onClose={() => { setIsFormOpen(false); setEditingDepartment(null); router.push(pathname); }} loading={formLoading}/>
      ) : isDetailsOpen ? (
        <DepartmentDetails isOpen={isDetailsOpen} department={viewingDepartment} onClose={() => { setIsDetailsOpen(false); setViewingDepartment(null); }}/>
      ) : (
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
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">HOD</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-primary)">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-(--text-muted)">
                      Loading departments...
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-(--text-muted)">
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
                        <p className="text-(--text-secondary)">{dept.branchName || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {dept.headOfDepartmentAvatar ? (
                            <img src={dept.headOfDepartmentAvatar} className="w-10 h-10 rounded-full object-cover" alt={dept.headOfDepartmentName || "HOD"} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) font-semibold text-lg md:text-xl">
                              {dept.headOfDepartmentName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-(--text-primary) font-medium">{dept.headOfDepartmentName}</p>
                            <p className="text-(--text-muted) font-medium text-xs">+{dept.headOfDepartmentPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`
                            relative inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase
                            tracking-wider transition-all duration-300 ease-out
                            backdrop-blur-sm
                            ${dept.status === "active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20" : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20"}
                          `}>
                            <span className={`
                              absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300
                              ${dept.status === "active" && "bg-linear-to-r from-emerald-500/20 to-emerald-600/20 group-hover:opacity-100"}
                              ${dept.status === "inactive" && "bg-linear-to-r from-amber-500/20 to-amber-600/20 group-hover:opacity-100"}
                            `} />
                            
                            <div className="relative flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {dept.status === "active" && (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                )}
                                {dept.status === "inactive" && (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                              
                              {dept.status === "active" && "Active"}
                              {dept.status === "inactive" && "Inactive"}
                            </div>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleView(dept)} className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer" title="View Details" aria-label={`View details for ${dept.name}`}>
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleEdit(dept)} className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer" title="Edit" aria-label={`Edit ${dept.name}`}>
                            <SquarePen size={18} />
                          </button>
                          <button onClick={() => setDeleteTarget(dept)} className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer" title="Delete" aria-label={`Delete ${dept.name}`}>
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
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={isDeleting}
      />
    </div>
  );
}

export default DepartmentList;