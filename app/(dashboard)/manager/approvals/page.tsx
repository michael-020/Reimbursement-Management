"use client";

import { useState } from "react";
import { Card, PageHeader, Badge } from "@/components/ui/card";
import { CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { toast } from "sonner";
import { Receipt } from "@/lib/api";

interface Expense extends Receipt {}

const categoryColors: Record<string, string> = {
  Travel: "bg-sky-50 text-sky-700",
  Meals: "bg-orange-50 text-orange-700",
  Equipment: "bg-purple-50 text-purple-700",
  Software: "bg-indigo-50 text-indigo-700",
  Training: "bg-teal-50 text-teal-700",
  "Office Supplies": "bg-rose-50 text-rose-700",
};

export default function ApprovalsPage() {
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const { expenses, loading, error, updateExpenseStatus, refetch } = useExpenses({ autoFetch: true });

  // Filter for pending expenses only
  const pendingExpenses = expenses.filter(expense => expense.status === "pending");

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const success = await updateExpenseStatus(id, action, comments[id]);
    if (success) {
      toast.success(`Expense ${action}d successfully`);
      // Clear comment after successful action
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[id];
        return newComments;
      });
      // Refetch to get updated data
      refetch();
    } else {
      toast.error(`Failed to ${action} expense`);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const pending = pendingExpenses.filter((e) => e.status === "pending");
  const resolved = pendingExpenses.filter((e) => e.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading approvals...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle={`${pending.length} expense${pending.length !== 1 ? "s" : ""} awaiting your review`}
      />

      {/* Pending */}
      <div className="space-y-4 mb-8">
        {pending.map((exp) => (
          <Card key={exp.id} className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                  {exp.employee.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-slate-900">{exp.employee}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[exp.category] ?? "bg-slate-100 text-slate-600"}`}>
                      {exp.category}
                    </span>
                    <Badge status="pending" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{exp.id} · {exp.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-slate-900">{exp.amount}</span>
                <button
                  onClick={() => toggleExpand(exp.id)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                >
                  {expanded === exp.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expanded === exp.id && (
              <div className="border-t border-slate-100 px-6 py-5 bg-slate-50 space-y-4">
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600">{exp.description}</p>
                </div>

                {/* Comment Box */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Comment (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={comments[exp.id] ?? ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [exp.id]: e.target.value }))}
                    placeholder="Add a reason or note..."
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800 resize-none bg-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAction(exp.id, "approve")}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200"
                  >
                    <CheckCircle2 size={15} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(exp.id, "reject")}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-200"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions (collapsed) */}
            {expanded !== exp.id && (
              <div className="border-t border-slate-100 px-6 py-3 flex items-center gap-3 bg-slate-50/50">
                <button
                  onClick={() => handleAction(exp.id, "approve")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <span className="text-slate-200">·</span>
                <button
                  onClick={() => handleAction(exp.id, "reject")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
                <span className="text-slate-200">·</span>
                <button
                  onClick={() => setExpanded(exp.id)}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  View details
                </button>
              </div>
            )}
          </Card>
        ))}

        {pending.length === 0 && (
          <Card className="p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-300 mb-3" />
            <p className="text-slate-700 font-semibold text-base">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending approvals right now.</p>
          </Card>
        )}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-700 mb-4">Recently Resolved</h2>
          <div className="space-y-3">
            {resolved.map((exp) => (
              <Card key={exp.id} className="px-6 py-4 flex items-center justify-between opacity-70">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {exp.employee.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{exp.employee}</p>
                    <p className="text-xs text-slate-400">{exp.id} · {exp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-800">{exp.amount}</span>
                  <Badge status={exp.status as "approved" | "rejected"} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}