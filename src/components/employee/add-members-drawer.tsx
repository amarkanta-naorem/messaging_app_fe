"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, Check, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/config";
import Image from "next/image";

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
  isJoined: boolean;
}

interface AddMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  onMembersAdded: () => void;
}

export const AddMembersDrawer = ({ isOpen, onClose, groupId, onMembersAdded }: AddMembersDrawerProps) => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchContacts();
      setSelectedIds(new Set());
      setSearchQuery("");
    }
  }, [isOpen, token, groupId]);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setContacts(result.data);
      } else {
        setError(result.message || "Failed to fetch contacts");
      }
    } catch (err) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    try {
        const response = await fetch(`${API_BASE}/groups/${groupId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userIds: Array.from(selectedIds)
            })
        });
        
        const result = await response.json();
        if (result.success) {
            onMembersAdded();
            onClose();
        } else {
            setError(result.message || "Failed to add members");
        }
    } catch (error) {
        console.error("Failed to add members", error);
    } finally {
        setSubmitting(false);
    }
  };

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      // Users not yet in the group (`isJoined: false`) should appear first.
      if (a.isJoined !== b.isJoined) {
        return a.isJoined ? 1 : -1;
      }
      // Secondary sort: alphabetical by name.
      return a.name.localeCompare(b.name);
    });
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return sortedContacts;
    const lowerQuery = searchQuery.toLowerCase();
    return sortedContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(lowerQuery)
    );
  }, [sortedContacts, searchQuery]);

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className={`fixed inset-0 z-60 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
       <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}/>
       
       <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-[var(--bg-card)] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="flex flex-col p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shrink-0">
             <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-lg">Add Members</h3>
                <button onClick={onClose} className="p-1 hover:bg-[var(--bg-hover)] rounded-full transition-colors cursor-pointer text-[var(--text-secondary)]">
                   <X size={20} />
                </button>
             </div>
             <p className="text-xs text-[var(--text-muted)]">Select people to add to this group</p>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name or phone..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-secondary)] focus:outline-none focus:border-[var(--accent-secondary)] text-sm bg-[var(--bg-input)] text-[var(--text-primary)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
             {loading ? (
                <div className="p-4 space-y-4">
                   {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                         <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full shrink-0" />
                         <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/3" />
                            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/4" />
                         </div>
                      </div>
                   ))}
                </div>
             ) : error ? (
                <div className="p-8 text-center text-[var(--color-error)] text-sm">{error}</div>
             ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-sm">No contacts found</div>
             ) : (
                <div>
                   {filteredContacts.map((contact, index) => {
                      const prevContact = index > 0 ? filteredContacts[index - 1] : null;
                      const showDivider = prevContact && !prevContact.isJoined && contact.isJoined;

                      return (
                        <div key={contact.id}>
                          {index > 0 &&
                            (showDivider ? (
                              <div className="relative py-3 px-3">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                  <div className="w-full border-t border-[var(--border-primary)]" />
                                </div>
                                <div className="relative flex justify-center">
                                  <span className="bg-[var(--bg-card)] px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                                    Already in group
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="border-t border-[var(--border-primary)]" />
                            ))}
                          <div
                            className={`flex items-center gap-3 p-3 transition-colors ${contact.isJoined ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)] cursor-pointer'} ${selectedIds.has(contact.id) ? 'bg-[var(--bg-hover)]' : ''}`}
                            onClick={() => !contact.isJoined && toggleSelection(contact.id)}
                          >
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
                                {contact.avatar ? (
                                  <Image src={contact.avatar} alt={contact.name} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={20} className="text-[var(--text-muted)]" />
                                )}
                              </div>
                              {selectedIds.has(contact.id) && (
                                <div className="absolute -bottom-1 -right-1 bg-[var(--accent-secondary)] text-white rounded-full p-0.5 border-2 border-[var(--bg-card)] animate-in zoom-in duration-200">
                                  <Check size={10} strokeWidth={4} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{contact.name}</h4>
                              <p className="text-xs text-[var(--text-muted)] truncate">{contact.phone}</p>
                            </div>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${selectedIds.has(contact.id) && !contact.isJoined ? 'bg-[var(--accent-secondary)] border-[var(--accent-secondary)]' : 'border-[var(--border-secondary)]'} ${contact.isJoined ? 'bg-[var(--bg-tertiary)] border-[var(--border-secondary)]' : ''}`}>
                              {selectedIds.has(contact.id) && !contact.isJoined && <Check size={14} className="text-white" />}
                              {contact.isJoined && <Check size={14} className="text-[var(--text-muted)]" />}
                            </div>
                          </div>
                        </div>
                      );
                   })}
                </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-card)] shrink-0">
             <button
                onClick={handleAddMembers}
                disabled={selectedIds.size === 0 || submitting}
                className="w-full bg-[var(--accent-secondary)] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
             >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Adding..." : `Add ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
             </button>
          </div>
       </div>
    </div>
  );
};
