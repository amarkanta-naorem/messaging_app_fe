import { API_BASE } from "@/lib/config";
import { useEffect, useState } from "react";
import { ContactHeader } from "./contact-header";
import { useAuth } from "@/context/AuthContext";
import { ContactGroupsList } from "./contact-groups-list";
import { Calendar, Info, Mail, Users, X, UserPlus } from "lucide-react";
import { AddMembersDrawer } from "./add-members-drawer";

interface GroupMember {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "member";
}

// Ideally, these types would be in a shared `types` directory
interface ContactDetails {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  joinedAt: string;
  groups?: any[];
  group_members?: GroupMember[];
  isGroup?: boolean;
}

interface Conversation {
  id: number;
  participant: Partial<ContactDetails>; // Participant from a conversation might not have all details
  isGroup?: boolean;
  // other conversation properties
}

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string | null;
  conversation?: Conversation | null;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ContactDrawer = ({ isOpen, onClose, phone, conversation }: ContactDrawerProps) => {
  const { token } = useAuth();
  const [contact, setContact] = useState<Partial<ContactDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setContact(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (conversation?.isGroup && token) {
      const fetchGroupDetails = async () => {
        setLoading(true);
        setError(null);
        setContact(null);
        try {
          const response = await fetch(`${API_BASE}/groups/${conversation.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            const groupData = data.data;
            setContact({
              id: groupData.id,
              name: groupData.name,
              avatar: groupData.logo,
              bio: groupData.description || `${groupData.group_members.length} members`,
              isGroup: true,
              group_members: groupData.group_members,
              joinedAt: groupData.createdAt,
            });
          } else {
            setError(data.message || "Failed to fetch group details");
          }
        } catch (err) {
          console.error("Failed to fetch group details:", err);
          setError("An error occurred while fetching group details");
        } finally {
          setLoading(false);
        }
      };

      fetchGroupDetails();
      return;
    }

    const phoneToFetch = phone || conversation?.participant?.phone;

    if (phoneToFetch && token) {
      const fetchContactDetails = async () => {
        setLoading(true);
        setError(null);
        setContact(null);
        try {
          const response = await fetch(`${API_BASE}/contacts/${phoneToFetch}/organization`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setContact(data.data);
          } else {
            setError(data.message || "Failed to fetch contact details");
          }
        } catch (err) {
          console.error("Failed to fetch contact details:", err);
          setError("An error occurred while fetching details");
        } finally {
          setLoading(false);
        }
      };

      fetchContactDetails();
    } else if (conversation) {
      // Fallback if no phone number is available but we have conversation data
      setContact(conversation.participant);
    }
  }, [isOpen, phone, conversation, token, refreshKey]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}/>
      
      {/* Drawer */}
      <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer Header (Close Button) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Contact Info</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="w-24 h-24 bg-slate-200 rounded-full"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="w-full space-y-2 mt-8">
                <div className="h-12 bg-slate-200 rounded"></div>
                <div className="h-12 bg-slate-200 rounded"></div>
                <div className="h-12 bg-slate-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : contact ? (
            <>
              <ContactHeader contact={contact as ContactDetails} />
              
              <div className="p-6 space-y-6 border-b border-slate-200">
                <div className="space-y-4">
                  {contact.email && (
                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="text-slate-800">{contact.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Bio</p>
                      <p className="text-slate-800">{contact.bio || "No bio available"}</p>
                    </div>
                  </div>

                  {contact.joinedAt && (
                    <div className="flex items-start gap-3">
                      <Calendar size={20} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">{contact.isGroup ? 'Created At' : 'Joined'}</p>
                        <p className="text-slate-800">{formatDate(contact.joinedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {contact.groups && <ContactGroupsList groups={contact.groups} />}

              {contact.isGroup && contact.group_members && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Users size={16} />
                      {contact.group_members.length} Members
                    </h3>
                    <button 
                      onClick={() => setIsAddMembersOpen(true)}
                      className="text-[#008069] text-sm font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus size={16} />
                      Add Members
                    </button>
                  </div>
                  <div className="space-y-3">
                    {contact.group_members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            <span className="text-slate-500 font-medium text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-700">{member.name}</span>
                        </div>
                        {member.role === 'admin' && (
                          <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {contact?.isGroup && contact.id && (
        <AddMembersDrawer
          isOpen={isAddMembersOpen}
          onClose={() => setIsAddMembersOpen(false)}
          groupId={contact.id}
          onMembersAdded={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
};