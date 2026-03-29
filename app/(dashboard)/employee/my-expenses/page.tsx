import { Card, PageHeader, Badge } from "@/components/ui/card";
import { PlusCircle, FileText } from "lucide-react";
import Link from "next/link";

const myExpenses = [
  { id: "EXP-014", category: "Travel", amount: "$1,240", date: "Mar 28, 2025", status: "pending" as const, description: "Flight to NYC client meeting" },
  { id: "EXP-013", category: "Software", amount: "$99", date: "Mar 22, 2025", status: "approved" as const, description: "Figma subscription renewal" },
  { id: "EXP-012", category: "Meals", amount: "$380", date: "Mar 20, 2025", status: "approved" as const, description: "Team lunch - quarterly review" },
  { id: "EXP-011", category: "Equipment", amount: "$560", date: "Mar 15, 2025", status: "rejected" as const, description: "External monitor purchase" },
  { id: "EXP-010", category: "Training", amount: "$890", date: "Mar 10, 2025", status: "approved" as const, description: "AWS certification course" },
  { id: "EXP-009", category: "Travel", amount: "$2,100", date: "Feb 28, 2025", status: "pending" as const, description: "Hotel stay for conference" },
];

const categoryColors: Record<string, string> = {
  Travel: "bg-sky-50 text-sky-700",
  Meals: "bg-orange-50 text-orange-700",
  Equipment: "bg-purple-50 text-purple-700",
  Software: "bg-indigo-50 text-indigo-700",
  Training: "bg-teal-50 text-teal-700",
  "Office Supplies": "bg-rose-50 text-rose-700",
};

export default function MyExpensesPage() {
  const total = myExpenses.reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);
  const approved = myExpenses.filter((e) => e.status === "approved").reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);

  return (
    <div>
      <PageHeader
        title="My Expenses"
        subtitle="All your submitted expense requests and their current status"
        action={
          <Link href="/employee/submit-expense" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200">
            <PlusCircle size={16} /> Submit New
          </Link>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Submitted", value: `$${total.toLocaleString()}`, color: "text-slate-900" },
          { label: "Total Approved", value: `$${approved.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Pending Review", value: myExpenses.filter((e) => e.status === "pending").length.toString(), color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["ID", "Description", "Category", "Amount", "Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-500">{exp.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">{exp.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[exp.category] ?? "bg-slate-100 text-slate-600"}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{exp.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                  <td className="px-6 py-4"><Badge status={exp.status} /></td>
                  <td className="px-6 py-4">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
                      <FileText size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}