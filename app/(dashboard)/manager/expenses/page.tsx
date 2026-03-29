"use client";

import { useState } from "react";
import { Card, PageHeader, Badge } from "@/components/ui/card";
import { FileText, Filter, CheckCircle, XCircle, Clock } from "lucide-react";
import { useExpenses } from "@/lib/hooks/useExpenses";

const categoryColors: Record<string, string> = {
  Travel: "bg-sky-50 text-sky-700",
  Meals: "bg-orange-50 text-orange-700",
  Equipment: "bg-purple-50 text-purple-700",
  Software: "bg-indigo-50 text-indigo-700",
  Training: "bg-teal-50 text-teal-700",
  "Office Supplies": "bg-rose-50 text-rose-700",
};

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ManagerExpensesPage() {
  const { expenses, loading, error, fetchExpenses, updateExpenseStatus } = useExpenses({ autoFetch: true });
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fallback to mock data if API fails
  const mockExpenses = [
    { id: "EXP-001", employeeName: "Jordan Smith", category: "Travel", amount: "$1,240", date: "Mar 28, 2025", status: "pending" as const, description: "Flight to NYC client meeting" },
    { id: "EXP-002", employeeName: "Riley Johnson", category: "Meals", amount: "$380", date: "Mar 27, 2025", status: "approved" as const, description: "Team lunch - quarterly review" },
    { id: "EXP-003", employeeName: "Casey Brown", category: "Equipment", amount: "$2,100", date: "Mar 26, 2025", status: "rejected" as const, description: "External monitor purchase" },
    { id: "EXP-004", employeeName: "Alex Taylor", category: "Software", amount: "$560", date: "Mar 25, 2025", status: "pending" as const, description: "Figma subscription renewal" },
    { id: "EXP-005", employeeName: "Sam Wilson", category: "Training", amount: "$890", date: "Mar 24, 2025", status: "approved" as const, description: "AWS certification course" },
    { id: "EXP-006", employeeName: "Morgan Lee", category: "Travel", amount: "$1,500", date: "Mar 23, 2025", status: "pending" as const, description: "Hotel stay for conference" },
    { id: "EXP-007", employeeName: "Jamie Davis", category: "Office Supplies", amount: "$150", date: "Mar 22, 2025", status: "approved" as const, description: "Desk chair and accessories" },
  ];

  const displayExpenses = error ? mockExpenses : expenses;

  // Debug logging
  console.log('Display expenses:', displayExpenses);
  console.log('Error state:', error);
  console.log('Loading state:', loading);

  const filteredExpenses = displayExpenses.filter(expense => {
    const matchesStatus = !selectedStatus || expense.status === selectedStatus;
    const matchesCategory = !selectedCategory || expense.category === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  const total = filteredExpenses.reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);
  const pending = filteredExpenses.filter((e) => e.status === "pending").length;
  const approved = filteredExpenses.filter((e) => e.status === "approved").length;

  const handleStatusUpdate = async (expenseId: string, status: 'APPROVED' | 'REJECTED') => {
    const success = await updateExpenseStatus(expenseId, status);
    if (success) {
      // Refresh expenses to get updated data
      await fetchExpenses();
    }
  };

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
        title="Expenses"
        subtitle="Review and manage expense requests from your team members"
      />

      {/* Summary */}
      {/* <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Amount", value: `$${total.toLocaleString()}`, color: "text-slate-900", icon: null },
          { label: "Pending Review", value: pending.toString(), color: "text-amber-600", icon: <Clock size={16} /> },
          { label: "Approved", value: approved.toString(), color: "text-emerald-600", icon: <CheckCircle size={16} /> },
          { label: "Rejected", value: filteredExpenses.filter((e) => e.status === "rejected").length.toString(), color: "text-red-600", icon: <XCircle size={16} /> },
        ].map((s) => (
          <Card key={s.label} className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
              {s.icon && <div className={`p-2 rounded-lg ${s.color === 'text-amber-600' ? 'bg-amber-50' : s.color === 'text-emerald-600' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <span className={s.color}>{s.icon}</span>
              </div>}
            </div>
          </Card>
        ))}
      </div> */}

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filters:</span>
          </div>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="">All Categories</option>
            {Object.keys(categoryColors).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {(selectedStatus || selectedCategory) && (
            <button
              onClick={() => {
                setSelectedStatus('');
                setSelectedCategory('');
              }}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {[ "Employee", "Description", "Category", "Amount", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    {/* <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-500">{exp.id}</td> */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{exp.employeeName || 'Unknown'}</p>
                    </td>
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
                    <td className="px-6 py-4">
                      <Badge status={exp.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Debug: Show conditions */}
                        {console.log(`Expense ${exp.id}: status=${exp.status}, canApprove=${exp.canApprove}, condition=${exp.status === 'pending' && exp.canApprove}`)}
                        {exp.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(exp.id, 'APPROVED')}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs px-2 py-1.5 rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(exp.id, 'REJECTED')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs px-2 py-1.5 rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
                          <FileText size={13} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
