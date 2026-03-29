"use client";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, isLoading } = useAuthStore();

  if (isLoading || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const role = authUser.role.toLowerCase() as "admin" | "manager" | "employee";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar role={role} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar role={role} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}