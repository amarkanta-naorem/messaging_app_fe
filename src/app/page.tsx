"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import ChatView from "@/components/conversation/ChatView";
import AllConversation from "@/components/conversation/AllConversation";
import { MessageSquarePlus } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { conversations, loadingConversations, socketError } = useChat();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-12">
        <div className="col-span-3 h-screen overflow-y-auto">
          <div className="bg-[#F0F2F5] h-[8vh] w-full flex items-center px-5 shadow">
            <div className="flex items-center justify-between w-full">
              <button type="button" onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full bg-gray-300 shrink-0 overflow-hidden cursor-pointer">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    width={48}
                    height={48}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center text-gray-600 font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              <div>
                <button
                  className="text-white cursor-pointer bg-[#15552d] p-1.5 rounded-full"
                  onClick={() => setShowNewMessage(true)}
                  title="New Message"
                >
                  <MessageSquarePlus size={20} color="#25D366" />
                </button>
              </div>
            </div>
          </div>

          {
            showProfile && (
              <div className="w-full bg-[#202C33] px-4 py-3 flex items-center justify-between">
                {/* Left: name + status */}
                <div className="flex flex-col">
                  <h1 className="text-white text-lg font-medium leading-tight">
                    {user.name}
                  </h1>

                  {socketError ? (
                    <span className="text-xs text-red-400">
                      {socketError}
                    </span>
                  ) : (
                    <span className="text-xs text-[#8696A0]">
                      online
                    </span>
                  )}
                </div>

                {/* Right: actions */}
                <button
                  onClick={logout}
                  className="text-sm text-red-400 hover:text-red-300 transition"
                >
                  Logout
                </button>
              </div>
            )
          }

          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : conversations.length === 0 && !showNewMessage ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            <AllConversation
              data={conversations}
              showNewMessage={showNewMessage}
              onClose={() => setShowNewMessage(false)}
            />
          )}
        </div>
        <div className="col-span-9 h-screen">
          <ChatView />
        </div>
      </div>
    </div>
  );
}
