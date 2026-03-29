"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import { ArrowLeft, Upload, X, FileText, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/lib/hooks/useExpenses";

const categories = ["Travel", "Meals", "Equipment", "Software", "Training", "Office Supplies", "Marketing", "Other"];
const currencies = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

export default function SubmitExpensePage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    category: "",
    date: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { createExpense } = useExpenses({ autoFetch: false });

  const handleFile = (file: File | null) => {
    if (file) setFileName(file.name);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
        currencyOriginal: formData.currency,
        amountConverted: parseFloat(formData.amount), // Assuming 1:1 conversion for now
        currencyCompany: "USD",
        conversionRate: 1,
        category: formData.category,
        description: formData.description,
        expenseDate: formData.date,
        receiptUrl: fileName || undefined, // In a real app, you'd upload the file first
      });

      if (success) {
        router.push("/employee/my-expenses");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      setErrors({ submit: "Failed to submit expense. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/employee" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <PageHeader title="Submit Expense" subtitle="Fill in the details for your reimbursement request." />
      </div>

      <div className="max-w-2xl">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount + Currency */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Amount & Currency <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <select 
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white w-28"
                >
                  {currencies.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="relative flex-1">
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
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            {/* Category + Date */}
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
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Expense Date <span className="text-red-400">*</span>
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

            {/* Description */}
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

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Receipt / Attachment
              </label>

              {!fileName ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragOver ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                  <Upload size={28} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-600">Drop file here or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{fileName}</p>
                    <p className="text-xs text-slate-400">Ready to upload</p>
                  </div>
                  <button
                    onClick={() => setFileName(null)}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/employee" className="text-sm px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="text-sm px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {isSubmitting ? "Submitting..." : "Submit Expense"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}