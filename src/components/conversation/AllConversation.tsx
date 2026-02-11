"use client";

import { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { Conversation } from "@/lib/conversations";
import { FormatTime } from "@/utils/FormatTime";
import { sendMessage } from "@/lib/socket";
import { sendMessageToPhone } from "@/lib/messages";

interface AllConversationProps {
  data: Conversation[];
  showNewMessage: boolean;
  onClose: () => void;
}

export default function AllConversation({ data, showNewMessage, onClose }: AllConversationProps) {
  const { activeConversation, selectConversation, refreshConversations } = useChat();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const text = inputText.trim();
    const phone = phoneNumber.trim();
    if (!text || !phone) return;

    setSending(true);
    setError(null);
    try {
      const shouldUseSocket =
        activeConversation?.participant.id &&
        activeConversation.participant.phone === phone;

      if (shouldUseSocket) {
        const clientMessageId = crypto.randomUUID();

        sendMessage(
          {
            clientMessageId,
            receiverId: activeConversation.participant.id,
            content: { type: "text", text },
          },
          async (response) => {
            if ("code" in response) {
              setError(response.message);
              setSending(false);
              return;
            }
            setInputText("");
            setPhoneNumber("");
            onClose();
            await refreshConversations();
            setSending(false);
          }
        );
        return;
      }

      await sendMessageToPhone({
        receiverPhone: phone,
        content: { type: "text", text },
      });
      setInputText("");
      setPhoneNumber("");
      onClose();
      await refreshConversations();
      setSending(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setSending(false);
    }
  };

  return (
    <div className="divide-y">
      {showNewMessage && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="space-y-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              disabled={sending}
            />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              disabled={sending}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  setPhoneNumber("");
                  setInputText("");
                  setError(null);
                }}
                className="flex-1 px-3 py-1.5 border rounded-lg hover:bg-gray-200 text-sm"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !inputText.trim() || !phoneNumber.trim()}
                className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
      {data.map((conv) => (
        <div
          key={conv.id}
          onClick={() => selectConversation(conv)}
          className={`p-3 cursor-pointer flex items-center gap-3 ${
            activeConversation?.id === conv.id ? "border-b border-gray-200" : ""
          }`}
          title={conv.participant.name}
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0 overflow-hidden">
            {conv.participant.avatar ? (
              <img
                src={conv.participant.avatar}
                alt={conv.participant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                {conv.participant.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="font-medium truncate">{conv.participant.name}</span>
              {conv.lastMessage && (
                <span className="text-xs text-gray-500">
                  {FormatTime(conv.lastMessage.createdAt)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 truncate">
                {conv.lastMessage?.content.text || "No messages"}
              </p>
              {conv.unreadCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
