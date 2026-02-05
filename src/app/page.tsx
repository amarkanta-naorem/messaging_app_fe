"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Conversation, getConversations } from "@/lib/conversations";
import AllConversation from "@/components/conversation/AllConversation";

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      getConversations()
        .then((data) => setConversations(data.conversations))
        .catch((err) => console.error("Failed to fetch conversations:", err))
        .finally(() => setLoadingChats(false));
    }
  }, [user]);

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Logout</button>
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-3 border h-[85vh] overflow-y-auto">
          {loadingChats ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            <AllConversation data={conversations} />
          )}
        </div>
        <div className="col-span-9 border h-[85vh]"></div>
      </div>
    </div>
  );
}
