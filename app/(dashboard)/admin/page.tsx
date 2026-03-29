import { StatCard, Card, PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import {
  Users,
  Receipt,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const recentExpenses = [
  { id: "EXP-001", name: "Jordan Smith", amount: "$1,240", category: "Travel", status: "pending" as const, date: "Mar 28" },
  { id: "EXP-002", name: "Riley Johnson", amount: "$380", category: "Meals", status: "approved" as const, date: "Mar 27" },
  { id: "EXP-003", name: "Casey Brown", amount: "$2,100", category: "Equipment", status: "rejected" as const, date: "Mar 26" },
  { id: "EXP-004", name: "Alex Taylor", amount: "$560", category: "Software", status: "pending" as const, date: "Mar 25" },
  { id: "EXP-005", name: "Sam Wilson", amount: "$890", category: "Training", status: "approved" as const, date: "Mar 24" },
];

const quickActions = [
  { label: "Manage Users", href: "/admin/users", icon: <Users size={16} />, desc: "Add or edit user accounts" },
  { label: "Approval Rules", href: "/admin/approval-rules", icon: <CheckCircle2 size={16} />, desc: "Configure approval workflows" },
  { label: "View Expenses", href: "/admin/expenses", icon: <Receipt size={16} />, desc: "Review all submitted expenses" },
];

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, Alex. Here's what's happening today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value="128"
          change="↑ 4 added this week"
          changeType="up"
          icon={<Users size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Total Expenses"
          value="$84,320"
          change="↑ 12% from last month"
          changeType="up"
          icon={<Receipt size={20} className="text-sky-600" />}
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Pending Approvals"
          value="23"
          change="↓ 5 since yesterday"
          changeType="down"
          icon={<Clock size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Approved This Month"
          value="$41,200"
          change="↑ 8% vs last month"
          changeType="up"
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
              <p className="text-slate-400 text-xs mt-0.5">Latest submissions across all employees</p>
            </div>
            <Link
              href="/admin/expenses"
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {exp.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{exp.name}</p>
                    <p className="text-xs text-slate-400">{exp.id} · {exp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-semibold text-slate-900">{exp.amount}</span>
                  <Badge status={exp.status} />
                  <span className="text-xs text-slate-400 w-12 text-right">{exp.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Quick Actions</h2>
          <p className="text-slate-400 text-xs mb-5">Navigate to key sections</p>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all duration-150 group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-amber-500 flex items-center justify-center transition-colors">
                  <span className="text-slate-600 group-hover:text-white transition-colors">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">{action.label}</p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}