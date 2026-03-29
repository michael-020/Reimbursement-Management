import { StatCard, Card, PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { Receipt, Clock, CheckCircle2, ArrowRight, PlusCircle } from "lucide-react";
import Link from "next/link";

const recentExpenses = [
  { id: "EXP-012", amount: "$1,240", category: "Travel", status: "pending" as const, date: "Mar 28" },
  { id: "EXP-011", amount: "$380", category: "Meals", status: "approved" as const, date: "Mar 20" },
  { id: "EXP-010", amount: "$560", category: "Software", status: "rejected" as const, date: "Mar 15" },
];

export default function EmployeeDashboard() {
  return (
    <div>
      <PageHeader
        title="My Dashboard"
        subtitle="Track your expense submissions and approval statuses."
        action={
          <Link
            href="/employee/submit-expense"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200"
          >
            <PlusCircle size={16} />
            Submit Expense
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Submitted" value="$8,240" change="This quarter" changeType="neutral" icon={<Receipt size={20} className="text-amber-600" />} iconBg="bg-amber-50" />
        <StatCard title="Pending" value="3" change="Awaiting review" changeType="neutral" icon={<Clock size={20} className="text-sky-600" />} iconBg="bg-sky-50" />
        <StatCard title="Approved" value="$5,810" change="↑ from last month" changeType="up" icon={<CheckCircle2 size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Submissions</h2>
            <Link href="/employee/my-expenses" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{exp.category}</p>
                  <p className="text-xs text-slate-400">{exp.id} · {exp.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-900">{exp.amount}</span>
                  <Badge status={exp.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Submit New Expense", desc: "Add a new expense for reimbursement", href: "/employee/submit-expense", color: "bg-amber-500 hover:bg-amber-600 text-slate-900" },
              { label: "View All Expenses", desc: "Track status of past submissions", href: "/employee/my-expenses", color: "bg-slate-900 hover:bg-slate-800 text-white" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className={`flex items-center justify-between px-5 py-4 rounded-xl font-semibold text-sm transition-colors ${a.color}`}>
                <div>
                  <p>{a.label}</p>
                  <p className="text-xs font-normal opacity-70 mt-0.5">{a.desc}</p>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}