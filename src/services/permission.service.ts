/**
 * Permission service - client-side.
 * Handles all permission-related API calls through BFF.
 */

import { get, post, patch, del } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Permission, PermissionListResponse, PermissionPayload } from "@/types/permission";

export async function getPermissions(
  page = 1,
  limit = 20,
  module?: string
): Promise<PermissionListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (module) params.set("module", module);
  const res = await get<ApiEnvelope<{ permissions: Permission[]; pagination: { page: number; limit: number; total: number } }>>(
    `/permissions?${params}`
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return {
    permissions: res.data.permissions,
    pagination: res.data.pagination,
  };
}

export async function getPermission(id: number): Promise<Permission> {
  const res = await get<ApiEnvelope<Permission>>(`/permissions/${id}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function createPermission(payload: PermissionPayload): Promise<Permission> {
  const res = await post<ApiEnvelope<Permission>>("/permissions", payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function updatePermission(id: number, payload: Partial<PermissionPayload>): Promise<Permission> {
  const res = await patch<ApiEnvelope<Permission>>(`/permissions/${id}`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function deletePermission(id: number): Promise<void> {
  await del<ApiEnvelope<void>>(`/permissions/${id}`);
}
