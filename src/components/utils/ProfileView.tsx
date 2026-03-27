"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useRef, ChangeEvent } from "react";
import { Pencil, Image, Check, X, Loader2, Copy } from "lucide-react";
import { updateProfile as updateProfileService, getAuthToken } from "@/services";

interface ProfileViewProps {
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    bio: string | null;
    organisation_employees?: {
      status: string;
      joined_at: string;
      role: string;
      organisation: {
        id: number;
        name: string;
        logo: string | null;
        bio: string | null;
      };
    };
  };
  onClose: () => void;
}

// Allowed image types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Custom function to handle FormData for avatar upload
async function updateProfileWithAvatar(formData: FormData) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const response = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Failed to update profile picture");
  }
  
  return response.json();
}

// Helper to preserve organisation_employees when updating profile
function preserveOrganisationData(updatedUser: any, currentUser: any): any {
  if (!currentUser?.organisation_employees) return updatedUser;
  return {
    ...updatedUser,
    organisation_employees: currentUser.organisation_employees,
  };
}

export default function ProfileView({ user: initialUser, onClose }: ProfileViewProps) {
  const { login, user: currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialUser.name || "",
    email: initialUser.email || "",
    bio: initialUser.bio || "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const organization = initialUser.organisation_employees?.organisation;
  const employeeInfo = initialUser.organisation_employees;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate file type
  const validateFileType = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload a ${ALLOWED_IMAGE_TYPES.map(t => t.split("/")[1].toUpperCase()).join(", ")}, or GIF image.`;
    }
    return null;
  };

  // Validate file size
  const validateFileSize = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeInMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return `File is too large (${sizeInMB}MB). Maximum size is ${maxSizeInMB}MB.`;
    }
    return null;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    // Validate file type
    const typeError = validateFileType(file);
    if (typeError) {
      setError(typeError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      setError(sizeError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    // Directly set the avatar file and preview
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (avatarFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("avatar", avatarFile);
        if (formData.name) formDataToSend.append("name", formData.name);
        if (formData.email) formDataToSend.append("email", formData.email);
        if (formData.bio) formDataToSend.append("bio", formData.bio);

        const response = await updateProfileWithAvatar(formDataToSend);
        if (response.data) {
          // Preserve existing token and organisation data, only update user data
          const userWithOrg = preserveOrganisationData(response.data, currentUser);
          await login(getAuthToken() || "", userWithOrg);
        }
        setSuccess("Profile picture updated successfully!");
        setAvatarFile(null);
      } else {
        const payload: any = {};
        
        if (formData.name !== initialUser.name) {
          payload.name = formData.name;
        }
        if (formData.email !== initialUser.email) {
          payload.email = formData.email;
        }
        if (formData.bio !== (initialUser.bio || "")) {
          payload.bio = formData.bio;
        }

        if (Object.keys(payload).length > 0) {
          const response = await updateProfileService(payload);
          if (response.user) {
            // Preserve existing token and organisation data, only update user data
            const userWithOrg = preserveOrganisationData(response.user, currentUser);
            await login(getAuthToken() || "", userWithOrg);
          }
          setSuccess("Profile updated successfully!");
        }
      }
      
      setEditingField(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      
      if (errorMessage.includes("Failed to fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else if (errorMessage.includes("413")) {
        setError("File is too large. Please choose a smaller image.");
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError("Session expired. Please log in again.");
      } else if (errorMessage.includes("500") || errorMessage.includes("Server error")) {
        setError("Server error. Please try again later.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initialUser.name || "",
      email: initialUser.email || "",
      bio: initialUser.bio || "",
    });
    setAvatarPreview(initialUser.avatar);
    setAvatarFile(null);
    setEditingField(null);
    setError(null);
    setSuccess(null);
  };

  const handleFieldEdit = (fieldName: string) => {
    setEditingField(fieldName);
    setFieldError(null);
    setFieldSuccess(null);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldError(null);
    setFieldSuccess(null);
  };

  const handleCopyPhone = async () => {
    if (!initialUser.phone) return;
    
    try {
      await navigator.clipboard.writeText(initialUser.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

  const handleFieldSave = async (fieldName: 'name' | 'email' | 'bio') => {
    setIsSaving(true);
    setFieldError(null);
    setFieldSuccess(null);

    try {
      const payload: Record<string, string> = {};
      
      if (fieldName === 'name' && formData.name !== initialUser.name) {
        payload.name = formData.name;
      } else if (fieldName === 'email' && formData.email !== initialUser.email) {
        payload.email = formData.email;
      } else if (fieldName === 'bio' && formData.bio !== (initialUser.bio || "")) {
        payload.bio = formData.bio;
      }

      if (Object.keys(payload).length > 0) {
        const response = await updateProfileService(payload);
        if (response.user) {
          // Preserve existing token and organisation data, only update user data
          const userWithOrg = preserveOrganisationData(response.user, currentUser);
          await login(getAuthToken() || "", userWithOrg);
        }
        setFieldSuccess("Updated successfully!");
        setTimeout(() => setFieldSuccess(null), 2000);
      }
      
      setEditingField(null);
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-(--bg-card)">
      {/* Header */}
      <div className="px-4 h-14 flex items-center justify-between shrink-0 border-b border-gray-400">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h3 className="font-semibold text-xl text-(--text-secondary)">Profile</h3>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            {avatarPreview ? (
              <div className="relative">
                <img 
                  src={avatarPreview} 
                  alt={initialUser.name || "Profile"} 
                  className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={handleAvatarClick}
                />
                <div
                  className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Change profile picture"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleAvatarClick();
                    }
                  }}
                >
                  <Image className="text-(--text-inverse) w-6 h-6 mb-1" />
                  <span className="text-(--text-inverse) text-xs font-medium text-center px-1">Change Photo</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) cursor-pointer hover:bg-(--bg-hover) transition-colors" onClick={handleAvatarClick}>
                  <span className="font-semibold text-4xl">{initialUser.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div
                  className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Add profile picture"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleAvatarClick();
                    }
                  }}
                >
                  <Image className="text-(--text-inverse) w-6 h-6 mb-1" />
                  <span className="text-(--text-inverse) text-xs font-medium text-center px-1">Add Photo</span>
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleAvatarChange} className="hidden"/>
          
          {/* Save/Cancel buttons when avatar is changed */}
          {avatarFile && (
            <div className="flex items-center gap-2 mt-3">
              <button 
                onClick={handleCancel}
                disabled={isSaving}
                className="text-sm text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm text-(--text-inverse) bg-(--accent-primary) hover:bg-(--accent-hover) px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
              >
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
        </div>

        <div className="space-y-3 p-4">
          {/* Name Field */}
          <div className="rounded-lg w-full group">
            <span className="text-(--text-muted) text-[12px] font-medium uppercase">Name</span>
            {editingField === 'name' ? (
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full text-(--text-primary) bg-transparent border border-gray-300 rounded-lg px-3 py-1 focus:border-[#25d366] focus:outline-none focus:ring-1 focus:ring-[#25d366] transition-all duration-200"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFieldSave('name');
                    if (e.key === 'Escape') handleFieldCancel();
                  }}
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={() => handleFieldSave('name')} disabled={isSaving || !formData.name.trim()}className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover) rounded-lg -mx-2 px-2 py-1 transition-colors"
                onClick={() => handleFieldEdit('name')}
              >
                <h2 className="font-semibold text-(--text-primary)">{initialUser.name}</h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleFieldEdit('name'); }} 
                  className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" 
                  aria-label="Edit name"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
            {fieldError && editingField === 'name' && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
            {fieldSuccess && editingField === 'name' && (
              <p className="text-green-600 text-xs mt-1">{fieldSuccess}</p>
            )}
          </div>

          {/* About Field */}
          <div className="rounded-lg w-full group">
            <span className="text-(--text-muted) text-[12px] font-medium uppercase">About</span>
            {editingField === 'bio' ? (
              <div className="mt-1">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  maxLength={100}
                  className="w-full bg-transparent text-[15px] text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none resize-none border border-gray-300 dark:border-[#3d4a51] rounded px-2 py-1 focus:border-[#25d366]"
                  rows={2}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={() => handleFieldSave('bio')} disabled={isSaving} className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
                {fieldError && editingField === 'bio' && (
                  <p className="text-red-500 text-xs mt-1">{fieldError}</p>
                )}
                {fieldSuccess && editingField === 'bio' && (
                  <p className="text-green-600 text-xs mt-1">{fieldSuccess}</p>
                )}
              </div>
            ) : (
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover) rounded-lg -mx-2 px-2 py-1 transition-colors"
                onClick={() => handleFieldEdit('bio')}
              >
                <p className="text-(--text-primary) text-[15px]">{initialUser.bio || "Hey there! I'm using GlobiChat"}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleFieldEdit('bio'); }} 
                  className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" 
                  aria-label="Edit about"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className="rounded-lg p-1 group">
            <span className="text-(--text-muted) text-[12px] font-medium uppercase">Phone</span>
            <div className="flex items-center justify-between mt-1">
              <p className="text-(--text-primary) text-[15px]">{initialUser.phone || "Not provided"}</p>
              {initialUser.phone && (
                <button
                  onClick={handleCopyPhone}
                  className="p-2 text-(--text-muted) hover:text-(--accent-primary) hover:bg-(--accent-muted) rounded-lg transition-all duration-200 cursor-pointer"
                  aria-label={copied ? "Phone number copied" : "Copy phone number"}
                  title={copied ? "Copied!" : "Copy phone number"}
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="rounded-lg w-full group">
            <span className="text-(--text-muted) text-[12px] font-medium uppercase">Email</span>
            {editingField === 'email' ? (
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full bg-transparent text-[15px] text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none border border-gray-300 dark:border-[#3d4a51] rounded px-2 py-1 focus:border-[#25d366]"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={() => handleFieldSave('email')} disabled={isSaving} className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
                {fieldError && editingField === 'email' && (
                  <p className="text-red-500 text-xs mt-1">{fieldError}</p>
                )}
                {fieldSuccess && editingField === 'email' && (
                  <p className="text-green-600 text-xs mt-1">{fieldSuccess}</p>
                )}
              </div>
            ) : (
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover) rounded-lg -mx-2 px-2 py-1 transition-colors"
                onClick={() => handleFieldEdit('email')}
              >
                <p className="text-(--text-primary) text-[15px]">{initialUser.email || "Not provided"}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleFieldEdit('email'); }} 
                  className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" 
                  aria-label="Edit email"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Organization */}
          {organization && organization.name && (
            <div className="p-1">
              <div className="flex items-center justify-between">
                <p className="text-(--text-muted) text-[12px] font-medium uppercase">Organization</p>

                <div className="text-[12px]">
                  {employeeInfo?.joined_at && (
                    <span className="text-(--text-muted)">
                      <span className="font-medium text-(--text-secondary)">Joined:</span> {new Date(employeeInfo.joined_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                {organization.logo ? (
                  <img src={organization.logo} alt={organization.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary)">
                    <span className="font-semibold">{organization.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="text-(--text-primary) text-[15px] font-medium">{organization.name}</p>
                  <p className="text-(--text-muted) text-[12px]">{employeeInfo?.role || 'Member'}</p>
                </div>
              </div>
              {organization.bio && (
                <p className="text-(--text-muted) text-[13px] mt-2">{organization.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
