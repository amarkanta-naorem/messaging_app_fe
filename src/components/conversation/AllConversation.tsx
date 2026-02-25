"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { Conversation } from "@/lib/conversations";
import { FormatTime } from "@/utils/FormatTime";
import { API_BASE } from "@/lib/config";

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
}

interface Group {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  type: 'group';
  createdAt: string;
}

interface AllConversationProps {
  data: (Conversation | Group)[];
  showNewMessage: boolean;
  onClose: () => void;
}

export default function AllConversation({ data, showNewMessage, onClose }: AllConversationProps) {
  const { activeConversation, selectConversation } = useChat();
  const { token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  
  useEffect(() => {
    if (showNewMessage && token) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        setContactsError(null);
        setContacts([]);
        try {
          const response = await fetch(`${API_BASE}/contacts/organization`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          if (result.success) {
            setContacts(result.data);
          } else {
            throw new Error(result.message || "Failed to fetch contacts");
          }
        } catch (err) {
          setContactsError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setLoadingContacts(false);
        }
      };
      fetchContacts();
    } else {
      setContacts([]);
      setContactsError(null);
    }
  }, [showNewMessage, token]);

  return (
    <div className="relative h-full bg-white">
      <div className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out flex flex-col ${showNewMessage ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex-1 overflow-y-auto">
          <div className="pb-2">
            {loadingContacts && (
              <div className="p-4 text-center text-gray-500">Loading contacts...</div>
            )}
            {contactsError && (
              <div className="p-4 text-center text-red-500">{contactsError}</div>
            )}
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  const existing = data.find(
                    (c) => "participant" in c && c.participant.id === contact.id
                  ) as Conversation | undefined;
                  if (existing) {
                    selectConversation(existing);
                  } else {
                    selectConversation({
                      id: 0,
                      participant: contact,
                      unreadCount: 0,
                      lastMessage: null,
                    } as unknown as Conversation);
                  }
                  onClose();
                }}
                className="flex items-center px-3 py-3 cursor-pointer hover:bg-[#f5f6f6]"
              >
                <div className="w-12.25 h-12.25 rounded-full bg-gray-300 overflow-hidden mr-3 shrink-0">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt="" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-[#dfe3e5] font-semibold text-xl">{contact.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#111b21] text-[17px] font-normal truncate">{contact.name}</span>
                  </div>
                  <div className="text-[#667781] text-[14px] truncate">{contact.bio || "Hey there! I am using GlobiChat."}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.map((item) => {
        if (item.type === 'group') {
          const group = item as Group;
          return (
            <div
              key={group.id}
              onClick={() => selectConversation({
                id: group.id,
                participant: { id: -group.id, name: group.name, avatar: group.logo },
                lastMessage: null,
                unreadCount: 0,
                isGroup: true,
              } as unknown as Conversation)}
              className={`flex items-center px-3 cursor-pointer hover:bg-[#f5f6f6] group ${activeConversation?.id === group.id ? "bg-[#f0f2f5]" : "bg-white"}`}
              title={group.name}
            >
              <div className="py-3 pr-3">
                <div className="w-12.25 h-12.25 rounded-full bg-gray-300 overflow-hidden">
                  {group.logo ? (
                    <img src={group.logo} alt={group.name} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold text-xl bg-[#dfe3e5]">{group.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0 py-3 border-b border-gray-100 group-hover:border-transparent">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#111b21] text-[17px] font-normal truncate">{group.name}</span>
                  <span className="text-[12px] text-[#667781]">{FormatTime(group.createdAt.toString())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#667781] text-[14px] truncate flex-1 mr-2">{group.description || "Group"}</span>
                </div>
              </div>
            </div>
          );
        }
        const conv = item as Conversation;
        return (
          <div
            key={conv.id}
            onClick={() => selectConversation(conv)}
            className={`flex items-center px-3 cursor-pointer hover:bg-[#f5f6f6] group ${activeConversation?.id === conv.id ? "bg-[#f0f2f5]" : "bg-white"}`}
            title={conv.participant.name}
          >
            <div className="py-3 pr-3">
              <div className="w-12.25 h-12.25 rounded-full bg-gray-300 overflow-hidden">
                {conv.participant.avatar ? (
                  <img src={conv.participant.avatar} alt={conv.participant.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold text-xl bg-[#dfe3e5]">{conv.participant.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 py-3 border-b border-gray-100 group-hover:border-transparent">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[#111b21] text-[17px] font-normal truncate">{conv.participant.name} </span>
                {conv.lastMessage && (
                  <span className={`text-[12px] ${conv.unreadCount > 0 ? "text-[#25d366] font-medium" : "text-[#667781]"}`}>{conv.lastMessage.createdAt && FormatTime(conv.lastMessage.createdAt.toString())}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667781] text-[14px] truncate flex-1 mr-2">
                  {typeof (conv.lastMessage?.content as any)?.text === 'string' 
                    ? (conv.lastMessage?.content as any).text 
                    : "No messages"}
                </span>
                {conv.unreadCount > 0 && (
                  <span className="bg-[#25d366] text-white text-[12px] font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1">{conv.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
