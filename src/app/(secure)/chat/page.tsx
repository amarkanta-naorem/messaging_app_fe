"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import SettingView from "@/components/utils/SettingView";
import ProfileView from "@/components/utils/ProfileView";
import ChatView from "@/components/conversation/ChatView";
import { fasterOne } from "@/components/fonts/faster-one";
import ChatMenuModal from "@/components/utils/ChatMenuModal";
import CreateGroup from "@/components/conversation/CreateGroup";
import { useTheme } from "@/components/providers/ThemeProvider";
import AllConversation from "@/components/conversation/AllConversation";
import { EllipsisVertical, MessageCirclePlus, Search, Settings, MessageCircleMore, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading } = useAuth();
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

  useEffect(() => {
    if (showProfile || showSettings) {
      setProfileLoading(true);
      const timer = setTimeout(() => setProfileLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showProfile, showSettings]);

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
            {(user.organisation_employees?.role === 'admin' || user.organisation_employees?.role === 'owner') && (
              <Link href="/dashboard" title="Redirect to Dashboard Page" className="text-(--text-secondary) hover:text-(--text-primary) p-2 rounded-full hover:bg-(--bg-hover) transition-colors">
                <Image src="/icons/dashboard.svg" alt="" width={22} height={22} />
              </Link>
            )}
            <button type="button" title="Setting" onClick={() => { setShowSettings(true); setShowProfile(false); }} className="text-(--text-secondary) hover:text-(--text-primary) p-2 rounded-full hover:bg-(--bg-hover) transition-colors cursor-pointer">
              <Settings size={22} />
            </button>
            {/* Profile Preloader */}
            {profileLoading ? (
              <div className="w-8 h-8 rounded-full bg-(--bg-hover) flex items-center justify-center animate-pulse">
                <Loader2 size={16} className="text-(--text-muted) animate-spin" />
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => { setShowProfile(true); setShowSettings(false); }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#dfe3e5] dark:bg-[#3d4a51] flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right Side - Sidebar & Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-100 shrink-0 bg-(--bg-card) border border-(--border-primary) rounded-tl-2xl flex flex-col overflow-y-scroll custom-scrollbar">
            {/* Search Bar */}
            <div className={`flex items-center justify-between px-3 py-1.5 bg-(--bg-card) ${showSettings || showProfile ? 'hidden' : ''}`}>
              <h1 className="font-semibold text-xl text-(--text-secondary)">Chats</h1>
              <div className="flex">
                <button onClick={() => setShowNewMessage(!showNewMessage)} title="New Chat" className="hover:bg-(--bg-hover) p-2 rounded-full transition-colors text-(--text-secondary)">
                  <MessageCirclePlus size={22} />
                </button>
                {(user?.organisation_employees?.role === "admin" || user?.organisation_employees?.role === "owner") && (
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
                    {showMenu &&  <ChatMenuModal showMenu={showMenu} setShowMenu={setShowMenu} setShowNewMessage={setShowNewMessage} setShowCreateGroup={setShowCreateGroup}/>}
                  </div>
                )}
              </div>
            </div>
            <div className={`px-3 pb-2 border-b border-(--border-primary) bg-(--bg-card) ${showSettings || showProfile ? 'hidden' : ''}`}>
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

            {showSettings && <SettingView isDark={isDark} toggle={toggle} onClose={() => setShowSettings(false)}/>}
            {showProfile && <ProfileView user={user} onClose={() => setShowProfile(false)} />}

            {/* Conversation List */}
            {!showSettings && !showProfile && (
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {loadingConversations ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (!Array.isArray(conversations) || conversations.length === 0) && !showNewMessage ? (
                  <div className="p-8 text-center text-(--text-muted) text-sm">No conversations yet. Click the new chat icon to start messaging.</div>
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
