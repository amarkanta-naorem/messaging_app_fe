/**
 * Role service - client-side.
 * Handles all role-related API calls through BFF.
 */

import { get, post, patch, del } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Role, RoleListItem, RoleListResponse, RolePayload } from "@/types/role";

export async function getRoles(
  organisationId: number,
  page = 1,
  limit = 20,
  filters?: { scope?: string; isActive?: boolean }
): Promise<RoleListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.scope) params.set("scope", filters.scope);
  if (filters?.isActive !== undefined) params.set("isActive", String(filters.isActive));
  const res = await get<ApiEnvelope<{ roles: RoleListItem[]; pagination: { page: number; limit: number; total: number } }>>(
    `/organisations/${organisationId}/roles?${params}`
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return {
    roles: res.data.roles,
    pagination: res.data.pagination,
  };
}

export async function getRole(organisationId: number, roleId: number): Promise<Role> {
  const res = await get<ApiEnvelope<Role>>(`/organisations/${organisationId}/roles/${roleId}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function createRole(organisationId: number, payload: RolePayload): Promise<Role> {
  const res = await post<ApiEnvelope<Role>>(`/organisations/${organisationId}/roles`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function updateRole(
  organisationId: number,
  roleId: number,
  payload: Partial<RolePayload>
): Promise<Role> {
  const res = await patch<ApiEnvelope<Role>>(`/organisations/${organisationId}/roles/${roleId}`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function deleteRole(
  organisationId: number,
  roleId: number
): Promise<{ id: number; deletedAt: string }> {
  const res = await del<ApiEnvelope<{ id: number; deletedAt: string }>>(
    `/organisations/${organisationId}/roles/${roleId}`
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}
