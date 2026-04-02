/**
 * Department service - client-side.
 * Handles all department-related API calls through BFF.
 */

import { get, post, patch, del } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Department, DepartmentListItem, DepartmentListResponse, DepartmentPayload } from "@/types/department";

export async function getDepartments(
  organisationId: number,
  page = 1,
  limit = 20,
  filters?: { branchId?: number; status?: string }
): Promise<DepartmentListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.branchId) params.set("branchId", String(filters.branchId));
  if (filters?.status) params.set("status", filters.status);
  const res = await get<ApiEnvelope<{ departments: DepartmentListItem[]; pagination: { page: number; limit: number; total: number } }>>(
    `/organisations/${organisationId}/departments?${params}`
  );
  return {
    departments: res.data.departments,
    pagination: res.data.pagination,
  };
}

export async function getDepartment(organisationId: number, departmentId: number): Promise<Department> {
  const res = await get<ApiEnvelope<Department>>(`/organisations/${organisationId}/departments/${departmentId}`);
  return res.data;
}

export async function createDepartment(organisationId: number, payload: DepartmentPayload): Promise<Department> {
  const res = await post<ApiEnvelope<Department>>(`/organisations/${organisationId}/departments`, payload);
  return res.data;
}

export async function updateDepartment(
  organisationId: number,
  departmentId: number,
  payload: Partial<DepartmentPayload>
): Promise<Department> {
  const res = await patch<ApiEnvelope<Department>>(
    `/organisations/${organisationId}/departments/${departmentId}`,
    payload
  );
  return res.data;
}

export async function deleteDepartment(
  organisationId: number,
  departmentId: number
): Promise<{ id: number; deletedAt: string }> {
  const res = await del<ApiEnvelope<{ id: number; deletedAt: string }>>(
    `/organisations/${organisationId}/departments/${departmentId}`
  );
  return res.data;
}
