"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import ChatView from "@/components/conversation/ChatView";
import CreateGroup from "@/components/conversation/CreateGroup";
import AllConversation from "@/components/conversation/AllConversation";
import { EllipsisVertical, MessageCirclePlus, Search, Users, LayoutDashboard, LogOut, Settings, MessageCircleMore } from "lucide-react";
import { fasterOne } from "@/components/fonts/faster-one";
import Link from "next/link";
import Image from "next/image";

export default function ChatPage() {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading, logout } = useAuth();
  const { conversations, loadingConversations, selectConversation, socketError } = useChat();
  const { isDark, toggle } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const handleClick = () => setShowMenu(false);
    if (showMenu) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [showMenu]);

  const handleCloseCreateGroup = async (newGroup?: any) => {
    setShowCreateGroup(false);
    
    if (newGroup && newGroup.id) {
      const groupConversation = conversations.find(
        (c: any) => c.id === newGroup.id || (c.isGroup && c.id === newGroup.id)
      );
      
      if (groupConversation) {
        selectConversation(groupConversation);
      } else {
        selectConversation({
          id: newGroup.id,
          participant: { id: -newGroup.id, name: newGroup.name, avatar: newGroup.logo },
          lastMessage: null,
          unreadCount: 0,
          isGroup: true,
        } as any);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-transparent mb-4" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-(--bg-secondary)">
      {/* Header */}
      <div className="h-8 px-4 flex items-center bg-(--bg-secondary) shrink-0">
        <h1 className={`text-(--text-secondary) text-xl font-light ${fasterOne.className}`}>
          <span className="text-red-700">Globi</span>
          <span className="text-[#25d366]">Chat</span>
        </h1>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Icons */}
        <div className="w-10 shrink-0 bg-(--bg-secondary) py-4 flex flex-col items-center justify-between">
          <button type="button" title="All Conversation" onClick={() => setShowSettings(false)} className="hover:bg-(--bg-hover) p-2 rounded-full transition-colors text-(--text-secondary) cursor-pointer">
            <MessageCircleMore size={22} />
          </button>
          <div className="flex flex-col items-center space-y-5">
            <Link href="/dashboard" title="Redirect to Dashboard Page" className="text-(--text-secondary) hover:text-(--text-primary) p-2 rounded-full hover:bg-(--bg-hover) transition-colors">
              <Image src="/icons/dashboard.svg" alt="" width={22} height={22} />
            </Link>
            <button type="button" title="Setting" onClick={() => setShowSettings(true)} className="text-(--text-secondary) hover:text-(--text-primary) p-2 rounded-full hover:bg-(--bg-hover) transition-colors cursor-pointer">
              <Settings size={22} />
            </button>
            <div className="cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#dfe3e5] flex items-center justify-center text-gray-600">
                    <span className="font-semibold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Side - Sidebar & Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-100 shrink-0 bg-(--bg-card) border border-(--border-primary) rounded-tl-2xl flex flex-col overflow-y-scroll custom-scrollbar">
            {/* Search Bar */}
            <div className={`flex items-center justify-between px-3 py-1.5 bg-(--bg-card) ${showSettings ? 'hidden' : ''}`}>
              <h1 className="font-semibold text-xl text-(--text-secondary)">Chats</h1>
              <div className="flex">
                <button onClick={() => setShowNewMessage(!showNewMessage)} title="New Chat" className="hover:bg-(--bg-hover) p-2 rounded-full transition-colors text-(--text-secondary)">
                  <MessageCirclePlus size={22} />
                </button>
                <div className="relative">
                      <button
                        title="Menu"
                        className={`hover:bg-(--bg-hover) p-2 rounded-full transition-colors cursor-pointer text-(--text-secondary) ${showMenu ? "bg-(--bg-hover)" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(!showMenu);
                        }}
                      >
                        <EllipsisVertical size={22} />
                      </button>
                      {showMenu && (
                        <div className="absolute right-0 top-12 bg-(--bg-card) shadow-[0_4px_20px_rgba(0,0,0,0.1) py-2 w-56 z-50 rounded-xl border border-(--border-primary) origin-top-right animate-in fade-in zoom-in-95 duration-200">
                          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => {
                            setShowMenu(false);
                            setShowNewMessage(false);
                            setShowCreateGroup(true);
                          }}>
                            <Users size={20} className="text-(--text-muted)" />
                            New group
                          </div>
                          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => router.push("/dashboard")}>
                            <LayoutDashboard size={20} className="text-(--text-muted)" />
                            Dashboard
                          </div>
                          <div className="my-1 border-t border-(--border-primary)"></div>
                          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--color-error) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={logout}>
                            <LogOut size={20} />
                            Log out
                          </div>
                        </div>
                      )}
                    </div>
              </div>
            </div>
            <div className={`px-3 pb-2 border-b border-(--border-primary) bg-(--bg-card) ${showSettings ? 'hidden' : ''}`}>
              <div className="col-span-11 bg-(--bg-input) rounded-lg flex items-center px-4 py-2">
                <Search size={18} className="text-(--text-tertiary) mr-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or start new chat"
                  className="bg-transparent w-full focus:outline-none text-[15px] text-(--text-primary) placeholder:text-(--text-secondary)"
                />
              </div>
            </div>

            {/* Settings View - Inline in Sidebar */}
            {showSettings && (
              <div className="flex-1 flex flex-col overflow-hidden bg-(--bg-card)">
                {/* Header */}
                <div className="px-4 h-14 flex items-center gap-3 shrink-0 border-b border-gray-300">
                  <h3 className="font-semibold text-xl text-(--text-secondary)">Settings</h3>
                </div>
                {/* Theme Toggle */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  <div className="bg-(--bg-secondary) rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-(--text-primary) text-[16px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                      <button 
                        onClick={toggle}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isDark ? 'bg-(--bg-tertiary)' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDark ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                    <p className="text-(--text-muted) text-[13px]">{isDark ? 'Switch to light mode for a brighter interface.' : 'Switch to dark mode for a better experience in low light.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation List */}
            {!showSettings && (
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {loadingConversations ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (!Array.isArray(conversations) || conversations.length === 0) && !showNewMessage ? (
                  <div className="p-8 text-center text-(--text-muted) text-sm">
                    No conversations yet. Click the new chat icon to start messaging.
                  </div>
                ) : (
                  <AllConversation
                      data={Array.isArray(conversations) ? conversations : []}
                      showNewMessage={showNewMessage}
                      onClose={() => setShowNewMessage(false)}
                      searchQuery={searchQuery}
                    />
                )}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full bg-(--chat-bg) border-t border-(--border-primary) relative overflow-hidden">
            {showCreateGroup ? (
              <CreateGroup onClose={handleCloseCreateGroup} />
            ) : (
              <ChatView />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
