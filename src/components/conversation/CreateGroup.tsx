"use client";

import { requestWithToast } from "@/services/api-client";
import type { ApiEnvelope } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { CreateGroupForm } from "./CreateGroupForm";
import { useAppDispatch } from "@/store/store";
import { setGlobalError } from "@/store/slices/errorSlice";

interface CreateGroupProps {
  onClose: (newGroup?: CreateGroupResponse) => void;
}

interface CreateGroupResponse {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  isAnnouncementOnly: boolean;
  organisationId: number;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

export default function CreateGroup({ onClose }: CreateGroupProps) {
  const { token, user } = useAuth();
  const { refreshConversations } = useChat();
  const dispatch = useAppDispatch();

  const handleSubmit = async (name: string, description: string) => {
    if (!name.trim() || !token || !user) return;

    // Step 1: Create the group through the proxy API route
    const createResponse = await requestWithToast<ApiEnvelope<CreateGroupResponse>>("/groups", {
      method: "POST",
      body: JSON.stringify({ name, description }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!createResponse) {
      // Error already handled by requestWithToast
      return;
    }
    
    if (!createResponse.success || !createResponse.data) {
      // Display user-friendly error instead of console error
      dispatch(setGlobalError({
        message: createResponse.message || "Failed to create group",
        type: 'error'
      }));
      return;
    }

    const newGroup = createResponse.data;

    // Step 2: Add the creator as a member (required to send messages)
    if (user?.id) {
      console.log("Adding user as member, userId:", user.id, "groupId:", newGroup.id);
      await requestWithToast<ApiEnvelope<{ added: number[]; skipped_already_member: number[]; skipped_invalid_user: number[] }>>(`/groups/${newGroup.id}/members`, {
        method: "POST",
        body: JSON.stringify({ userIds: [user.id] }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Step 3: Refresh conversations to include the new group
    await refreshConversations();
    
    // Return the new group data so parent can handle navigation
    onClose(newGroup);
  };

  return (
    <CreateGroupForm
      onCancel={() => onClose()}
      onSubmit={handleSubmit}
    />
  );
}
