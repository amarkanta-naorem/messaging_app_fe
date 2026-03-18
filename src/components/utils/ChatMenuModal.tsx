import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import router from "next/router";

interface ChatMenuModalProps {
    showMenu: boolean;
    setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCreateGroup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChatMenuModal ({ showMenu, setShowMenu, setShowNewMessage, setShowCreateGroup}: ChatMenuModalProps) {
    const { logout } = useAuth()
    return (
        <div className="absolute right-0 top-12 bg-(--bg-card) shadow-[0_4px_20px_rgba(0,0,0,0.1) py-2 w-56 z-50 rounded-xl border border-(--border-primary) origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => {
            setShowMenu(false);
            setShowNewMessage(false);
            setShowCreateGroup(true);
          }}>
            <Users size={20} className="text-(--text-muted)" />
            New group
          </div>
          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => router.push("/dashboard")}>
            <LayoutDashboard size={20} className="text-(--text-muted)" />
            Dashboard
          </div>
          <div className="my-1 border-t border-(--border-primary)"></div>
          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--color-error) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={logout}>
            <LogOut size={20} />
            Log out
          </div>
        </div>
    );
}