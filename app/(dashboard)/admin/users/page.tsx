import { Card, PageHeader, Badge } from "@/components/ui/card";
import { UserPlus, Search, MoreHorizontal, Mail } from "lucide-react";
import Link from "next/link";

const users = [
  { id: 1, name: "Jordan Smith", email: "jordan@company.com", role: "Employee", manager: "Morgan Lee", status: "active" as const, joined: "Jan 15, 2024", expenses: 14 },
  { id: 2, name: "Riley Johnson", email: "riley@company.com", role: "Employee", manager: "Morgan Lee", status: "active" as const, joined: "Feb 3, 2024", expenses: 8 },
  { id: 3, name: "Morgan Lee", email: "morgan@company.com", role: "Manager", manager: "Alex Carter", status: "active" as const, joined: "Dec 1, 2023", expenses: 22 },
  { id: 4, name: "Casey Brown", email: "casey@company.com", role: "Employee", manager: "Sam Wilson", status: "inactive" as const, joined: "Mar 10, 2024", expenses: 3 },
  { id: 5, name: "Sam Wilson", email: "sam@company.com", role: "Manager", manager: "Alex Carter", status: "active" as const, joined: "Nov 20, 2023", expenses: 31 },
  { id: 6, name: "Taylor Davis", email: "taylor@company.com", role: "Employee", manager: "Morgan Lee", status: "active" as const, joined: "Mar 1, 2024", expenses: 5 },
];

const roleColors: Record<string, string> = {
  Admin: "bg-amber-100 text-amber-800",
  Manager: "bg-sky-100 text-sky-800",
  Employee: "bg-slate-100 text-slate-700",
};

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} total users in the system`}
        action={
          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200"
          >
            <UserPlus size={16} />
            Add User
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex-1 max-w-sm">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            />
          </div>
          <select className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Manager</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expenses</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={10} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.manager}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{user.expenses}</td>
                  <td className="px-6 py-4">
                    <Badge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.joined}</td>
                  <td className="px-6 py-4">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={16} className="text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">6</span> of <span className="font-semibold text-slate-700">128</span> users</p>
          <div className="flex items-center gap-2">
            <button className="text-sm px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Previous</button>
            <button className="text-sm px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 transition-colors">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}