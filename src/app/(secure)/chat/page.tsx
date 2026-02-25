"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import ChatView from "@/components/conversation/ChatView";
import CreateGroup from "@/components/conversation/CreateGroup";
import AllConversation from "@/components/conversation/AllConversation";
import { EllipsisVertical, MessageCirclePlus, Search, Users, LayoutDashboard, LogOut } from "lucide-react";

export default function ChatPage() {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { conversations, loadingConversations, socketError, selectConversation } = useChat();
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
    
    // If a new group was created, navigate to it
    if (newGroup && newGroup.id) {
      // Find the group in the conversations list (it should be there after refresh)
      const groupConversation = conversations.find(
        (c: any) => c.id === newGroup.id || (c.isGroup && c.id === newGroup.id)
      );
      
      if (groupConversation) {
        selectConversation(groupConversation);
      } else {
        // If not found immediately, create a temporary conversation object
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
    <div className="h-screen overflow-hidden bg-[#d1d7db]">
      <div className="h-full w-full max-w-425 mx-auto bg-white shadow-lg overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-full md:w-100 lg:w-112.5 flex flex-col border-r border-[#e9edef] h-full bg-white relative shrink-0">
          {/* Sidebar Header */}
          <div className="bg-[#f0f2f5] h-15 px-4 flex items-center justify-between shrink-0 z-10">
            <div className="cursor-pointer">
               {user.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-[#dfe3e5] flex items-center justify-center text-gray-600">
                    <span className="font-semibold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                 </div>
               )}
            </div>
            <div className="flex items-center gap-5 text-[#54656f]">
               <button onClick={() => setShowNewMessage(!showNewMessage)} title="New Chat" className="hover:bg-gray-200 p-2 rounded-full transition-colors">
                 <MessageCirclePlus size={22} />
               </button>
               <div className="relative">
                 <button
                   title="Menu"
                   className={`hover:bg-gray-200 p-2 rounded-full transition-colors ${showMenu ? "bg-gray-200" : ""}`}
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
                      //  if (selectConversation) selectConversation(null);
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
          </div>
          {/* Search Bar */}
          <div className="px-3 py-2 border-b border-[#e9edef] bg-white">
             <div className="bg-[#f0f2f5] rounded-lg flex items-center px-4 py-2">
                <Search size={18} className="text-[#54656f] mr-4" />
                <input 
                  type="text" 
                  placeholder="Search or start new chat" 
                  className="bg-transparent w-full focus:outline-none text-[15px] text-[#3b4a54] placeholder:text-[#54656f]" 
                />
             </div>
          </div>

          {/* Conversation List */}
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
               />
             )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col h-full bg-[#efeae2] relative">
          {showCreateGroup ? (
            <CreateGroup onClose={handleCloseCreateGroup} />
          ) : (
            <ChatView />
          )}
        </div>
      </div>
    </div>
  );
}
