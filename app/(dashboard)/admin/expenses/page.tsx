import { Card, PageHeader, Badge } from "@/components/ui/card";
import { Search, Download, Filter } from "lucide-react";

const expenses = [
  { id: "EXP-001", employee: "Jordan Smith", category: "Travel", amount: "$1,240", date: "Mar 28, 2025", status: "pending" as const, manager: "Morgan Lee" },
  { id: "EXP-002", employee: "Riley Johnson", category: "Meals", amount: "$380", date: "Mar 27, 2025", status: "approved" as const, manager: "Morgan Lee" },
  { id: "EXP-003", employee: "Casey Brown", category: "Equipment", amount: "$2,100", date: "Mar 26, 2025", status: "rejected" as const, manager: "Sam Wilson" },
  { id: "EXP-004", employee: "Alex Taylor", category: "Software", amount: "$560", date: "Mar 25, 2025", status: "pending" as const, manager: "Morgan Lee" },
  { id: "EXP-005", employee: "Sam Wilson", category: "Training", amount: "$890", date: "Mar 24, 2025", status: "approved" as const, manager: "Alex Carter" },
  { id: "EXP-006", employee: "Taylor Davis", category: "Office Supplies", amount: "$145", date: "Mar 23, 2025", status: "approved" as const, manager: "Morgan Lee" },
  { id: "EXP-007", employee: "Jordan Smith", category: "Travel", amount: "$3,400", date: "Mar 22, 2025", status: "rejected" as const, manager: "Morgan Lee" },
];

const categoryColors: Record<string, string> = {
  Travel: "bg-sky-50 text-sky-700",
  Meals: "bg-orange-50 text-orange-700",
  Equipment: "bg-purple-50 text-purple-700",
  Software: "bg-indigo-50 text-indigo-700",
  Training: "bg-teal-50 text-teal-700",
  "Office Supplies": "bg-rose-50 text-rose-700",
};

export default function AdminExpensesPage() {
  return (
    <div>
      <PageHeader
        title="All Expenses"
        subtitle="View and manage expense submissions across the organization"
        action={
          <button className="flex items-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
            <Download size={15} />
            Export CSV
          </button>
        }
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Submitted", value: "$84,320", color: "text-slate-900" },
          { label: "Approved", value: "$41,200", color: "text-emerald-600" },
          { label: "Pending Review", value: "$18,640", color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex-1 max-w-sm">
            <Search size={14} className="text-slate-400" />
            <input type="text" placeholder="Search by employee, ID..." className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full" />
          </div>
          <select className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none hover:border-slate-300 transition-colors">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <select className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none hover:border-slate-300 transition-colors">
            <option>All Categories</option>
            <option>Travel</option>
            <option>Meals</option>
            <option>Equipment</option>
            <option>Software</option>
          </select>
          <button className="flex items-center gap-2 text-sm border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={14} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Expense ID", "Employee", "Category", "Amount", "Manager", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-500">{exp.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {exp.employee.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{exp.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[exp.category] ?? "bg-slate-100 text-slate-600"}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{exp.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{exp.manager}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                  <td className="px-6 py-4"><Badge status={exp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">7</span> of <span className="font-semibold text-slate-700">247</span> expenses</p>
          <div className="flex items-center gap-2">
            <button className="text-sm px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Previous</button>
            <button className="text-sm px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 transition-colors">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}