"use client";

import Image from "next/image";
import SidebarItem from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createContext, useState } from "react";
import { ChevronFirst, ChevronLast, LayoutDashboard, LogOut, ShieldUser } from "lucide-react";

export const SidebarContext = createContext({ expanded: true });

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <aside className={`sticky top-0 flex flex-col bg-white border-r border-slate-200 rounded-3xl shadow-sm transition-all duration-300 ease-in-out ${expanded ? 'w-48' : 'w-20'}`}>
      <div className={`p-4 pb-2 flex items-center h-16 ${expanded ? "justify-between" : "justify-center"}`}>
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${expanded ? "w-full opacity-100" : "w-0 opacity-0 hidden"}`}>
          <h1 className="font-bold text-xl text-slate-800 whitespace-nowrap truncate tracking-tight">
            {user.organisation_employees?.organisation?.name ?? "Org. Name"}
          </h1>
        </div>
        <button onClick={() => setExpanded(curr => !curr)} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
        </button>
      </div>

      <SidebarContext.Provider value={{ expanded }}>
        <ul className="flex-1 px-3 py-4 space-y-4">
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
          <SidebarItem icon={<ShieldUser size={20} />} text="Employees" href="/employees" active={pathname === '/employees'} />
        </ul>
      </SidebarContext.Provider>

      <div className="border-t border-slate-200 p-3">
        <div className={`flex flex-col gap-1 ${expanded ? "" : "items-center"}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group ${expanded ? "" : "justify-center"}`}>
            <div className="relative group cursor-pointer shrink-0">
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-white">
                {user.avatar ? (
                  <Image src={user.avatar} width={36} height={36} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden"}`}>
              <h4 className="font-semibold text-slate-700 text-sm truncate">{user.name}</h4>
              <p className="text-xs text-slate-500 truncate">View Profile</p>
            </div>
          </div>

          <button onClick={logout} className={`flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all group ${expanded ? "" : "justify-center"}`} title="Logout">
            <div className="flex items-center justify-center w-9 h-9">
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className={`overflow-hidden transition-all duration-300 ${expanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden"} font-medium text-sm text-left`}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}