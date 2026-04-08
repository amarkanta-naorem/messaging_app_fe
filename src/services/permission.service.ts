import type { ApiEnvelope } from "@/types/api";
import { get, post, patch, del } from "./api-client";
import type { Permission, PermissionListResponse, PermissionPayload } from "@/types/permission";

export async function getPermissions(organisationId: number, page = 1, limit = 20, module?: string): Promise<PermissionListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (module) params.set("module", module);
  const res = await get<ApiEnvelope<{ permissions: Permission[]; pagination: { page: number; limit: number; total: number } }>>(`/organisations/${organisationId}/permissions?${params}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return {
    permissions: res.data.permissions,
    pagination: res.data.pagination,
  };
}

export async function getPermission(organisationId: number, id: number): Promise<Permission> {
  const res = await get<ApiEnvelope<Permission>>(`/organisations/${organisationId}/permissions/${id}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function createPermission(organisationId: number, payload: PermissionPayload): Promise<Permission> {
  const res = await post<ApiEnvelope<Permission>>(`/organisations/${organisationId}/permissions`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function updatePermission(organisationId: number, id: number, payload: Partial<PermissionPayload>): Promise<Permission> {
  const res = await patch<ApiEnvelope<Permission>>(`/organisations/${organisationId}/permissions/${id}`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function deletePermission(organisationId: number, id: number): Promise<void> {
  await del<ApiEnvelope<void>>(`/organisations/${organisationId}/permissions/${id}`);
}
