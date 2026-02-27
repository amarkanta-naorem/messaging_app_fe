"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Database, ArrowUpRight, Bell, MoreHorizontal, Sparkles, MessageCircleMore } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-12 gap-4 mb-5">
        <div className="col-span-10 bg-[var(--bg-card)] theme-bg-card shadow-xs border border-[var(--border-primary)] h-40 rounded-4xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
          <div className="absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-emerald-50/50 to-transparent" />
          
          <div className="relative h-full flex items-center justify-between px-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">Welcome back, <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{user.name}</span></h2>
              <p className="text-[var(--text-secondary)] font-medium max-w-lg mt-1 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                <span className="text-xs">Ready to explore?</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all duration-300 group cursor-pointer">
                <Bell size={20} />
                <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-card)] group-hover:ring-emerald-50 transition-all" />
              </button>
              
              <Link href="/chat" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all duration-300 cursor-pointer">
                <MessageCircleMore size={20} />
              </Link>

              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all duration-300 cursor-pointer">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-2 relative overflow-hidden bg-[url('/image/card-background.png')] bg-cover bg-center h-40 rounded-4xl p-5 flex flex-col justify-between text-white shadow-xl group">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-wide">Storage</h3>
              <p className="text-[10px] font-medium text-white/80 mt-0.5 uppercase tracking-wider">75% Used</p>
            </div>
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/10">
              <Database size={16} className="text-white" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-medium opacity-90">
                <span>75 GB</span>
                <span>100 GB</span>
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="bg-white w-3/4 h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
            </div>
            <button className="w-full py-2 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-1">
              Upgrade Plan
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="block col-span-4 h-60 bg-[var(--bg-card)] theme-bg-card shadow rounded-3xl"></div>
        <div className="block col-span-8 h-60 bg-[var(--bg-card)] theme-bg-card shadow rounded-3xl"></div>
      </div>
    </div>
  );
}
