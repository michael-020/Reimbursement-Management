"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

type Role = "admin" | "manager" | "employee";

const avatarColors: Record<Role, string> = {
  admin: "bg-amber-500",
  manager: "bg-sky-500",
  employee: "bg-emerald-500",
};

export default function Navbar({ role }: { role: Role }) {
  const { user, loading, error } = useUser();

  // Fallback to mock data if API fails or user not found
  const mockUser: Record<Role, { name: string; email: string; avatar: string }> = {
    admin: { name: "Alex Carter", email: "alex@company.com", avatar: "AC" },
    manager: { name: "Morgan Lee", email: "morgan@company.com", avatar: "ML" },
    employee: { name: "Jordan Smith", email: "jordan@company.com", avatar: "JS" },
  };

  const currentUser = user || mockUser[role];
  const displayAvatar = user?.avatar || mockUser[role].avatar;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-72 hover:border-slate-300 transition-colors">
        <Search size={15} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search expenses, users..."
          className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors group">
          <Bell size={16} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="w-px h-6 bg-slate-200" />

        <button className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors group">
          <div className={`w-8 h-8 rounded-lg ${avatarColors[role]} flex items-center justify-center shadow-sm`}>
            <span className="text-xs font-bold text-white">{displayAvatar}</span>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{currentUser.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden md:block" />
        </button>
      </div>
    </header>
  );
}