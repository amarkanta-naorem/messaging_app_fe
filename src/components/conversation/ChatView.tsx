"use client";

import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { FormatTime } from "@/utils/FormatTime";
import { fasterOne } from "../fonts/faster-one";
import { useState, useRef, useEffect } from "react";
import { ContactDrawer } from "../employee/contact-drawer";
import { SendHorizontal, MoreVertical, Search, Mic, CircleX, CheckCheck, Image as ImageIcon } from "lucide-react";

export default function ChatView() {
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeConversation, messages, loadingMessages, sendMessage, selectConversation } = useChat();
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConversation?.id]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    if (activeConversation) {
      sendMessage(text);
      setInputText("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseChat = () => {
    selectConversation(null as any);
  };

  const getStatusIcon = (status?: string) => {
    if (status === "read") return <CheckCheck size={14} className="text-[#34b7f1]" />;
    if (status === "delivered") return <CheckCheck size={14} className="text-[#999]" />;
    if (status === "sent") return <span className="text-[#999]">✓</span>;
    return null;
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#f0f2f5]">
         <div className="text-center">
            <h1 className={`text-[#41525d] text-4xl font-light mb-4 ${fasterOne.className}`}>
              <span className="text-red-700">Globi</span>
              <span className="text-[#25d366]">Chat</span>
            </h1>
            <p className="text-[#667781] text-sm">Send and receive messages within your company</p>
         </div>
      </div>
    );
  }

  const isGroup = (activeConversation as any).isGroup;

  return (
    <div className="flex flex-col h-full bg-[#efeae2]" onContextMenu={handleContextMenu}>
      {/* Chat Background */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/image/chat-bg.jpg')", opacity: 0.4 }}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
      {/* Header */}
      <div className="h-15 bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0 z-10 border-b border-gray-200">
         <div className="flex items-center cursor-pointer" onClick={() => setShowContactDrawer(true)}>
            <div className="w-10 h-10 rounded-full bg-[#ccc] overflow-hidden mr-3">
               {activeConversation.participant.avatar ? (
                 <img src={activeConversation.participant.avatar} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg bg-[#999]">
                   {activeConversation.participant.name?.charAt(0).toUpperCase() || '?'}
                 </div>
               )}
            </div>
            <div>
              <div className="text-[#111b21] text-[15px] font-medium">{activeConversation.participant.name}</div>
              <div className="text-[#667781] text-[12px]">
                {isGroup ? 'Group' : 'Online'}
              </div>
            </div>
         </div>
         <div className="flex items-center gap-4 text-[#667781]">
             <Search size={20} className="cursor-pointer" />
             <MoreVertical size={20} className="cursor-pointer" />
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {loadingMessages ? (
          <div className="text-center text-gray-500 mt-4">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No messages yet</div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, index) => {
              const isOwn = msg.senderId === user?.id || (!(msg as any).senderId && !!(msg as any).clientMessageId);
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isFirstFromSender = !prevMsg || prevMsg.senderId !== msg.senderId;
              const showSenderName = !isOwn && isGroup && (msg as any).senderName && isFirstFromSender;
              const showAvatar = !isOwn && isGroup && isFirstFromSender;
              
              return (
                <div key={msg.id || (msg as any).clientMessageId} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-5`}>
                  <div className="flex items-end max-w-[65%]">
                    
                    {/* Avatar */}
                    {showAvatar && (
                      <div className="w-7 h-7 rounded-full bg-[#008069] shrink-0 mr-1">
                        {
                          (msg as any).senderAvatar ? (
                            <img src={(msg as any).senderAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                              {(msg as any).senderName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )
                        }
                      </div>
                    )}
                    
                    {!isOwn && isGroup && !showAvatar && <div className="w-7 mr-1"></div>}

                    <div className="flex flex-col">
                      {showSenderName && (
                        <div className="text-[#008069] text-[11px] font-medium ml-1 mb-0.5">
                          {(msg as any).senderName}
                        </div>
                      )}
                      
                      <div className={`px-2 py-1 rounded-[7.5px] text-[14.2px] ${isOwn ? "bg-[#d9fdd3]" : "bg-white"}`}>
                        {(msg.content as any)?.type === 'image' && (
                          <img src={(msg.content as any).url} alt="" className="max-w-50 rounded-lg" />
                        )}
                        <span className="text-[#111b21]">
                          {(msg.content as any)?.text || (msg.content as any)?.caption || ''}
                        </span>
                        <span className="text-[10px] text-[#667] float-right ml-1 mt-1">
                          {msg.createdAt && FormatTime(msg.createdAt.toString())}
                          {/* {isOwn && <span className="ml-1">{getStatusIcon(msg.status)}</span>} */}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="h-14 bg-[#f0f2f5] px-4 flex items-center gap-2 shrink-0">
         <input 
           ref={inputRef}
           type="text" 
           value={inputText} 
           onChange={(e) => setInputText(e.target.value)} 
           onKeyDown={handleKeyDown}
           placeholder="Type a message..."
           className="flex-1 h-9 px-3 rounded-lg bg-white text-[14px] outline-none"
         />
         <button onClick={handleSend} className="text-[#008069] p-1">
           <SendHorizontal size={24} />
         </button>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed bg-white shadow-lg p-2 z-100 rounded-lg" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded" onClick={handleCloseChat}>
            Close chat
          </button>
        </div>
      )}
      
      {/* Contact Drawer */}
      {showContactDrawer && (
        <ContactDrawer
          isOpen={showContactDrawer}
          onClose={() => setShowContactDrawer(false)}
          conversation={activeConversation}
        />
      )}
      </div>
    </div>
  );
}
