/**
 * Branch service - client-side.
 * Handles all branch-related API calls through BFF.
 */

import { get, post, patch, del } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Branch, BranchListItem, BranchListResponse, BranchPayload } from "@/types/branch";

export async function getBranches(
  organisationId: number,
  page = 1,
  limit = 20,
  status?: string
): Promise<BranchListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  const res = await get<ApiEnvelope<{ branches: BranchListItem[]; pagination: { page: number; limit: number; total: number } }>>(
    `/organisations/${organisationId}/branches?${params}`
  );
  return {
    branches: res.data.branches,
    pagination: res.data.pagination,
  };
}

export async function getBranch(organisationId: number, branchId: number): Promise<Branch> {
  const res = await get<ApiEnvelope<Branch>>(`/organisations/${organisationId}/branches/${branchId}`);
  return res.data;
}

export async function createBranch(organisationId: number, payload: BranchPayload): Promise<Branch> {
  const res = await post<ApiEnvelope<Branch>>(`/organisations/${organisationId}/branches`, payload);
  return res.data;
}

export async function updateBranch(
  organisationId: number,
  branchId: number,
  payload: Partial<BranchPayload>
): Promise<Branch> {
  const res = await patch<ApiEnvelope<Branch>>(`/organisations/${organisationId}/branches/${branchId}`, payload);
  return res.data;
}

export async function deleteBranch(organisationId: number, branchId: number): Promise<{ id: number; deletedAt: string }> {
  const res = await del<ApiEnvelope<{ id: number; deletedAt: string }>>(
    `/organisations/${organisationId}/branches/${branchId}`
  );
  return res.data;
}
