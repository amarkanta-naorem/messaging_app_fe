"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Pencil, Image, Check, X, Loader2 } from "lucide-react";
import { updateGroup as updateGroupService } from "@/services";

interface GroupEditViewProps {
  group: {
    id: number;
    name: string;
    description: string | null;
    logo: string | null;
    isAnnouncementOnly?: boolean;
    isActive?: boolean;
  };
  userRole: string | null;
  onUpdate: (updatedGroup: any) => void;
  onClose: () => void;
}

// Allowed image types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function GroupEditView({ group: initialGroup, userRole, onUpdate, onClose }: GroupEditViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: initialGroup.name || "",
    description: initialGroup.description || "",
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(initialGroup.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Check if user has permission to edit (admin or owner)
  const canEdit = userRole === "admin" || userRole === "owner";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate file type
  const validateFileType = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload a ${ALLOWED_IMAGE_TYPES.map(t => t.split("/")[1].toUpperCase()).join(", ")} image.`;
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

  const handleLogoClick = () => {
    if (!canEdit) return;
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    
    // Directly set the logo file and preview
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (logoFile) {
        const response = await updateGroupService(initialGroup.id, {
          logo: logoFile,
          name: formData.name,
          description: formData.description,
        });
        if (response) {
          onUpdate(response);
        }
        setSuccess("Group logo updated successfully!");
        setLogoFile(null);
      } else {
        const payload: any = {};
        
        if (formData.name !== initialGroup.name) {
          payload.name = formData.name;
        }
        if (formData.description !== (initialGroup.description || "")) {
          payload.description = formData.description;
        }

        if (Object.keys(payload).length > 0) {
          const response = await updateGroupService(initialGroup.id, payload);
          if (response) {
            onUpdate(response);
          }
          setSuccess("Group updated successfully!");
        }
      }
      
      setEditingField(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update group";
      
      if (errorMessage.includes("Failed to fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else if (errorMessage.includes("413")) {
        setError("File is too large. Please choose a smaller image.");
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError("Session expired. Please log in again.");
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        setError("You don't have permission to update this group.");
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
      name: initialGroup.name || "",
      description: initialGroup.description || "",
    });
    setLogoPreview(initialGroup.logo);
    setLogoFile(null);
    setEditingField(null);
    setError(null);
    setSuccess(null);
  };

  const handleFieldEdit = (fieldName: string) => {
    if (!canEdit) return;
    setEditingField(fieldName);
    setFieldError(null);
    setFieldSuccess(null);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldError(null);
    setFieldSuccess(null);
  };

  const handleFieldSave = async (fieldName: 'name' | 'description') => {
    if (!canEdit) return;
    
    setIsSaving(true);
    setFieldError(null);
    setFieldSuccess(null);

    try {
      const payload: Record<string, string> = {};
      
      if (fieldName === 'name' && formData.name !== initialGroup.name) {
        payload.name = formData.name;
      } else if (fieldName === 'description' && formData.description !== (initialGroup.description || "")) {
        payload.description = formData.description;
      }

      if (Object.keys(payload).length > 0) {
        const response = await updateGroupService(initialGroup.id, payload);
        if (response) {
          onUpdate(response);
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
          <h3 className="font-semibold text-xl text-(--text-secondary)">Edit Group</h3>
        </div>
      </div>
      
      {/* Group Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {!canEdit && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Only admins and owners can edit group information
          </div>
        )}
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

        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <div className={`relative group ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}>
            {logoPreview ? (
              <div className="relative">
                <img 
                  src={logoPreview} 
                  alt={initialGroup.name || "Group"} 
                  className={`w-24 h-24 rounded-full object-cover ${canEdit ? 'hover:opacity-90' : ''} transition-opacity`}
                  onClick={handleLogoClick}
                />
                {canEdit && (
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
                )}
              </div>
            ) : (
              <div className="relative">
                <div 
                  className={`w-24 h-24 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--text-secondary) ${canEdit ? 'hover:bg-(--bg-hover)' : ''} transition-colors`}
                  onClick={handleLogoClick}
                >
                  <span className="font-semibold text-4xl">{initialGroup.name?.charAt(0).toUpperCase()}</span>
                </div>
                {canEdit && (
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
                )}
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleLogoChange} className="hidden"/>
          
          {/* Save/Cancel buttons when logo is changed */}
          {logoFile && canEdit && (
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
                  placeholder="Group name"
                  className="w-full text-(--text-primary) bg-transparent border border-gray-300 rounded-lg px-3 py-1 focus:border-[#25d366] focus:outline-none focus:ring-1 focus:ring-[#25d366] transition-all duration-200"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFieldSave('name');
                    if (e.key === 'Escape') handleFieldCancel();
                  }}
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={() => handleFieldSave('name')} disabled={isSaving || !formData.name.trim()} className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <div 
                className={`flex items-center justify-between ${canEdit ? 'cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover)' : ''} rounded-lg -mx-2 px-2 py-1 transition-colors`}
                onClick={() => handleFieldEdit('name')}
              >
                <h2 className="font-semibold text-(--text-primary)">{initialGroup.name}</h2>
                {canEdit && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleFieldEdit('name'); }} 
                    className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" 
                    aria-label="Edit name"
                  >
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

          {/* Description Field */}
          <div className="rounded-lg w-full group">
            <span className="text-(--text-muted) text-[12px] font-medium uppercase">Description</span>
            {editingField === 'description' ? (
              <div className="mt-1">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Group description"
                  maxLength={2000}
                  className="w-full bg-transparent text-[15px] text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none resize-none border border-gray-300 dark:border-[#3d4a51] rounded px-2 py-1 focus:border-[#25d366]"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button onClick={handleFieldCancel} disabled={isSaving} className="text-xs text-(--text-muted) hover:text-red-600 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={() => handleFieldSave('description')} disabled={isSaving} className="text-xs text-[#25d366] hover:text-[#1da851] font-medium transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
                {fieldError && editingField === 'description' && (
                  <p className="text-red-500 text-xs mt-1">{fieldError}</p>
                )}
                {fieldSuccess && editingField === 'description' && (
                  <p className="text-green-600 text-xs mt-1">{fieldSuccess}</p>
                )}
              </div>
            ) : (
              <div 
                className={`flex items-center justify-between ${canEdit ? 'cursor-pointer hover:bg-(--bg-hover) dark:hover:bg-(--bg-hover)' : ''} rounded-lg -mx-2 px-2 py-1 transition-colors`}
                onClick={() => handleFieldEdit('description')}
              >
                <p className="text-(--text-primary) text-[15px]">{initialGroup.description || "No description"}</p>
                {canEdit && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleFieldEdit('description'); }} 
                    className="p-2 text-(--text-muted) hover:text-[#25d366] hover:bg-[#25d366]/10 dark:hover:bg-[#25d366]/20 rounded-lg transition-all duration-200 cursor-pointer" 
                    aria-label="Edit description"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
