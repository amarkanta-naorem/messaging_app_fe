/**
 * Department service - client-side.
 * Handles all department-related API calls through BFF.
 */

import { get, post, patch, del } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Department, DepartmentListItem, DepartmentListResponse, DepartmentPayload } from "@/types/department";

export async function getDepartments(
  page = 1,
  limit = 20,
  filters?: { branchId?: number; status?: string }
): Promise<DepartmentListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.branchId) params.set("branchId", String(filters.branchId));
  if (filters?.status) params.set("status", filters.status);
  const res = await get<ApiEnvelope<{ departments: any[]; pagination: { page: number; limit: number; total: number } }>>(
    `/departments?${params}`
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  const departments = res.data.departments.map((d: any) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    status: d.status,
    level: d.level,
    createdAt: d.createdAt,
    branchId: d.branchId ?? null,
    branchName: d.branch?.name ?? null,
    parentDepartmentId: d.parentDepartmentId ?? null,
    headOfDepartmentId: d.headOfDepartmentId ?? null,
    headOfDepartmentName: d.headOfDepartment?.name ?? null,
    headOfDepartmentPhone: d.headOfDepartment?.phone ?? null,
    headOfDepartmentAvatar: d.headOfDepartment?.avatar ?? null,
  }));
  return {
    departments,
    pagination: res.data.pagination,
  };
}

export async function getDepartment(departmentId: number): Promise<Department> {
  const res = await get<ApiEnvelope<Department>>(`/departments/${departmentId}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function createDepartment(payload: DepartmentPayload): Promise<Department> {
  const res = await post<ApiEnvelope<Department>>(`/departments`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function updateDepartment(
  departmentId: number,
  payload: Partial<DepartmentPayload>
): Promise<Department> {
  const res = await patch<ApiEnvelope<Department>>(
    `/departments/${departmentId}`,
    payload
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function deleteDepartment(
  departmentId: number
): Promise<{ id: number; deletedAt: string }> {
  const res = await del<ApiEnvelope<{ id: number; deletedAt: string }>>(
    `/departments/${departmentId}`
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}
