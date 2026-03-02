"use client";

import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

import { CreateGroupForm } from "./CreateGroupForm";
import { post } from "@/services/api-client";
import type { ApiEnvelope } from "@/types/api";

interface CreateGroupProps {
  onClose: (newGroup?: any) => void;
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

  const handleSubmit = async (name: string, description: string) => {
    if (!name.trim() || !token || !user) return;

    try {
      // Step 1: Create the group through the proxy API route
      const createResponse = await post<ApiEnvelope<CreateGroupResponse>>(
        "/groups",
        { name, description }
      );
      
      if (!createResponse.success || !createResponse.data) {
        console.error(createResponse.message || "Failed to create group");
        return;
      }

      const newGroup = createResponse.data;

      // Step 2: Add the creator as a member (required to send messages)
      if (user?.id) {
        console.log("Adding user as member, userId:", user.id, "groupId:", newGroup.id);
        await post<ApiEnvelope<{ added: number[]; skipped_already_member: number[]; skipped_invalid_user: number[] }>>(
          `/groups/${newGroup.id}/members`,
          { userIds: [user.id] }
        );
      }

      // Step 3: Refresh conversations to include the new group
      await refreshConversations();
      
      // Return the new group data so parent can handle navigation
      onClose(newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <CreateGroupForm
      onCancel={() => onClose()}
      onSubmit={handleSubmit}
    />
  );
}
