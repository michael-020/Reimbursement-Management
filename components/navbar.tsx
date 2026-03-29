"use client";

import { Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "manager" | "employee";

const avatarColors: Record<Role, string> = {
  admin: "bg-amber-500",
  manager: "bg-sky-500",
  employee: "bg-emerald-500",
};

export default function Navbar({ role }: { role: Role }) {
  const { user, loading, error } = useUser();
  const { logout } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fallback to mock data if API fails or user not found
  const mockUser: Record<Role, { name: string; email: string; avatar: string }> = {
    admin: { name: "Alex Carter", email: "alex@company.com", avatar: "AC" },
    manager: { name: "Morgan Lee", email: "morgan@company.com", avatar: "ML" },
    employee: { name: "Jordan Smith", email: "jordan@company.com", avatar: "JS" },
  };

  const currentUser = user || mockUser[role];
  const displayAvatar = user?.avatar || mockUser[role].avatar;

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    router.push('/signin');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3 opacity-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-72 hover:border-slate-300 transition-colors">
        
      </div>

      <div className="flex items-center gap-3">

        <div className="w-px h-6 bg-slate-200" />

        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={`w-8 h-8 rounded-lg ${avatarColors[role]} flex items-center justify-center shadow-sm`}>
              <span className="text-xs font-bold text-white">{displayAvatar}</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">{currentUser.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden md:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}