/**
 * Group service - client-side.
 * SRP: Handles all group-related API calls through BFF.
 */

import { get, post, patch } from "./api-client";
import type { GroupDetails } from "@/types";
import type { ApiEnvelope } from "@/types/api";

export interface CreateGroupPayload {
  name: string;
  description?: string;
}

export async function createGroup(payload: CreateGroupPayload): Promise<{ id: number; name: string; logo: string | null }> {
  const res = await post<ApiEnvelope<{ id: number; name: string; logo: string | null }>>(
    "/groups",
    payload
  );
  return res.data;
}

export async function getGroup(groupId: number): Promise<GroupDetails> {
  const res = await get<ApiEnvelope<GroupDetails>>(`/groups/${groupId}`);
  return res.data;
}

export async function addGroupMembers(groupId: number, userIds: number[]): Promise<void> {
  await post<ApiEnvelope<{ success: boolean }>>(`/groups/${groupId}/members`, {
    userIds,
  });
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  logo?: File;
  isAnnouncementOnly?: boolean;
  isActive?: boolean;
}

export async function updateGroup(groupId: number, payload: UpdateGroupPayload): Promise<GroupDetails> {
  if (payload.logo) {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.description) formData.append("description", payload.description);
    formData.append("logo", payload.logo);
    if (payload.isAnnouncementOnly !== undefined) formData.append("isAnnouncementOnly", String(payload.isAnnouncementOnly));
    if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || "Failed to update group");
    }

    const res = await response.json();
    return res.data;
  }

  const res = await patch<ApiEnvelope<GroupDetails>>(`/groups/${groupId}`, payload);
  return res.data;
}
