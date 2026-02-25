"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import ChatView from "@/components/conversation/ChatView";
import CreateGroup from "@/components/conversation/CreateGroup";
import AllConversation from "@/components/conversation/AllConversation";
import { EllipsisVertical, MessageCirclePlus, Search, Users, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { fasterOne } from "@/components/fonts/faster-one";
import Link from "next/link";
import Image from "next/image";

export default function ChatPage() {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading, logout } = useAuth();
  const { conversations, loadingConversations, selectConversation, socketError } = useChat();
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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#25D366] border-t-transparent mb-4" />
        <div className="text-xl text-gray-500 font-medium">
            Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      {/* Header */}
      <div className="h-14 px-4 flex items-center bg-white border-b border-gray-200 shrink-0">
        <h1 className={`text-[#41525d] text-2xl font-light ${fasterOne.className}`}>
          <span className="text-red-700">Globi</span>
          <span className="text-[#25d366]">Chat</span>
        </h1>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Icons */}
        <div className="w-16 shrink-0 bg-[#f0f2f5] border-r border-gray-200 py-4 flex flex-col items-center justify-between">
          <button onClick={() => setShowNewMessage(!showNewMessage)} title="New Chat" className="hover:bg-gray-200 p-2 rounded-full transition-colors text-[#54656f]">
            <MessageCirclePlus size={26} />
          </button>
          <div className="flex flex-col items-center space-y-5">
            <Link href="/dashboard" title="Redirect to Dashboard Page" className="text-[#54656f] hover:text-[#3b4a54]">
              <Image src="/icons/dashboard.svg" alt="" width={25} height={25} />
            </Link>
            <button type="button" title="Setting" onClick={() => setShowSettings(true)} className="text-[#54656f] hover:text-[#3b4a54] p-2 rounded-full hover:bg-gray-200 transition-colors">
              <Settings size={26} />
            </button>
            <div className="cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#dfe3e5] flex items-center justify-center text-gray-600">
                    <span className="font-semibold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Side - Sidebar & Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-100 shrink-0 bg-white flex flex-col border-r border-gray-200 overflow-hidden">
            {/* Search Bar */}
            <div className={`grid grid-cols-12 gap-1 px-3 py-2 border-b border-[#e9edef] bg-white ${showSettings ? 'hidden' : ''}`}>
              <div className="col-span-11 bg-[#f0f2f5] rounded-lg flex items-center px-4 py-2">
                  <Search size={18} className="text-[#54656f] mr-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or start new chat"
                    className="bg-transparent w-full focus:outline-none text-[15px] text-[#3b4a54] placeholder:text-[#54656f]"
                  />
              </div>
              <div className="relative col-span-1">
                    <button
                      title="Menu"
                      className={`hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer ${showMenu ? "bg-gray-200" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                    >
                      <EllipsisVertical size={22} />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-12 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-2 w-56 z-50 rounded-xl border border-gray-100 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => {
                          setShowMenu(false);
                          setShowNewMessage(false);
                          setShowCreateGroup(true);
                        }}>
                          <Users size={20} className="text-gray-500" />
                          New group
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => router.push("/dashboard")}>
                          <LayoutDashboard size={20} className="text-gray-500" />
                          Dashboard
                        </div>
                        <div className="my-1 border-t border-gray-100"></div>
                        <div className="px-4 py-3 hover:bg-red-50 cursor-pointer text-red-600 text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={logout}>
                          <LogOut size={20} />
                          Log out
                        </div>
                      </div>
                    )}
                  </div>
            </div>

            {/* Settings View - Inline in Sidebar */}
            {showSettings && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5]">
                {/* Header */}
                <div className="bg-[#00a884] px-4 py-3 flex items-center gap-3 shrink-0">
                  <button onClick={() => setShowSettings(false)} className="text-white hover:opacity-80 p-1 -ml-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <h3 className="text-white text-lg font-medium">Settings</h3>
                </div>
                {/* Theme Toggle */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-4">
                  <div className="bg-[#f0f2f5] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#111b21] text-[16px] font-medium">Dark Mode</span>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                    <p className="text-[#667781] text-[13px]">Enable dark mode for a better experience in low light.</p>
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
                  <div className="p-8 text-center text-gray-500 text-sm">
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
          <div className="flex-1 flex flex-col h-full bg-[#efeae2] border border-gray-200 relative overflow-hidden">
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
