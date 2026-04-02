/**
 * Department-related type definitions.
 * Matches API: /organisations/:organisationId/departments
 */

export type DepartmentStatus = "active" | "inactive";

export interface Department {
  id: number;
  organisationId: number;
  branchId: number | null;
  name: string;
  code: string | null;
  description: string | null;
  status: DepartmentStatus;
  level: number;
  parentDepartmentId: number | null;
  headOfDepartmentId: number | null;
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
