import Image from "next/image";
import { User } from "lucide-react";

interface ContactDetails {
  name: string;
  phone: string;
  avatar: string | null;
}

export const ContactHeader = ({ contact }: { contact: ContactDetails }) => (
  <div className="flex flex-col items-center p-6 bg-slate-50 border-b border-slate-200">
    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mb-4 shadow-md">
      {contact.avatar ? (
        <Image
          src={contact.avatar}
          alt={contact.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      ) : (
        <User size={40} className="text-slate-400" />
      )}
    </div>
    <h2 className="text-xl font-bold text-slate-800 text-center">{contact.name}</h2>
    <p className="text-slate-500 font-medium mt-1">{contact.phone}</p>
  </div>
);