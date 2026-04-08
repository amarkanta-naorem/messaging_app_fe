"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, MapPinHouse, Mail, ImageIcon, Save, Upload, X, FileImage, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { FloatingLabelInput, FloatingEmailInput, FormSection } from "@/features/branches/components";
import { getActiveOrganisation, type ActiveOrganisationResponse, type OrganisationUpdatePayload } from "@/services/organisation.service";
import { Button } from "@/components/ui/button";

interface OrganisationFormProps {
  initialData?: ActiveOrganisationResponse | null;
  onSubmit: (payload: OrganisationUpdatePayload) => Promise<void>;
  loading?: boolean;
}

export function OrganisationForm({ initialData, onSubmit, loading = false }: OrganisationFormProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      setError(null);
      const data = await getActiveOrganisation();
      if (data.organisation) {
        setName(data.organisation.name || "");
        setDisplayName(data.organisation.displayName || "");
        setAddress(data.organisation.address || "");
        setContactEmail(data.organisation.contactEmail || "");
        if (data.organisation.logo) {
          setLogoPreview(data.organisation.logo);
          setOriginalLogoUrl(data.organisation.logo);
        }
        if (data.organisation.metadata) {
          setMetadata(JSON.stringify(data.organisation.metadata, null, 2));
        }
      }
    } catch (err) {
      console.error("Failed to fetch organisation:", err);
      setError("Failed to load organisation data");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 100) newErrors.name = "Name must be 100 characters or less";
    if (displayName && displayName.length > 255) newErrors.displayName = "Display name must be 255 characters or less";
    if (address && address.length > 500) newErrors.address = "Address must be 500 characters or less";
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) newErrors.contactEmail = "Invalid email format";
    if (metadata) {
      try {
        JSON.parse(metadata);
      } catch {
        newErrors.metadata = "Invalid JSON format";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const payload: OrganisationUpdatePayload = {
      name: name.trim(),
    };
    if (displayName.trim()) payload.displayName = displayName.trim();
    if (address.trim()) payload.address = address.trim();
    if (contactEmail.trim()) payload.contactEmail = contactEmail.trim();
    if (metadata.trim()) {
      try {
        payload.metadata = JSON.parse(metadata);
      } catch {}
    }
    if (logoFile) {
      payload.logo = logoFile;
    }
    
    await onSubmit(payload);
  };

  const handleLogoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    
    if (e instanceof File) {
      file = e;
    } else {
      file = e.target.files?.[0];
    }
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, logo: "File size must be less than 2MB" }));
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, logo: "Only JPEG, PNG, GIF, and WebP are allowed" }));
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      setLogoFile(file);
      setLogoPreview(previewUrl);
      setErrors((prev) => {
        const { logo: _, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleLogoChange(file);
    }
  }, [handleLogoChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeLogo = async () => {
    setLogoFile(null);
    setLogoPreview(originalLogoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasNewLogo = logoFile !== null;

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--accent-primary)"></div>
      </div>
    );
  }

  if (error && !loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <p className="text-red-500">{error}</p>
        <Button variant="customBg" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Organisation Settings</h1>
          <p className="text-(--text-secondary)">Manage your organisation information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col bg-(--bg-card) min-h-[83vh] rounded-xl border border-(--border-primary) shadow-sm overflow-hidden p-5">
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-7">
          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                id="organisation-name"
                label="Organisation Name"
                value={name}
                onChange={setName}
                required
                error={errors.name}
                icon={<Building2 className="h-4 w-4" />}
              />
              <FloatingLabelInput
                id="organisation-displayName"
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                error={errors.displayName}
                icon={<Building2 className="h-4 w-4" />}
              />
            </div>
          </FormSection>

          <FormSection>
            <FloatingLabelInput
              id="organisation-address"
              label="Address"
              value={address}
              onChange={setAddress}
              error={errors.address}
              icon={<MapPinHouse className="h-4 w-4" />}
            />
          </FormSection>

          <FormSection>
            <FloatingEmailInput
              id="organisation-contactEmail"
              label="Contact Email"
              value={contactEmail}
              onChange={setContactEmail}
              error={errors.contactEmail}
              icon={<Mail className="h-4 w-4" />}
            />
          </FormSection>

          <FormSection>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">
              Logo <span className="text-(--text-muted) font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div 
                className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${errors.logo ? 'border-red-400 bg-red-50/50' : 'border-(--border-primary) hover:border-(--accent-primary) hover:bg-(--bg-hover)'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                
                {loading ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 text-(--accent-primary) animate-spin" />
                    <p className="text-sm text-(--text-muted)">Saving changes...</p>
                  </div>
                ) : logoPreview && !hasNewLogo ? (
                  <div className="relative p-6 flex items-center gap-6">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg ring-4 ring-(--bg-card) bg-(--bg-input)">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium text-(--text-primary)">Current logo</span>
                      </div>
                      <p className="text-sm text-(--text-muted)">Click the area to replace the current logo</p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          variant="danger" 
                          size="sm" 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            removeLogo();
                          }}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : hasNewLogo ? (
                  <div className="relative p-6 flex items-center gap-6">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg ring-4 ring-(--bg-card) bg-(--bg-input)">
                      <img 
                        src={logoPreview || ""} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-(--accent-primary)">
                        <Upload className="h-5 w-5" />
                        <span className="font-medium text-(--text-primary)">New logo selected</span>
                      </div>
                      <p className="text-sm text-(--text-muted)">{logoFile?.name} - Click to replace</p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          variant="danger" 
                          size="sm" 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            removeLogo();
                          }}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer p-4 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-(--bg-hover) flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload className="h-10 w-10 text-(--accent-primary)" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-(--accent-primary) flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FileImage className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <p className="font-medium text-(--text-primary)">
                        <span className="text-(--accent-primary)">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-(--text-muted)">PNG or JPG (max 2MB)</p>
                    </div>
                  </label>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
              </div>
              
              {errors.logo && (
                <div className="flex items-center gap-2 mt-2 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.logo}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2 text-(--text-muted)">
                <ImageIcon className="h-4 w-4" />
                <p className="text-xs">Recommended: Square image, at least 256x256px</p>
              </div>
            </div>
          </FormSection>
        </div>

        <div className="shrink-0 pt-4">
          <div className="flex items-center justify-end gap-3">
            <Button variant="customBg" size="md" type="submit" loading={loading} className="px-6 py-2.5 rounded-xl font-medium">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default OrganisationForm;