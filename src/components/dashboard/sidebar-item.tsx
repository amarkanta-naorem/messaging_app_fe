import { ReactNode, useContext } from "react";
import Link from "next/link";
import { SidebarContext } from "./sidebar";

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  href?: string;
}

export default function SidebarItem({ icon, text, active, alert, href = "#" }: SidebarItemProps) {
  const { expanded } = useContext(SidebarContext);
  return (
    <Link href={href}>
      <li className={`relative flex items-center py-2.5 px-3 my-2 font-medium rounded-xl cursor-pointer transition-all duration-200 group ${active ? "bg-[var(--bg-hover)] text-[var(--accent-primary)] shadow-sm" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"} ${expanded ? "" : "justify-center"}`}>
        <div className={`transition-colors duration-200 ${active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]"}`}>
          {icon}
        </div>
        <span className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${expanded ? "w-28 ml-3 opacity-100" : "w-0 opacity-0"}`}>{text}</span>
        
        {alert && (
          <div className={`absolute right-2 w-2 h-2 rounded-full bg-[var(--accent-primary)] ${!expanded && "top-2"}`} />
        )}
      </li>
    </Link>
  );
}