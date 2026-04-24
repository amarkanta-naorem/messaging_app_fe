import { get } from "@/services/api-client";
import { useAppDispatch } from "@/store/store";
import type { ApiEnvelope } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { ContactHeader } from "./contact-header";
import { updateGroup, assignAdmin } from "@/services";
import { AddMembersDrawer } from "./add-members-drawer";
import { ContactGroupsList } from "./contact-groups-list";
import { setGlobalError } from "@/store/slices/errorSlice";
import { useEffect, useState, useRef, useMemo } from "react";
import { Calendar, Info, Mail, Users, X, UserPlus, Pencil, Image, Loader2, Shield, ChevronDown } from "lucide-react";

interface GroupMember {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "member";
  avatar: string | null;
}

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
  isAnnouncementOnly?: boolean;
  isActive?: boolean;
}

interface Conversation {
  id: number;
  participant: Partial<ContactDetails>;
  isGroup?: boolean;
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
  const { token, user } = useAuth();
  const dispatch = useAppDispatch();
  const [contact, setContact] = useState<Partial<ContactDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const groupMemberRole = contact?.group_members?.find(member => member.id === user?.id)?.role;
  const canAddMembers = groupMemberRole === "admin";
  const canEditGroup = groupMemberRole === "admin";

  const sortedMembers = useMemo(() => {
    if (!contact?.group_members) return [];
    return [...contact.group_members].sort((a, b) => {
      const aIsCurrentUser = a.id === user?.id;
      const bIsCurrentUser = b.id === user?.id;
      if (aIsCurrentUser && !bIsCurrentUser) return -1;
      if (!aIsCurrentUser && bIsCurrentUser) return 1;

      const aIsAdmin = a.role === "admin";
      const bIsAdmin = b.role === "admin";
      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [contact?.group_members, user?.id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingField) {
          handleFieldCancel();
        } else if (openPopoverId !== null) {
          setOpenPopoverId(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, editingField, openPopoverId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openPopoverId !== null) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-popover]')) {
          setOpenPopoverId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopoverId]);

  useEffect(() => {
    if (!isOpen) {
      setContact(null);
      setLoading(false);
      setError(null);
      setEditingField(null);
      setFieldError(null);
      setFieldSuccess(null);
      setOpenPopoverId(null);
      return;
    }

    if (conversation?.isGroup && token) {
      const fetchGroupDetails = async () => {
        setLoading(true);
        setError(null);
        setContact(null);
        try {
          const response = await get<ApiEnvelope<any>>(`/groups/${conversation.id}`);
          if (response.success) {
            const groupData = response.data;
            setContact({
              id: groupData.id,
              name: groupData.name,
              avatar: groupData.logo,
              bio: groupData.description || `${groupData.group_members.length} members`,
              isGroup: true,
              group_members: groupData.group_members,
              joinedAt: groupData.createdAt,
              isAnnouncementOnly: groupData.isAnnouncementOnly || false,
              isActive: groupData.isActive !== undefined ? groupData.isActive : true,
            });
            setFormData({
              name: groupData.name || "",
              description: groupData.description || "",
            });
          } else {
            setError(response.message || "Failed to fetch group details");
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
          const response = await get<ApiEnvelope<any>>(`/contacts/${phoneToFetch}/organization`);
          if (response.success) {
            setContact(response.data);
          } else {
            setError(response.message || "Failed to fetch contact details");
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
      setContact(conversation.participant);
    }
  }, [isOpen, phone, conversation, token, refreshKey]);

  const handleFieldEdit = (fieldName: string) => {
    if (!canEditGroup) return;
    setEditingField(fieldName);
    setFieldError(null);
    setFieldSuccess(null);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldError(null);
    setFieldSuccess(null);
    if (contact) {
      setFormData({
        name: contact.name || "",
        description: contact.bio || "",
      });
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleFieldSave = async (fieldName: 'name' | 'description') => {
    if (!canEditGroup || !contact?.id) return;
    
    setIsSaving(true);
    setFieldError(null);
    setFieldSuccess(null);

    try {
      const payload: Record<string, string> = {};
      
      if (fieldName === 'name' && formData.name !== contact.name) {
        payload.name = formData.name;
      } else if (fieldName === 'description' && formData.description !== (contact.bio || "")) {
        payload.description = formData.description;
      }

      if (Object.keys(payload).length > 0) {
        const response = await updateGroup(contact.id as number, payload);
        if (response) {
          setContact(prev => prev ? {
            ...prev,
            name: response.name,
            bio: response.description || `${prev.group_members?.length || 0} members`,
          } : null);
          setFieldSuccess("Updated successfully!");
          setTimeout(() => setFieldSuccess(null), 2000);
        }
      }
      
      setEditingField(null);
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (field: 'isAnnouncementOnly' | 'isActive') => {
    if (!canEditGroup || !contact?.id) return;
    
    setIsSaving(true);
    setFieldError(null);
    setFieldSuccess(null);

    try {
      const currentValue = contact[field] ?? (field === 'isActive' ? true : false);
      const payload = { [field]: !currentValue };
      
      const response = await updateGroup(contact.id as number, payload);
      if (response) {
        setContact(prev => prev ? {
          ...prev,
          [field]: !currentValue,
        } : null);
        setFieldSuccess("Updated successfully!");
        setTimeout(() => setFieldSuccess(null), 2000);
      }
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoClick = () => {
    if (!canEditGroup) return;
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFieldError(null);
    
    if (!file) return;
    
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFieldError("Invalid file type. Please upload a JPEG, JPG, or PNG image.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setFieldError(`File is too large (${sizeInMB}MB). Maximum size is 2MB.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoSave = async () => {
    if (!canEditGroup || !contact?.id || !logoFile) return;
    
    setIsSaving(true);
    setFieldError(null);
    setFieldSuccess(null);

    try {
      const response = await updateGroup(contact.id as number, { logo: logoFile });
      if (response) {
        setContact(prev => prev ? {
          ...prev,
          avatar: response.logo,
        } : null);
        setLogoFile(null);
        setLogoPreview(null);
        setFieldSuccess("Logo updated successfully!");
        setTimeout(() => setFieldSuccess(null), 2000);
      }
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Failed to update logo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoCancel = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFieldError(null);
  };

  const handleTogglePopover = (memberId: number) => {
    setOpenPopoverId(openPopoverId === memberId ? null : memberId);
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    dispatch(setGlobalError({
      message: `Remove ${memberName} functionality not yet implemented`,
      type: "info",
    }));
    setOpenPopoverId(null);
  };

  const handleAssignAdmin = async (memberId: number, memberName: string) => {
    if (!contact?.id) return;

    try {
      await assignAdmin(contact.id as number, memberId);
      
      setContact(prev => {
        if (!prev || !prev.group_members) return prev;
        return {
          ...prev,
          group_members: prev.group_members.map(member => member.id === memberId ? { ...member, role: "admin" as const } : member),
        };
      });

      dispatch(setGlobalError({
        message: `${memberName} has been assigned as admin`,
        type: "info",
      }));
      setOpenPopoverId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign admin role";
      
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        dispatch(setGlobalError({
          message: "Network error. Please check your connection and try again.",
          type: "error",
        }));
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        dispatch(setGlobalError({
          message: "Session expired. Please log in again.",
          type: "error",
        }));
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        dispatch(setGlobalError({
          message: "You don't have permission to assign admin roles.",
          type: "error",
        }));
      } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        dispatch(setGlobalError({
          message: "Group or member not found.",
          type: "error",
        }));
      } else if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
        dispatch(setGlobalError({
          message: "This member is already an admin.",
          type: "warning",
        }));
      } else {
        dispatch(setGlobalError({
          message: errorMessage,
          type: "error",
        }));
      }
    }
  };

  const getRoleLabel = (member: any, user: any) => {
    if (member.role === 'admin') return 'admin';
    if (member.id === user?.id) return 'current user';
    return 'member';
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}/>
      <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-(--bg-card) theme-bg-card shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-(--border-primary)">
          <h3 className="font-semibold text-(--text-primary)">{contact?.isGroup ? "Group Info" : "Contact Info"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors text-(--text-muted) cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="w-24 h-24 bg-(--bg-tertiary) rounded-full"></div>
              <div className="h-6 bg-(--bg-tertiary) rounded w-1/2"></div>
              <div className="h-4 bg-(--bg-tertiary) rounded w-1/3"></div>
              <div className="w-full space-y-2 mt-8">
                <div className="h-12 bg-(--bg-tertiary) rounded"></div>
                <div className="h-12 bg-(--bg-tertiary) rounded"></div>
                <div className="h-12 bg-(--bg-tertiary) rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : contact ? (
            <>
              {!contact.isGroup && <ContactHeader contact={contact as ContactDetails} />}
              
              {contact.isGroup && !canEditGroup && (
                <div className="pt-3">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) overflow-hidden">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name || "Group"} className="w-24 h-24 rounded-full object-cover"/>
                      ) : (
                        <span className="font-semibold text-4xl">{contact.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {contact.isGroup && canEditGroup && (
                <div className="pt-3">
                  <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer">
                      {logoPreview ? (
                        <div className="relative">
                          <img src={logoPreview} alt={contact.name || "Group"} className="w-24 h-24 rounded-full object-cover hover:opacity-90 transition-opacity" onClick={handleLogoClick}/>
                          <div
                            className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={handleLogoClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Change group logo"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleLogoClick();
                              }
                            }}
                          >
                            <Image className="text-gray-200 w-6 h-6 mb-1" />
                            <span className="text-gray-200 text-xs font-medium text-center px-1">Change Logo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div 
                            className="w-24 h-24 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) hover:bg-(--bg-hover) transition-colors"
                            onClick={handleLogoClick}
                          >
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name || "Group"} className="w-24 h-24 rounded-full object-cover"/>
                            ) : (
                              <span className="font-semibold text-4xl">{contact.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div
                            className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={handleLogoClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Add group logo"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleLogoClick();
                              }
                            }}
                          >
                            <Image className="text-gray-200 w-6 h-6 mb-1" />
                            <span className="text-gray-200 text-xs font-medium text-center px-1">Add Logo</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleLogoChange} className="hidden"/>
                    
                    {logoFile && (
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={handleLogoCancel} disabled={isSaving} className="text-sm text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                        <button onClick={handleLogoSave} disabled={isSaving} className="text-sm text-(--text-inverse) bg-(--accent-primary) hover:bg-(--accent-hover) px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
                          {isSaving ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    )}
                    {fieldError && !editingField && (
                      <p className="text-red-500 text-xs mt-2">{fieldError}</p>
                    )}
                    {fieldSuccess && !editingField && (
                      <p className="text-green-600 text-xs mt-2">{fieldSuccess}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-6 space-y-6 border-b border-(--border-primary)">
                <div className="space-y-4">
                  {contact.email && (
                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-(--text-muted) shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-(--text-muted)">Email</p>
                        <p className="text-(--text-primary)">{contact.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-(--text-muted) shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-(--text-muted)">Name</p>
                      {editingField === 'name' ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Group name"
                            className="w-full text-(--text-primary) bg-transparent border border-gray-300 rounded-lg px-3 py-1 focus:border-[#25d366] focus:outline-none focus:ring-1 focus:ring-[#25d366] transition-all duration-200"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFieldSave('name');
                              if (e.key === 'Escape') handleFieldCancel();
                            }}
                          />
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                            <button onClick={() => handleFieldSave('name')} disabled={isSaving || !formData.name.trim()} className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between ${canEditGroup ? 'cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover)' : ''} rounded-lg -mx-2 px-2 py-1 transition-colors`} onClick={() => handleFieldEdit('name')}>
                          <p className="text-(--text-primary) font-semibold">{contact.name}</p>
                          {canEditGroup && (
                            <button onClick={(e) => { e.stopPropagation(); handleFieldEdit('name'); }} className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" aria-label="Edit name">
                              <Pencil size={16} />
                            </button>
                          )}
                        </div>
                      )}
                      {fieldError && editingField === 'name' && (
                        <p className="text-red-500 text-xs mt-1">{fieldError}</p>
                      )}
                      {fieldSuccess && editingField === 'name' && (
                        <p className="text-green-600 text-xs mt-1">{fieldSuccess}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-(--text-muted) shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-(--text-muted)">Bio</p>
                      {editingField === 'description' ? (
                        <div className="mt-1">
                          <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Group description" maxLength={2000} className="w-full bg-transparent text-[15px] text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none resize-none border border-gray-300 dark:border-[#3d4a51] rounded px-2 py-1 focus:border-[#25d366]" rows={3} autoFocus />
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                            <button onClick={() => handleFieldSave('description')} disabled={isSaving} className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between ${canEditGroup ? 'cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover)' : ''} rounded-lg -mx-2 px-2 py-1 transition-colors`} onClick={() => handleFieldEdit('description')}>
                          <p className="text-(--text-primary) text-[15px]">{contact.bio || "No description"}</p>
                          {canEditGroup && (
                            <button onClick={(e) => { e.stopPropagation(); handleFieldEdit('description'); }} className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" aria-label="Edit description">
                              <Pencil size={16} />
                            </button>
                          )}
                        </div>
                      )}
                      {fieldError && editingField === 'description' && (
                        <p className="text-red-500 text-xs mt-1">{fieldError}</p>
                      )}
                      {fieldSuccess && editingField === 'description' && (
                        <p className="text-green-600 text-xs mt-1">{fieldSuccess}</p>
                      )}
                    </div>
                  </div>

                  {contact.joinedAt && (
                    <div className="flex items-start gap-3">
                      <Calendar size={20} className="text-(--text-muted) shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-(--text-muted)">{contact.isGroup ? 'Created At' : 'Joined'}</p>
                        <p className="text-(--text-primary)">{formatDate(contact.joinedAt)}</p>
                      </div>
                    </div>
                  )}

                  {contact.isGroup && canEditGroup && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-(--text-muted)">Announcement Only</p>
                          <p className="text-xs text-(--text-muted)">Only admins can send messages</p>
                        </div>
                        <button
                          onClick={() => handleToggle('isAnnouncementOnly')}
                          disabled={isSaving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:ring-offset-2 disabled:opacity-50 ${
                            contact.isAnnouncementOnly ? 'bg-[#25d366]' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contact.isAnnouncementOnly ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-(--text-muted)">Active</p>
                          <p className="text-xs text-(--text-muted)">Group is active and visible</p>
                        </div>
                        <button
                          onClick={() => handleToggle('isActive')}
                          disabled={isSaving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:ring-offset-2 disabled:opacity-50 ${
                            contact.isActive !== false ? 'bg-[#25d366]' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contact.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {contact.groups && <ContactGroupsList groups={contact.groups} />}

              {contact.isGroup && sortedMembers.length > 0 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider flex items-center gap-2">
                      <Users size={16} />
                      {sortedMembers.length} Members
                    </h3>
                    {canAddMembers && (
                      <button onClick={() => setIsAddMembersOpen(true)} className="text-(--accent-primary) text-sm font-medium hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canAddMembers} title="Add Members">
                        <UserPlus size={16} />
                        Add Members
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sortedMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-(--bg-hover) transition-colors">
                        <div className="flex items-center gap-3">
                          {
                            member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center overflow-hidden shrink-0">
                                <span className="text-(--text-muted) font-medium text-lg">{member.name.charAt(0).toUpperCase()}</span>
                              </div>
                            )
                          }
                          <div className="flex flex-col">
                            <span className="font-medium text-(--text-primary)">{member.name}</span>
                            <span className="text-xs text-(--text-muted) flex items-center gap-1">{getRoleLabel(member, user)}</span>
                          </div>
                        </div>
                        {canAddMembers && member.id !== user?.id && (
                          <div className="relative">
                            <button className="cursor-pointer p-1 hover:bg-(--bg-hover) rounded transition-colors" onClick={() => handleTogglePopover(member.id)}>
                              <ChevronDown size={14} />
                            </button>
                            {openPopoverId === member.id && (
                              <div data-popover className="absolute right-0 top-full mt-1 w-40 bg-(--bg-card) border border-(--border-primary) rounded-lg shadow-lg z-10">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-(--text-primary) hover:bg-(--bg-hover) transition-colors flex items-center gap-2"
                                  onClick={() => {
                                    handleAssignAdmin(member.id, member.name);
                                  }}
                                >
                                  <Shield size={14} />
                                  Make Admin
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                  onClick={() => {
                                    handleRemoveMember(member.id, member.name);
                                  }}
                                >
                                  <X size={14} />
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
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
        <AddMembersDrawer isOpen={isAddMembersOpen} onClose={() => setIsAddMembersOpen(false)} groupId={contact.id} onMembersAdded={() => setRefreshKey(prev => prev + 1)} />
      )}
    </div>
  );
};
