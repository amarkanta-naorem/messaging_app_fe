"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, Check, Loader2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/config";
import Image from "next/image";

interface OrgGroup {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  isAnnouncementOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export const AddEmployeeDrawer = ({
  isOpen,
  onClose,
  onEmployeeAdded,
}: AddEmployeeDrawerProps) => {
  const { token, user } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(
    new Set()
  );
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const organisationId = user?.organisation_employees?.organisation?.id;

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setEmail("");
      setAvatar("");
      setSelectedGroupIds(new Set());
      setGroupSearchQuery("");
      setError(null);
      setFieldErrors({});

      if (token && organisationId) {
        fetchGroups();
      }
    }
  }, [isOpen, token, organisationId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/organizations/${organisationId}/groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (result.success) {
        setGroups(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setGroupsLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery) return groups;
    const lowerQuery = groupSearchQuery.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(lowerQuery));
  }, [groups, groupSearchQuery]);

  const toggleGroup = (id: number) => {
    const newSet = new Set(selectedGroupIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedGroupIds(newSet);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 1 || name.trim().length > 100) {
      errors.name = "Name must be between 1 and 100 characters";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (avatar.trim() && !/^https?:\/\/.+/.test(avatar.trim())) {
      errors.avatar = "Please enter a valid URL";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!token || !organisationId) return;

    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      if (avatar.trim()) {
        body.avatar = avatar.trim();
      }

      if (selectedGroupIds.size > 0) {
        body.groupIds = Array.from(selectedGroupIds);
      }

      const response = await fetch(
        `${API_BASE}/organizations/${organisationId}/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      if (result.success) {
        onEmployeeAdded();
        onClose();
      } else {
        setError(result.message || "Failed to create employee");
      }
    } catch (err) {
      console.error("Failed to create employee:", err);
      setError("An error occurred while creating the employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-60 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex flex-col p-4 border-b border-slate-100 bg-emerald-600 text-white shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-lg">Add Employee</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-xs text-white/80">
            Add a new employee to your organisation
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="John Doe"
                className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"} focus:outline-none focus:ring-2 transition-all text-sm`}
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone)
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="+1234567890"
                className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.phone ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"} focus:outline-none focus:ring-2 transition-all text-sm`}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="john.doe@example.com"
                className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.email ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"} focus:outline-none focus:ring-2 transition-all text-sm`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Avatar URL{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => {
                  setAvatar(e.target.value);
                  if (fieldErrors.avatar)
                    setFieldErrors((prev) => ({ ...prev, avatar: "" }));
                }}
                placeholder="https://example.com/avatar.jpg"
                className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.avatar ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"} focus:outline-none focus:ring-2 transition-all text-sm`}
              />
              {fieldErrors.avatar && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.avatar}
                </p>
              )}
            </div>

            {/* Groups Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assign to Groups{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>

              {selectedGroupIds.size > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.from(selectedGroupIds).map((gId) => {
                    const group = groups.find((g) => g.id === gId);
                    if (!group) return null;
                    return (
                      <span
                        key={gId}
                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200"
                      >
                        {group.name}
                        <button
                          onClick={() => toggleGroup(gId)}
                          className="hover:text-emerald-900 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Group Search */}
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search groups..."
                      className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Group List */}
                <div className="max-h-48 overflow-y-auto">
                  {groupsLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 animate-pulse"
                        >
                          <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3 bg-slate-200 rounded w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      {groups.length === 0
                        ? "No groups available"
                        : "No groups match your search"}
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors ${selectedGroupIds.has(group.id) ? "bg-emerald-50/50" : ""}`}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {group.logo ? (
                            <Image
                              src={group.logo}
                              alt={group.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-800 truncate">
                            {group.name}
                          </h4>
                          {group.description && (
                            <p className="text-xs text-slate-500 truncate">
                              {group.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${selectedGroupIds.has(group.id) ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}
                        >
                          {selectedGroupIds.has(group.id) && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
