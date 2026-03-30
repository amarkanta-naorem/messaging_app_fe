/**
 * ContactItem - Displays a contact in the contact selection list.
 * Used when starting a new conversation.
 */

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
  bio: string | null;
}

interface ContactItemProps {
  contact: Contact;
  onClick: () => void;
}

export function ContactItem({ contact, onClick }: ContactItemProps) {
  return (
    <div onClick={onClick} className="flex items-center px-3 py-2.5 md:py-3 cursor-pointer hover:bg-(--bg-hover)">
      <div className="w-11 h-11 md:w-12.25 md:h-12.25 rounded-full bg-(--bg-tertiary) overflow-hidden mr-2.5 md:mr-3 shrink-0">
        {contact.avatar ? (
          <img src={contact.avatar} alt="" className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-(--bg-tertiary) font-semibold text-lg md:text-xl">{contact.name?.charAt(0)?.toUpperCase() || "?"}</div>
        )}
      </div>
      <div className="flex-1 min-w-0 border-b border-(--border-primary) pb-2.5 md:pb-3">
        <div className="flex justify-between items-baseline">
          <span className="text-(--text-primary) text-[15px] md:text-[17px] font-normal truncate">{contact.name || "Unknown"}</span>
        </div>
        <div className="text-(--text-tertiary) text-[13px] md:text-[14px] truncate">{contact.bio || "Hey there! I am using GlobiChat."}</div>
      </div>
    </div>
  );
}

export default ContactItem;
