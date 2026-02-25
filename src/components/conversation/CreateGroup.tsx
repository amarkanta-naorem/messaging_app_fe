"use client";

import { useState } from "react";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { API_BASE } from "@/lib/config";

interface CreateGroupProps {
  onClose: (newGroup?: any) => void;
}

export default function CreateGroup({ onClose }: CreateGroupProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const { refreshConversations } = useChat();

  const handleCreate = async () => {
    if (!name.trim() || !token || !user) return;

    setLoading(true);
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
        setLoading(false);
        return;
      }

      const newGroup = createResult.data;

      // Step 2: Add the creator as a member (required to send messages)
      if (user?.id) {
        console.log("Adding user as member, userId:", user.id, "groupId:", newGroup.id);
        const memberResponse = await fetch(`${API_BASE}/groups/${newGroup.id}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [user.id] }),
        });
        const memberResult = await memberResponse.json();
        console.log("Add member result:", memberResult);
      }

      // Step 3: Refresh conversations to include the new group
      await refreshConversations();
      
      // Return the new group data so parent can handle navigation
      onClose(newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f0f2f5] animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="bg-[#008069] h-15 flex items-end px-6 pb-4 text-white shrink-0">
        <div className="flex items-center gap-8">
          <button onClick={onClose} className="hover:bg-white/10 rounded-full p-1 transition-colors cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <div className="text-[19px] font-medium">New group</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center pt-10 px-4">
            {/* Avatar Placeholder */}
            <div className="relative mb-10 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-[#dfe3e5] flex items-center justify-center overflow-hidden">
                    <Camera size={32} className="text-white" />
                </div>
                <div className="absolute inset-0 bg-black/30 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs uppercase font-medium">
                    <Camera size={24} className="mb-1" />
                    <span>Add Icon</span>
                </div>
            </div>

            {/* Name Input */}
            <div className="w-full max-w-[85%] mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Group subject"
                    className="w-full bg-transparent border-b-2 border-[#008069] py-1 px-2 text-[#3b4a54] text-[17px] placeholder:text-[#8696a0] focus:outline-none"
                    maxLength={25}
                />
                <div className="flex justify-end mt-2">
                    <span className="text-[#8696a0] text-xs">{25 - name.length}</span>
                </div>
            </div>
            
            {/* Description Input */}
            <div className="w-full max-w-[85%] mb-10">
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Group description (optional)"
                    className="w-full bg-transparent border-b border-[#e9edef] py-1 px-2 text-[#3b4a54] text-[15px] placeholder:text-[#8696a0] focus:outline-none focus:border-[#008069] transition-colors"
                />
            </div>
            
            <div className="flex justify-center animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={handleCreate}
                    disabled={!name.trim() || loading}
                    className="w-12 h-12 bg-[#008069] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#006d59] transition-colors disabled:opacity-70"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Check size={24} strokeWidth={3} />
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
