import type { Employee } from "@/types";
import { getOrganizationEmployees } from "@/services";
import { Button, Switch, Avatar } from "@/components/ui";
import { useState, useRef, useCallback, ChangeEvent, DragEvent, useEffect } from "react";
import { ArrowLeft, Camera, Check, X, Users, Bell, Activity, Search } from "lucide-react";

interface CreateGroupFormProps {
  onCancel: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
}

interface Member {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 256;

export function CreateGroupForm({ onCancel, onSubmit }: CreateGroupFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [announcementOnly, setAnnouncementOnly] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const selectAllRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoadingMembers(true);
      try {
        const employees = await getOrganizationEmployees();
        const members: Member[] = employees.map((emp: Employee) => ({
          id: String(emp.id),
          name: emp.name,
          avatar: emp.avatar || undefined,
          email: emp.email || undefined,
        }));
        setAvailableMembers(members);
      } catch (error) {
        console.error("Failed to fetch organization contacts:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectAllRef.current) {
      const allSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedMemberIds.includes(m.id));
      const someSelected = filteredMembers.some((m) => selectedMemberIds.includes(m.id));
      selectAllRef.current.checked = allSelected;
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [selectedMemberIds, memberSearchQuery, availableMembers]);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit(name, description);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedMembers = availableMembers.filter((m) => selectedMemberIds.includes(m.id));
  const filteredMembers = availableMembers.filter((member) => {
    const query = memberSearchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) => prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]);
  };

  const handleSelectAll = () => {
    const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedMemberIds.includes(m.id));
    if (allFilteredSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !filteredMembers.some((m) => m.id === id)));
    } else {
      const filteredIds = filteredMembers.map((m) => m.id);
      setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-left duration-200">
      <div className="bg-(--header-bg) theme-header-bg px-5 py-4 flex items-center gap-4 shrink-0">
        <ArrowLeft onClick={onCancel} size={22} className="text-(--text-secondary) group-hover:text-(--accent-primary) transition-colors cursor-pointer" />
        <h1 className="text-lg font-semibold text-(--text-secondary)">New Group</h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-5">
          <div className="flex flex-col items-center justify-center space-y-2">
            {logoPreview ? (
              <div className="relative inline-block group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-(--border-primary) shadow-md">
                  <img src={logoPreview} alt="Group logo preview" className="w-full h-full object-cover"/>
                </div>
                <button onClick={removeLogo} className="absolute -top-1 -right-1 w-7 h-7 bg-(--color-error) text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100" aria-label="Remove logo">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center
                  cursor-pointer transition-all duration-200 group
                  ${isDragging ? "border-(--accent-primary) bg-(--accent-muted) scale-105" : "border-(--border-secondary) hover:border-(--accent-primary) hover:bg-(--accent-muted)/30"}
                `}
                role="button"
                tabIndex={0}
                aria-label="Upload group icon"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Camera size={28} className="text-(--text-muted) group-hover:text-(--accent-primary) transition-colors mb-1" />
                <span className="text-[9px] text-(--text-muted) group-hover:text-(--accent-primary) transition-colors line-clamp-2">Upload Group DP</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" aria-hidden="true"/>
            <p className="text-xs text-(--text-muted)">{logoPreview ? "Click on the image to change, or drag a new image." : "Drag and drop an image, or click to browse."}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-(--text-primary)">Name</label>
              <span className={`text-xs ${name.length > MAX_NAME_LENGTH * 0.8 ? "text-(--color-warning)" : "text-(--text-muted)"}`}>{MAX_NAME_LENGTH - name.length} characters remaining</span>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={MAX_NAME_LENGTH}
              required
              className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-(--text-primary) text-sm placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) transition-all resize-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-(--text-primary)">Description <span className="text-(--text-muted) font-normal">(optional)</span></label>
              <span className={`text-xs ${description.length > MAX_DESCRIPTION_LENGTH * 0.8 ? "text-(--color-warning)" : "text-(--text-muted)"}`}>{MAX_DESCRIPTION_LENGTH - description.length} characters remaining</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-(--border-primary) text-(--text-primary) text-sm placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 border border-(--border-primary) rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-(--bg-tertiary) flex items-center justify-center">
                  <Bell size={16} className="text-(--text-secondary)" />
                </div>
                <div>
                  <p className="text-sm font-medium text-(--text-primary)">Announcement Only</p>
                  <p className="text-xs text-(--text-muted)">Only admins can send messages</p>
                </div>
              </div>
              <Switch id="announcement-only" checked={announcementOnly} onCheckedChange={setAnnouncementOnly} aria-label="Toggle announcement only mode"/>
            </div>

            <div className="flex items-center justify-between p-2 border border-(--border-primary) rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-(--bg-tertiary) flex items-center justify-center">
                  <Activity size={16} className="text-(--text-secondary)" />
                </div>
                <div>
                  <p className="text-sm font-medium text-(--text-primary)">Active</p>
                  <p className="text-xs text-(--text-muted)">Make group visible to members</p>
                </div>
              </div>
              <Switch id="group-active" checked={isActive} onCheckedChange={setIsActive} aria-label="Toggle group active status"/>
            </div>
          </div>

          <div className="border-t border-(--border-primary)"></div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-(--bg-tertiary) flex items-center justify-center">
                  <Users size={16} className="text-(--text-secondary)" />
                </div>
                <div>
                  <label className="text-sm font-medium text-(--text-primary)">Add Members</label>
                  <p className="text-xs text-(--text-muted)">{selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected</p>
                </div>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                <input type="text" value={memberSearchQuery} onChange={(e) => setMemberSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-(--border-primary) text-(--text-primary) text-sm placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/20 focus:border-(--accent-primary) transition-all bg-(--bg-input)" />
              </div>
            </div>

            <div className="border border-(--border-primary) rounded-lg overflow-hidden">
              <label className="flex items-center gap-3 px-3 py-2.5 bg-(--bg-card) border-b border-(--border-primary) cursor-pointer hover:bg-(--bg-hover) transition-colors">
                <input ref={selectAllRef} type="checkbox" onChange={handleSelectAll} className="w-4 h-4 rounded border-(--border-primary) text-(--accent-primary) focus:ring-(--accent-primary) cursor-pointer"/>
                <span className="text-sm font-medium text-(--text-primary)">Select All</span>
              </label>

              {isLoadingMembers ? (
                <div className="px-3 py-4 text-center text-sm text-(--text-muted)">Loading members...</div>
              ) : filteredMembers.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredMembers.map((member) => (
                    <li key={member.id}>
                      <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-(--bg-hover) transition-colors">
                        <input type="checkbox" checked={selectedMemberIds.includes(member.id)} onChange={() => handleToggleMember(member.id)} className="w-4 h-4 rounded border-(--border-primary) text-(--accent-primary) focus:ring-(--accent-primary) cursor-pointer shrink-0" />
                        <Avatar src={member.avatar} name={member.name} size="sm" className="shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-(--text-primary) truncate">{member.name}</p>
                          {member.email && <p className="text-xs text-(--text-muted) truncate">{member.email}</p>}
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-(--text-muted)">No members found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-(--border-primary) bg-(--bg-card) shrink-0">
        <Button onClick={handleCreate} disabled={!name.trim() || loading} loading={loading} size="lg" fullWidth className="shadow-lg">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check size={18} strokeWidth={2.5} />
              Create Group
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default CreateGroupForm;
