/**
 * CreateGroupForm - Form component for creating a new group.
 * Handles input state and submission logic.
 */

import { useState } from "react";
import { ArrowLeft, Camera, Check } from "lucide-react";

interface CreateGroupFormProps {
  /** Callback to cancel group creation */
  onCancel: () => void;
  /** Callback when group is successfully created */
  onSubmit: (name: string, description: string) => Promise<void>;
}

export function CreateGroupForm({ onCancel, onSubmit }: CreateGroupFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(name, description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)] animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="bg-[var(--accent-secondary)] h-15 flex items-end px-6 pb-4 text-[var(--text-inverse)] shrink-0">
        <div className="flex items-center gap-8">
          <button 
            onClick={onCancel} 
            className="hover:bg-[var(--bg-hover)]/30 rounded-full p-1 transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-[19px] font-medium">New group</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center pt-10 px-4">
          {/* Avatar Placeholder */}
          <div className="relative mb-10 group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
              <Camera size={32} className="text-[var(--text-muted)]" />
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs uppercase font-medium">
              <Camera size={24} className="mb-1" />
              <span>Add Icon</span>
            </div>
          </div>

          {/* Name Input */}
          <div className="w-full max-w-[85%] mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group subject"
              className="w-full bg-transparent border-b-2 border-[var(--accent-secondary)] py-1 px-2 text-[var(--text-primary)] text-[17px] placeholder:text-[var(--text-muted)] focus:outline-none"
              maxLength={25}
            />
            <div className="flex justify-end mt-2">
              <span className="text-[var(--text-muted)] text-xs">{25 - name.length}</span>
            </div>
          </div>
          
          {/* Description Input */}
          <div className="w-full max-w-[85%] mb-10">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group description (optional)"
              className="w-full bg-transparent border-b border-[var(--border-primary)] py-1 px-2 text-[var(--text-primary)] text-[15px] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)] transition-colors"
            />
          </div>
          
          <div className="flex justify-center animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="w-12 h-12 bg-[var(--accent-secondary)] rounded-full flex items-center justify-center text-[var(--text-inverse)] shadow-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={24} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupForm;
