"use client";

import { BranchForm } from "./BranchForm";
import { Modal } from "@/components/ui/modal";
import { useAppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { setGlobalError } from "@/store/slices/errorSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Search, Plus, Eye, SquarePen, Trash2 } from "lucide-react";
import type { Branch, BranchListItem, BranchPayload } from "@/types/branch";
import { getBranches, createBranch, updateBranch, deleteBranch, getBranch } from "@/services/branch.service";
import { useRouter, usePathname } from "next/navigation";

export function BranchList() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const organisationId = user?.organisation_employees?.organisation?.id;

  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BranchListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    if (!organisationId) return;
    try {
      setLoading(true);
      const data = await getBranches(organisationId);
      setBranches(data.branches);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch branches";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [organisationId, dispatch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingBranch(null);
    setIsFormOpen(true);
    router.push(`${pathname}?branchForm=open`);
  };

  const handleEdit = async (item: BranchListItem) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      const branch = await getBranch(organisationId, item.id);
      setEditingBranch(branch);
      setFormMode("edit");
      setIsFormOpen(true);
      router.push(`${pathname}?branchForm=open`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch branch details";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (item: BranchListItem) => {
    if (!organisationId) return;
    try {
      const branch = await getBranch(organisationId, item.id);
      setViewingBranch(branch);
      setIsViewOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch branch details";
      dispatch(setGlobalError({ message, type: "error" }));
    }
  };

  const handleFormSubmit = async (payload: BranchPayload) => {
    if (!organisationId) return;
    try {
      setFormLoading(true);
      if (formMode === "create") {
        const newBranch = await createBranch(organisationId, payload);
        const newBranchItem: BranchListItem = {
          id: newBranch.id,
          name: newBranch.name,
          code: newBranch.code,
          status: newBranch.status,
          isHeadquarters: newBranch.isHeadquarters,
          createdAt: newBranch.createdAt,
        };
        setBranches((prev) => [newBranchItem, ...prev]);
      } else if (editingBranch) {
        await updateBranch(organisationId, editingBranch.id, payload);
        setBranches((prev) =>
          prev.map((b) =>
            b.id === editingBranch.id
              ? { ...b, name: payload.name, code: payload.code ?? null, status: payload.status ?? b.status, isHeadquarters: payload.isHeadquarters ?? b.isHeadquarters }
              : b
          )
        );
      }
      setIsFormOpen(false);
      setEditingBranch(null);
      router.push(pathname);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to ${formMode} branch`;
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!organisationId || !deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteBranch(organisationId, deleteTarget.id);
      setDeleteTarget(null);
      fetchBranches();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete branch";
      dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {!isFormOpen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary)">Branches</h1>
            <p className="text-(--text-secondary)">Manage your organization's branches</p>
          </div>
          <Button onClick={handleCreate} variant="primary" size="md">
            <Plus size={20} />
            <span>Add Branch</span>
          </Button>
        </div>
      )}

      {isFormOpen ? (
        <BranchForm
          isOpen={isFormOpen}
          initialData={editingBranch}
          onSubmit={handleFormSubmit}
          onClose={() => { setIsFormOpen(false); setEditingBranch(null); router.push(pathname); }}
          loading={formLoading}
        />
      ) : (
        <div className="bg-(--bg-card) max-h-[80vh] overflow-y-auto custom-scrollbar rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-4 border-b border-(--border-primary) bg-(--bg-secondary)">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={20} />
            <input
              type="text"
              placeholder="Search branches..."
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
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">HQ</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-(--text-muted)">
                    Loading branches...
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-(--text-muted)">
                    No branches found.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch.id} className="group hover:bg-(--bg-hover) transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-(--text-primary) font-medium">{branch.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-(--text-secondary)">{branch.code || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        branch.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : branch.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {branch.isHeadquarters ? (
                        <span className="text-emerald-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-(--text-muted)">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(branch)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${branch.name}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Edit"
                          aria-label={`Edit ${branch.name}`}
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(branch)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Delete"
                          aria-label={`Delete ${branch.name}`}
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
      )}

      <Modal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setViewingBranch(null); }}
        title="Branch Details"
      >
        {viewingBranch && (
          <div className="space-y-4">
            <DetailRow label="Name" value={viewingBranch.name} />
            <DetailRow label="Code" value={viewingBranch.code} />
            <DetailRow label="Address" value={viewingBranch.address} />
            <DetailRow label="City" value={viewingBranch.city} />
            <DetailRow label="State" value={viewingBranch.state} />
            <DetailRow label="Country" value={viewingBranch.country} />
            <DetailRow label="Postal Code" value={viewingBranch.postalCode} />
            <DetailRow label="Phone" value={viewingBranch.phone} />
            <DetailRow label="Email" value={viewingBranch.email} />
            <DetailRow label="Latitude" value={viewingBranch.latitude} />
            <DetailRow label="Longitude" value={viewingBranch.longitude} />
            <DetailRow label="Headquarters" value={viewingBranch.isHeadquarters ? "Yes" : "No"} />
            <DetailRow label="Status" value={viewingBranch.status} />
            <DetailRow label="Created" value={new Date(viewingBranch.createdAt).toLocaleString()} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Branch"
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

export default BranchList;
