"use client";

import { useState } from "react";
import { Card, PageHeader, Badge } from "@/components/ui/card";
import { Search, Download, Filter } from "lucide-react";
import { useExpenses } from "@/lib/hooks/useExpenses";

const categoryColors: Record<string, string> = {
  Travel: "bg-sky-50 text-sky-700",
  Meals: "bg-orange-50 text-orange-700",
  Equipment: "bg-purple-50 text-purple-700",
  Software: "bg-indigo-50 text-indigo-700",
  Training: "bg-teal-50 text-teal-700",
  "Office Supplies": "bg-rose-50 text-rose-700",
};

export default function AdminExpensesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { expenses, loading, error, pagination, fetchExpenses } = useExpenses({ 
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    autoFetch: true 
  });

  // Fallback to mock data if API fails
  const mockExpenses = [
    { id: "EXP-001", employee: "Jordan Smith", category: "Travel", amount: "$1,240", date: "Mar 28, 2025", status: "pending" as const, manager: "Morgan Lee" },
    { id: "EXP-002", employee: "Riley Johnson", category: "Meals", amount: "$380", date: "Mar 27, 2025", status: "approved" as const, manager: "Morgan Lee" },
    { id: "EXP-003", employee: "Casey Brown", category: "Equipment", amount: "$2,100", date: "Mar 26, 2025", status: "rejected" as const, manager: "Sam Wilson" },
    { id: "EXP-004", employee: "Alex Taylor", category: "Software", amount: "$560", date: "Mar 25, 2025", status: "pending" as const, manager: "Morgan Lee" },
    { id: "EXP-005", employee: "Sam Wilson", category: "Training", amount: "$890", date: "Mar 24, 2025", status: "approved" as const, manager: "Alex Carter" },
    { id: "EXP-006", employee: "Taylor Davis", category: "Office Supplies", amount: "$145", date: "Mar 23, 2025", status: "approved" as const, manager: "Morgan Lee" },
    { id: "EXP-007", employee: "Jordan Smith", category: "Travel", amount: "$3,400", date: "Mar 22, 2025", status: "rejected" as const, manager: "Morgan Lee" },
  ];

  const displayExpenses = error ? mockExpenses : expenses;

  // Filter by search term
  const filteredExpenses = displayExpenses.filter(exp => 
    exp.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const total = filteredExpenses.reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);
  const approved = filteredExpenses.filter((e) => e.status === "approved").reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);
  const pending = filteredExpenses.filter((e) => e.status === "pending").reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading expenses...</div>
      </div>
    );
  }

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
          { label: "Total Submitted", value: `$${total.toLocaleString()}`, color: "text-slate-900" },
          { label: "Approved", value: `$${approved.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Pending Review", value: `$${pending.toLocaleString()}`, color: "text-amber-600" },
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
            <input 
              type="text" 
              placeholder="Search by employee, ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none hover:border-slate-300 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none hover:border-slate-300 transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Meals">Meals</option>
            <option value="Equipment">Equipment</option>
            <option value="Software">Software</option>
            <option value="Training">Training</option>
            <option value="Office Supplies">Office Supplies</option>
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
              {filteredExpenses.map((exp) => (
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
                  <td className="px-6 py-4 text-sm text-slate-600">{exp.manager || "Unassigned"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                  <td className="px-6 py-4"><Badge status={exp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredExpenses.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{pagination?.total || displayExpenses.length}</span> expenses
          </p>
          <div className="flex items-center gap-2">
            <button className="text-sm px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Previous</button>
            <button className="text-sm px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 transition-colors">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}