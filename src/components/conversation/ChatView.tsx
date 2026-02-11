"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { FormatTime } from "@/utils/FormatTime";
import { SendHorizontal } from "lucide-react";

export default function ChatView() {
  const { activeConversation, messages, loadingMessages, sendMessage } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    if (activeConversation) {
      sendMessage(text);
      setInputText("");
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto" style={{ backgroundImage: "url('/chat_bg.png')", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center"}}>
        {loadingMessages ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 flex items-center justify-center h-full">Select a conversation to start chatting</div>
        ) : (
          <div>
            <div className="flex items-center justify-center p-2 bg-[#F0F2F5] h-[8vh] w-full shadow"></div>
            <div className="p-4">
              {
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? "bg-green-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                        <p>{msg.content.text}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-green-100" : "text-gray-500"}`}>
                          {FormatTime(msg.createdAt)}
                          {isOwn && <span className="ml-2">{msg.status === "delivered" ? "✓✓" : "✓"}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {activeConversation && (
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-white shadow border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !inputText.trim()}
              className="px-2 flex items-center space-x-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <SendHorizontal size={26} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
