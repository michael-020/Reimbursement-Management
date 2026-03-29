import { StatCard, Card, PageHeader, Badge } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const pendingItems = [
  { id: "EXP-018", employee: "Jordan Smith", amount: "$1,240", category: "Travel", date: "Mar 28" },
  { id: "EXP-017", employee: "Casey Brown", amount: "$890", category: "Training", date: "Mar 26" },
  { id: "EXP-016", employee: "Taylor Davis", amount: "$145", category: "Office Supplies", date: "Mar 25" },
];

export default function ManagerDashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Review pending approvals and track team expenses." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard title="Pending Approvals" value="8" change="3 urgent" changeType="down" icon={<Clock size={20} className="text-amber-600" />} iconBg="bg-amber-50" />
        <StatCard title="Approved This Month" value="24" change="↑ from last month" changeType="up" icon={<CheckCircle2 size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" />
        <StatCard title="Rejected" value="3" change="This month" changeType="neutral" icon={<XCircle size={20} className="text-red-500" />} iconBg="bg-red-50" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Pending Approvals</h2>
          <Link href="/manager/approvals" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
            Review all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  {item.employee.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.employee}</p>
                  <p className="text-xs text-slate-400">{item.id} · {item.category} · {item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-900">{item.amount}</span>
                <Badge status="pending" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}