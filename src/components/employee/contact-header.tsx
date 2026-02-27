import Image from "next/image";
import { User } from "lucide-react";

interface ContactDetails {
  name: string;
  phone: string;
  avatar: string | null;
}

export const ContactHeader = ({ contact }: { contact: ContactDetails }) => (
  <div className="flex flex-col items-center p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
    <div className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden mb-4 shadow-md">
      {contact.avatar ? (
        <Image
          src={contact.avatar}
          alt={contact.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      ) : (
        <User size={40} className="text-[var(--text-muted)]" />
      )}
    </div>
    <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">{contact.name}</h2>
    <p className="text-[var(--text-muted)] font-medium mt-1">{contact.phone}</p>
  </div>
);
