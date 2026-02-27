"use client";

import Image from "next/image";
import SidebarItem from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createContext, useState } from "react";
import { ChevronFirst, ChevronLast, LayoutDashboard, LogOut, ShieldUser, Settings, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export const SidebarContext = createContext({ expanded: true });

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { isDark, toggle } = useTheme();

  if (!user) return null;

  return (
    <>
      <aside className={`sticky top-0 flex flex-col bg-(--bg-card) border-r border-(--border-primary) rounded-3xl shadow-sm transition-all duration-300 ease-in-out ${expanded ? 'w-48' : 'w-20'}`}>
        <div className={`p-4 pb-2 flex items-center h-16 ${expanded ? "justify-between" : "justify-center"}`}>
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${expanded ? "w-full opacity-100" : "w-0 opacity-0 hidden"}`}>
            <h1 className="font-bold text-xl text-(--text-primary) whitespace-nowrap truncate tracking-tight">
              {user.organisation_employees?.organisation?.name ?? "Org. Name"}
            </h1>
          </div>
          <button onClick={() => setExpanded(curr => !curr)} className="p-2 rounded-lg bg-(--bg-hover) hover:bg-(--bg-active) text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 py-4 space-y-4">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
            <SidebarItem icon={<ShieldUser size={20} />} text="Employees" href="/employees" active={pathname === '/employees'} />
          </ul>
        </SidebarContext.Provider>

        <div className="border-t border-(--border-primary) p-3">
          <div className={`flex flex-col gap-1 ${expanded ? "" : "items-center"}`}>
            <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-(--bg-hover) transition-all cursor-pointer group ${expanded ? "" : "justify-center"}`}>
              <div className="relative group cursor-pointer shrink-0">
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-(--bg-card)">
                  {user.avatar ? (
                    <Image src={user.avatar} width={36} height={36} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-(--status-online) border-2 border-(--bg-card) rounded-full"></div>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${expanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden"}`}>
                <h4 className="font-semibold text-(--text-primary) text-sm truncate">{user.name || "User"}</h4>
                <p className="text-xs text-(--text-muted) truncate">View Profile</p>
              </div>
            </div>

            <button 
              onClick={() => setSettingsOpen(true)} 
              className={`flex items-center gap-3 p-2 rounded-xl text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary) cursor-pointer transition-all group ${expanded ? "" : "justify-center"}`}
              title="Settings"
            >
              <div className="flex items-center justify-center w-9 h-9">
                <Settings size={20} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className={`overflow-hidden transition-all duration-300 ${expanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden"} font-medium text-sm text-left`}>Settings</span>
            </button>

            <button onClick={logout} className={`flex items-center gap-3 p-2 rounded-xl text-(--text-muted) hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all group ${expanded ? "" : "justify-center"}`} title="Logout">
              <div className="flex items-center justify-center w-9 h-9">
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className={`overflow-hidden transition-all duration-300 ${expanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden"} font-medium text-sm text-left`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Settings Drawer */}
      <div className={`fixed inset-0 z-50 ${settingsOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${settingsOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setSettingsOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-(--bg-card) theme-bg-card shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${settingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-(--border-primary)">
            <h3 className="font-semibold text-(--text-primary)">Settings</h3>
            <button 
              onClick={() => setSettingsOpen(false)} 
              className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors text-(--text-muted) cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-(--bg-secondary) rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-(--text-primary) text-[16px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                <button 
                  onClick={toggle}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isDark ? 'bg-(--bg-tertiary)' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDark ? 'left-7' : 'left-1'}`}></span>
                </button>
              </div>
              <p className="text-(--text-muted) text-[13px]">{isDark ? 'Switch to light mode for a brighter interface.' : 'Switch to dark mode for a better experience in low light.'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
