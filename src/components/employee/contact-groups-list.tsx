import { Users } from "lucide-react";
import Image from "next/image";

interface Group {
  id: number;
  name: string;
  avatar: string | null;
}

export const ContactGroupsList = ({ groups }: { groups: Group[] }) => (
  <div className="p-6">
    <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
      <Users size={16} />
      Groups in Common
    </h3>
    {groups.length === 0 ? (
      <p className="text-[var(--text-muted)] text-sm italic">No groups in common</p>
    ) : (
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors border border-transparent hover:border-[var(--border-primary)]">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden shrink-0">
              {group.avatar ? (
                <Image
                  src={group.avatar}
                  alt={group.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users size={20} className="text-[var(--text-muted)]" />
              )}
            </div>
            <span className="font-medium text-[var(--text-primary)]">{group.name}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
