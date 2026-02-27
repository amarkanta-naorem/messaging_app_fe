/**
 * ChatEmptyState - Displayed when no conversation is selected.
 * Shows options for starting new chats, going to dashboard, or creating groups.
 */

import { MessageCirclePlus, Users } from "lucide-react";

export function ChatEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[var(--chat-bg)]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* New Chat Card */}
          <div className="group flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-[var(--bg-card)] rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-[var(--border-primary)]">
            <div className="flex flex-col items-center justify-center space-y-2">
              <MessageCirclePlus size={28} className="text-[var(--text-secondary)] group-hover:text-[#00a884] transition-colors"/>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">New Chat</h3>
            </div>
          </div>

          {/* Dashboard Card (custom SVG) */}
          <div className="group flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-[var(--bg-card)] rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-[var(--border-primary)]">
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                <path d="M33 16.35V6.15C33 3.9 32.04 3 29.655 3H23.595C21.21 3 20.25 3.9 20.25 6.15V16.35C20.25 18.6 21.21 19.5 23.595 19.5H29.655C32.04 19.5 33 18.6 33 16.35Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-[#00a884] transition-colors"/>
                <path d="M33 29.85V27.15C33 24.9 32.04 24 29.655 24H23.595C21.21 24 20.25 24.9 20.25 27.15V29.85C20.25 32.1 21.21 33 23.595 33H29.655C32.04 33 33 32.1 33 29.85Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-[#00a884] transition-colors"/>
                <path d="M15.75 19.65V29.85C15.75 32.1 14.79 33 12.405 33H6.345C3.96 33 3 32.1 3 29.85V19.65C3 17.4 3.96 16.5 6.345 16.5H12.405C14.79 16.5 15.75 17.4 15.75 19.65Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-[#00a884] transition-colors"/>
                <path d="M15.75 6.15V8.85C15.75 11.1 14.79 12 12.405 12H6.345C3.96 12 3 11.1 3 8.85V6.15C3 3.9 3.96 3 6.345 3H12.405C14.79 3 15.75 3.9 15.75 6.15Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-[#00a884] transition-colors"/>
              </svg>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">Dashboard</h3>
            </div>
          </div>

          {/* New Group Card */}
          <div className="group flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-[var(--bg-card)] rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-[var(--border-primary)]">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Users size={28} className="text-[var(--text-secondary)] group-hover:text-[#00a884] transition-colors"/>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">New Group</h3>
            </div>
          </div>
        </div>

        <p className="text-[var(--text-tertiary)] text-sm mt-8 max-w-xs mx-auto leading-relaxed">Send and receive messages within your company</p>
      </div>
    </div>
  );
}

export default ChatEmptyState;
