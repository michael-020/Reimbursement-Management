"use client";

import { Card, PageHeader } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  role: "admin" | "manager" | "employee" | "finance" | "director";
}

const users: User[] = [
  { id: "user-001", name: "Morgan Lee", role: "manager" },
  { id: "user-002", name: "Sam Wilson", role: "manager" },
  { id: "user-003", name: "Alex Carter", role: "manager" },
  { id: "user-004", name: "Taylor Chen", role: "admin" },
  { id: "user-005", name: "Jordan Blake", role: "employee" },
  { id: "user-006", name: "Casey Thompson", role: "finance" },
  { id: "user-007", name: "Riley Davis", role: "director" },
];

const filteredManagers = users.filter((user) => user.role === "manager");
const roles = ["Employee", "Manager", "Admin", "Finance", "Director"];

export default function CreateUserPage() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>
        <PageHeader
          title="Add New User"
          subtitle="Create a new user account and assign their role and manager."
        />
      </div>

      <div className="max-w-2xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-200">
              <UserPlus size={18} className="text-slate-900" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">User Details</p>
              <p className="text-sm text-slate-400">Fill in the information below</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Jordan Smith"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="jordan@company.com"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white cursor-pointer"
                >
                  <option value="">Select a role...</option>
                  {roles.map((r) => (
                    <option key={r} value={r.toLowerCase()}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reporting Manager
                </label>
                <select
                  disabled={selectedRole === "admin"}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">Select manager...</option>
                  {filteredManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Note:</span> An invitation email will be sent to the user to set up their password.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/admin/users"
                className="text-sm px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button className="text-sm px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 flex items-center gap-2">
                <UserPlus size={15} />
                Create User
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}