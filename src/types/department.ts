/**
 * Department-related type definitions.
 * Matches API: /departments
 */

export type DepartmentStatus = "active" | "inactive";

export interface Department {
  id: number;
  organisationId: number;
  branchId: number | null;
  branch: { id: number; name: string; managerId?: number; managerName?: string; managerEmail?: string; managerPhone?: string; managerAvatar?: string } | null;
  name: string;
  code: string | null;
  description: string | null;
  status: DepartmentStatus;
  level: number;
  parentDepartmentId: number | null;
  parentDepartment: { id: number; name: string } | null;
  headOfDepartmentId: number | null;
  headOfDepartment: { id: number; name: string; email?: string; phone?: string; avatar?: string } | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface DepartmentListItem {
  id: number;
  name: string;
  code: string | null;
  status: DepartmentStatus;
  level: number;
  createdAt: string;
  branchId: number | null;
  branchName: string | null;
  parentDepartmentId: number | null;
  headOfDepartmentId: number | null;
  headOfDepartmentName: string | null;
  headOfDepartmentPhone: string | null;
  headOfDepartmentAvatar: string | null;
}

export interface DepartmentPagination {
  page: number;
  limit: number;
  total: number;
}

export interface DepartmentListResponse {
  departments: DepartmentListItem[];
  pagination: DepartmentPagination;
}

export interface DepartmentPayload {
  name: string;
  code?: string;
  description?: string;
  branchId?: number;
  parentDepartmentId?: number;
  headOfDepartmentId?: number;
  status?: DepartmentStatus;
  level?: number;
}
