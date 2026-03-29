"use client";

import { useState } from "react";
import { Card, PageHeader, Badge } from "@/components/ui/card";
import { PlusCircle, FileText, Filter } from "lucide-react";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { useRouter } from "next/navigation";

const categoryColors: Record<string, string> = {
  Travel: "bg-sky-50 text-sky-700",
  Meals: "bg-orange-50 text-orange-700",
  Equipment: "bg-purple-50 text-purple-700",
  Software: "bg-indigo-50 text-indigo-700",
  Training: "bg-teal-50 text-teal-700",
  "Office Supplies": "bg-rose-50 text-rose-700",
};

export default function EmployeeExpensesPage() {
  const { expenses, loading, error, fetchExpenses, createExpense } = useExpenses({ autoFetch: true });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fallback to mock data if API fails
  const mockExpenses = [
    { id: "EXP-014", category: "Travel", amount: "$1,240", date: "Mar 28, 2025", status: "pending" as const, description: "Flight to NYC client meeting" },
    { id: "EXP-013", category: "Software", amount: "$99", date: "Mar 22, 2025", status: "approved" as const, description: "Figma subscription renewal" },
    { id: "EXP-012", category: "Meals", amount: "$380", date: "Mar 20, 2025", status: "approved" as const, description: "Team lunch - quarterly review" },
    { id: "EXP-011", category: "Equipment", amount: "$560", date: "Mar 15, 2025", status: "rejected" as const, description: "External monitor purchase" },
    { id: "EXP-010", category: "Training", amount: "$890", date: "Mar 10, 2025", status: "approved" as const, description: "AWS certification course" },
  ];

  const displayExpenses = error ? mockExpenses : expenses;

  const total = displayExpenses.reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);
  const approved = displayExpenses.filter((e) => e.status === "approved").reduce((acc, e) => acc + parseFloat(e.amount.replace("$", "").replace(",", "")), 0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.date) {
      newErrors.date = "Please select an expense date";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createExpense({
        amountOriginal: parseFloat(formData.amount),
        currencyOriginal: "USD",
        amountConverted: parseFloat(formData.amount),
        currencyCompany: "USD",
        conversionRate: 1,
        category: formData.category,
        description: formData.description,
        expenseDate: formData.date,
      });

      if (success) {
        setShowSubmitForm(false);
        setFormData({ amount: "", category: "", date: "", description: "" });
        fetchExpenses(); // Refresh the expenses list
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      setErrors({ submit: "Failed to submit expense. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !showSubmitForm) {
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
        subtitle="Manage your expense requests and submit new ones"
        action={
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200"
          >
            <PlusCircle size={16} /> {showSubmitForm ? "View Expenses" : "New Expense"}
          </button>
        }
      />

      {showSubmitForm ? (
        <div className="max-w-2xl">
          <Card className="p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Submit New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className={`w-full text-sm border rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 transition-all placeholder-slate-300 ${
                      errors.amount 
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 text-red-800" 
                        : "border-slate-200 focus:border-amber-400 focus:ring-amber-100 text-slate-800"
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all text-slate-700 bg-white ${
                      errors.category
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                    }`}
                  >
                    <option value="">Select category...</option>
                    {Object.keys(categoryColors).map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all text-slate-700 ${
                      errors.date
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                    }`}
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the purpose of this expense..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all placeholder-slate-300 resize-none ${
                    errors.description
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100 text-red-800"
                      : "border-slate-200 focus:border-amber-400 focus:ring-amber-100 text-slate-800"
                  }`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="text-sm px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="text-sm px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Expense"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Submitted", value: `$${total.toLocaleString()}`, color: "text-slate-900" },
              { label: "Total Approved", value: `$${approved.toLocaleString()}`, color: "text-emerald-600" },
              { label: "Pending Review", value: displayExpenses.filter((e) => e.status === "pending").length.toString(), color: "text-amber-600" },
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
                  {displayExpenses.map((exp) => (
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
        </>
      )}
    </div>
  );
}
