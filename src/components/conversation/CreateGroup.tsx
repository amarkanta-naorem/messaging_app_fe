"use client";

import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { API_BASE } from "@/lib/config";

import { CreateGroupForm } from "./CreateGroupForm";

interface CreateGroupProps {
  onClose: (newGroup?: any) => void;
}

export default function CreateGroup({ onClose }: CreateGroupProps) {
  const { token, user } = useAuth();
  const { refreshConversations } = useChat();

  const handleSubmit = async (name: string, description: string) => {
    if (!name.trim() || !token || !user) return;

    try {
      // Step 1: Create the group
      const createResponse = await fetch(`${API_BASE}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const createResult = await createResponse.json();
      
      if (!createResult.success || !createResult.data) {
        console.error(createResult.message || "Failed to create group");
        return;
      }

      const newGroup = createResult.data;

      // Step 2: Add the creator as a member (required to send messages)
      if (user?.id) {
        console.log("Adding user as member, userId:", user.id, "groupId:", newGroup.id);
        await fetch(`${API_BASE}/groups/${newGroup.id}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [user.id] }),
        });
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
