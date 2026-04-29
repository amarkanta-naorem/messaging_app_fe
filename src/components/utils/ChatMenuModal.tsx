import Link from "next/link";
import router from "next/router";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, Users } from "lucide-react";

interface ChatMenuModalProps {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateGroup: React.Dispatch<React.SetStateAction<boolean>>;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChatMenuModal ({ setShowMenu, setShowNewMessage, setShowCreateGroup, setShowProfile}: ChatMenuModalProps) {
    const { user, logout } = useAuth()
    return (
        <div className="absolute right-0 top-10.5 bg-(--bg-card) shadow-[0_4px_20px_rgba(0,0,0,0.1) w-56 z-50 rounded-xl border border-(--border-primary) origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 rounded-t-lg hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => {
            setShowMenu(false);
            setShowProfile(true);
          }}>
            {user?.avatar ? (
              <img src={user?.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#dfe3e5] dark:bg-[#3d4a51] flex items-center justify-center text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex flex-col items-start">
              <p>{user?.name}</p>
              <p className="text-xs text-gray-400">View Profile</p>
            </div>
          </div>
          <div className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => {
            setShowMenu(false);
            setShowNewMessage(false);
            setShowCreateGroup(true);
          }}>
            <Users size={20} className="text-(--text-muted)" />
            New group
          </div>
          <Link href="/system/dashboard" className="px-4 py-3 hover:bg-(--bg-hover) cursor-pointer text-(--text-primary) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={() => router.push("/system/dashboard")}>
            <LayoutDashboard size={20} className="text-(--text-muted)" />
            Dashboard
          </Link>
          <div className="border-t border-(--border-primary)"></div>
          <div className="px-4 py-3 rounded-b-lg hover:bg-(--bg-hover) cursor-pointer text-(--color-error) text-[15px] flex items-center gap-3 transition-colors font-medium" onClick={logout}>
            <LogOut size={20} />
            Log out
          </div>
        </div>
    );
}