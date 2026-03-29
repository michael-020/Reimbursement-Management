"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Receipt,
  CheckCircle2,
  PlusSquare,
  ClipboardList,
  Wallet,
} from "lucide-react";

type Role = "admin" | "manager" | "employee";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Approval Rules", href: "/admin/approval-rules", icon: <ShieldCheck size={18} /> },
    { label: "Expenses", href: "/admin/expenses", icon: <Receipt size={18} /> },
  ],
  manager: [
    { label: "Dashboard", href: "/manager", icon: <LayoutDashboard size={18} /> },
    { label: "Approvals", href: "/manager/approvals", icon: <CheckCircle2 size={18} /> },
  ],
  employee: [
    { label: "Dashboard", href: "/employee", icon: <LayoutDashboard size={18} /> },
    { label: "Submit Expense", href: "/employee/submit-expense", icon: <PlusSquare size={18} /> },
    { label: "My Expenses", href: "/employee/my-expenses", icon: <ClipboardList size={18} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};

const roleColors: Record<Role, string> = {
  admin: "bg-amber-500",
  manager: "bg-sky-500",
  employee: "bg-emerald-500",
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItems[role];

  return (
    <aside className="w-64 h-full bg-slate-900 flex flex-col shrink-0 border-r border-slate-800">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Wallet size={16} className="text-slate-900" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">ReimbursePro</p>
            <p className="text-slate-500 text-xs">Management System</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${roleColors[role]}`} />
          <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            {roleLabels[role]}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${
                  isActive
                    ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <span className={isActive ? "text-slate-900" : "text-slate-500 group-hover:text-white transition-colors"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs">v1.0.0 · Hackathon Build</p>
      </div>
    </aside>
  );
}