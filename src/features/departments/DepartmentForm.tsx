"use client";

import { useAuth } from "@/context/AuthContext";
import { getBranches } from "@/services/branch.service";
import { useState, useEffect, useCallback } from "react";
import { getDepartments } from "@/services/department.service";
import { ArrowLeft, Building2, Building, User } from "lucide-react";
import { getOrganizationEmployees } from "@/services/employee.service";
import type { Department, DepartmentPayload, DepartmentStatus } from "@/types/department";
import { FloatingLabelInput, FloatingSearchableDropdown, FormSection, FormActions } from "@/features/branches/components";
import StatusRadio from "@/features/branches/components/StatusRadio";

interface DepartmentFormProps {
  initialData?: Department | null;
  onSubmit: (payload: DepartmentPayload) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  isOpen: boolean;
}

interface BranchOption {
  id: number;
  name: string;
}

interface DepartmentOption {
  id: number;
  name: string;
}

interface EmployeeOption {
  id: number;
  name: string;
  phone: string;
}

export function DepartmentForm({ initialData, onSubmit, onClose, loading = false, isOpen }: DepartmentFormProps) {
  const { user } = useAuth();
  const organisationId = user?.organisation_employees?.organisation?.id as number | undefined;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [parentDepartmentId, setParentDepartmentId] = useState<number | "">("");
  const [headOfDepartmentId, setHeadOfDepartmentId] = useState<number | "">("");
  const [status, setStatus] = useState<DepartmentStatus>("active");
  const [level, setLevel] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const fetchDropdownData = useCallback(async () => {
    if (!organisationId) return;
    try {
      const [branchesData, departmentsData, employeesData] = await Promise.all([
        getBranches(organisationId, 1, 100),
        getDepartments(1, 100),
        getOrganizationEmployees(),
      ]);
      setBranches(branchesData.branches.map((b) => ({ id: b.id, name: b.name })));
      setDepartments(departmentsData.departments.map((d) => ({ id: d.id, name: d.name })));
      setEmployees(employeesData.map((e) => ({ id: e.id, name: e.name, phone: e.phone })));
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    }
  }, [organisationId]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setDescription(initialData.description || "");
      setBranchId(initialData.branchId || "");
      setParentDepartmentId(initialData.parentDepartmentId || "");
      setHeadOfDepartmentId(initialData.headOfDepartmentId || "");
      setStatus(initialData.status);
      setLevel(String(initialData.level || 1));
    } else if (isOpen) {
      setName("");
      setCode("");
      setDescription("");
      setBranchId("");
      setParentDepartmentId("");
      setHeadOfDepartmentId("");
      setStatus("active");
      setLevel("1");
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen, fetchDropdownData]);

  // Get display names
  const getBranchName = (id: number) => branches.find((b) => b.id === id)?.name || "";
  const getDepartmentName = (id: number) => departments.find((d) => d.id === id)?.name || "";
  const getEmployeeName = (id: number) => employees.find((e) => e.id === id)?.name || "";

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (!branchId) newErrors.branchId = "Branch is required";
    if (!headOfDepartmentId) newErrors.headOfDepartmentId = "Head of Department is required";
    if (!status) newErrors.status = "Status is required";
    if (code.length > 50) newErrors.code = "Code must be 50 characters or less";
    const lvl = parseInt(level);
    if (isNaN(lvl) || lvl < 1) newErrors.level = "Level must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: DepartmentPayload = {
      name: name.trim(),
      status,
      level: parseInt(level),
    };
    if (code.trim()) payload.code = code.trim();
    if (description.trim()) payload.description = description.trim();
    if (branchId) payload.branchId = branchId;
    if (parentDepartmentId) payload.parentDepartmentId = parentDepartmentId;
    if (headOfDepartmentId) payload.headOfDepartmentId = headOfDepartmentId;
    await onSubmit(payload);
  };

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  // Helper functions for Branch dropdown
  const getBranchDisplayValue = (id: number) => {
    const branch = branches.find((b) => b.id === id);
    return branch ? branch.name : "";
  };
  const getBranchSearchValue = (id: number) => {
    const branch = branches.find((b) => b.id === id);
    return branch ? branch.name.toLowerCase() : "";
  };

  // Helper functions for Department dropdown
  const getDepartmentDisplayValue = (id: number) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : "";
  };
  const getDepartmentSearchValue = (id: number) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name.toLowerCase() : "";
  };

  // Helper functions for Employee dropdown
  const getEmployeeDisplayValue = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name : "";
  };
  const getEmployeeSearchValue = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.name} ${emp.phone}`.toLowerCase() : "";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">{initialData ? "Edit Department" : "Add Department"}</h1>
          <p className="text-(--text-secondary)">{initialData ? "Update department information" : "Create a new department"}</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all duration-200 cursor-pointer text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to data table
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col bg-(--bg-card) min-h-[83vh] rounded-xl border border-(--border-primary) shadow-sm overflow-hidden p-5">
        <div className="grow space-y-6">
          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingLabelInput 
                id="department-name" 
                label="Name"
                value={name} 
                onChange={setName} 
                required 
                error={errors.name} 
                placeholder="Engineering" 
                icon={<Building2 className="h-4 w-4" />}
              />
              <FloatingLabelInput 
                id="department-code" 
                label="Code" 
                value={code} 
                onChange={setCode} 
                error={errors.code} 
                placeholder="ENG" 
                icon={<Building2 className="h-4 w-4" />}
              />
              <FloatingSearchableDropdown
                id="branch-select"
                label={<>Branch <span className="text-red-500">*</span></>}
                value={branchId}
                onChange={(id) => setBranchId(id)}
                options={branches.map(b => b.id)}
                getDisplayValue={getBranchDisplayValue}
                getSearchValue={getBranchSearchValue}
                placeholder="Select Branch"
                icon={<Building2 className="h-4 w-4" />}
                error={errors.branchId}
              />
            </div>
          </FormSection>

          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingSearchableDropdown
                id="parent-department-select"
                label="Parent Department (Optional)"
                value={parentDepartmentId}
                onChange={(id) => setParentDepartmentId(id)}
                options={departments.map(d => d.id)}
                getDisplayValue={getDepartmentDisplayValue}
                getSearchValue={getDepartmentSearchValue}
                placeholder="Select Parent Department"
                icon={<Building className="h-4 w-4" />}
              />

              <FloatingSearchableDropdown
                id="head-of-department-select"
                label={<>Head of Department <span className="text-red-500">*</span></>}
                value={headOfDepartmentId}
                onChange={(id) => setHeadOfDepartmentId(id)}
                options={employees.map(e => e.id)}
                getDisplayValue={getEmployeeDisplayValue}
                getSearchValue={getEmployeeSearchValue}
                placeholder="Select Head of Department"
                icon={<User className="h-4 w-4" />}
                error={errors.headOfDepartmentId}
              />
            </div>
          </FormSection>
          
          <FormSection>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Software Engineering Department"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-(--border-primary) text-sm bg-(--bg-input) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) resize-none placeholder:text-(--text-muted) hover:border-(--border-secondary) transition-all duration-200"
            />
          </FormSection>
            
          <StatusRadio status={status} onChange={(value) => setStatus(value)} options={["active", "inactive"]} label={<>Status <span className="text-red-500">*</span></>} error={errors.status} />
        </div>

        <div className="shrink-0 pt-4">
          <FormActions loading={loading} onCancel={handleCancel} isEdit={!!initialData} />
        </div>
      </form>
    </div>
  );
}

export default DepartmentForm;