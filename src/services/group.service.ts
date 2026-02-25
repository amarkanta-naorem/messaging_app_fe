/**
 * Group service - client-side.
 * SRP: Handles all group-related API calls through BFF.
 */

import { get, post } from "./api-client";
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
