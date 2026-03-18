"use client";

import { useState, useEffect } from "react";
import { get } from "@/services/api-client";
import { ContactItem } from "./ContactItem";
import type { ApiEnvelope } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { Conversation } from "@/lib/conversations";
import { ConversationItem } from "./ConversationItem";

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
  searchQuery?: string;
}

export default function AllConversation({ data, showNewMessage, onClose, searchQuery = "" }: AllConversationProps) {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { activeConversation, selectConversation } = useChat();
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  
  useEffect(() => {
    if (showNewMessage && token) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        setContactsError(null);
        setContacts([]);
        try {
          const response = await get<ApiEnvelope<Contact[]>>(`/contacts/organization`);
          if (response.success) {
            setContacts(response.data);
          } else {
            throw new Error(response.message || "Failed to fetch contacts");
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

  // Filter conversations based on search query
  const filteredData = data.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (item.type === 'group') {
      const group = item as Group;
      return group.name.toLowerCase().includes(query) || (group.description?.toLowerCase().includes(query) ?? false);
    }
    const conv = item as Conversation;
    return conv.participant.name.toLowerCase().includes(query) || conv.participant.phone?.toLowerCase().includes(query);
  });

  const handleContactClick = (contact: Contact) => {
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
  };

  const handleGroupClick = (group: Group) => {
    selectConversation({
      id: group.id,
      participant: { id: -group.id, name: group.name, avatar: group.logo },
      lastMessage: null,
      unreadCount: 0,
      isGroup: true,
    } as unknown as Conversation);
  };

  const handleConversationClick = (conv: Conversation) => {
    selectConversation(conv);
  };

  return (
    <div className="relative h-full bg-(--bg-card)">
      {/* Contact list for new message */}
      <div className={`absolute inset-0 bg-(--bg-card) transition-transform duration-300 ease-in-out flex flex-col ${showNewMessage ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex-1 overflow-y-auto">
          <div className="pb-2">
            {loadingContacts && (
              <div className="p-4 text-center text-(--text-muted)">Loading contacts...</div>
            )}
            {contactsError && (
              <div className="p-4 text-center text-red-500">{contactsError}</div>
            )}
            {contacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                onClick={() => handleContactClick(contact)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Conversation list */}
      {filteredData.map((item) => {
        if (item.type === 'group') {
          const group = item as Group;
          return (
            <ConversationItem
              key={group.id}
              id={group.id}
              name={group.name}
              avatar={group.logo}
              isGroup={true}
              isActive={activeConversation?.id === group.id}
              createdAt={group.createdAt}
              description={group.description || "Group"}
              onClick={() => handleGroupClick(group)}
            />
          );
        }
        const conv = item as Conversation;
        return (
          <ConversationItem
            key={conv.id}
            id={conv.id}
            participant={conv.participant}
            lastMessage={conv.lastMessage}
            unreadCount={conv.unreadCount}
            isGroup={false}
            isActive={activeConversation?.id === conv.id}
            onClick={() => handleConversationClick(conv)}
          />
        );
      })}
    </div>
  );
}
