"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircleMore } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import { useRouter, usePathname } from "next/navigation";

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isChatPage = pathname?.startsWith("/chat");

  if (isChatPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex gap-4 min-h-screen bg-slate-50 p-4">
      <Sidebar />
      <main className="relative flex-1">{children}</main>
      <Link href="/chat" className="absolute right-8 bottom-8 flex items-center justify-center w-10 h-10 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-50" >
        <MessageCircleMore size={26} />
      </Link>
    </div>
  );
}
