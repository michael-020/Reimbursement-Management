import { Card, PageHeader } from "@/components/ui/card";
import { Plus, ShieldCheck, Users, Percent, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const rules = [
  {
    id: 1,
    name: "Standard Employee Rule",
    description: "For general employee expense submissions up to $500",
    managerRequired: true,
    approvers: ["Direct Manager", "Finance Team"],
    threshold: "$500",
    categories: ["Travel", "Meals", "Office Supplies"],
    active: true,
  },
  {
    id: 2,
    name: "High-Value Expenses",
    description: "For expenses exceeding $500 — requires multi-step approval",
    managerRequired: true,
    approvers: ["Direct Manager", "Department Head", "CFO"],
    threshold: "$5,000",
    categories: ["Equipment", "Software", "Training"],
    active: true,
  },
  {
    id: 3,
    name: "Executive Approvals",
    description: "C-suite level expenses with board-level oversight",
    managerRequired: false,
    approvers: ["CFO", "CEO"],
    threshold: "Unlimited",
    categories: ["All Categories"],
    active: false,
  },
];

export default function ApprovalRulesPage() {
  return (
    <div>
      <PageHeader
        title="Approval Rules"
        subtitle="Configure multi-step approval workflows for expense submissions"
        action={
          <Link
            href="/admin/approval-rules/create"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200"
          >
            <Plus size={16} />
            New Rule
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {rules.map((rule) => (
          <Card key={rule.id} hover className="p-6 flex flex-col gap-4 relative">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <ShieldCheck size={18} className="text-amber-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rule.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {rule.active ? "Active" : "Inactive"}
                </span>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <MoreHorizontal size={14} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{rule.name}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{rule.description}</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Percent size={13} className="text-slate-400" /> Threshold
                </span>
                <span className="font-semibold text-slate-800">{rule.threshold}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Users size={13} className="text-slate-400" /> Approvers
                </span>
                <span className="font-semibold text-slate-800">{rule.approvers.length} steps</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Manager Required</span>
                <span className={`font-semibold ${rule.managerRequired ? "text-emerald-600" : "text-slate-400"}`}>
                  {rule.managerRequired ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Approval Chain */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Approval Chain</p>
              <div className="flex flex-wrap gap-1.5">
                {rule.approvers.map((approver, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium">
                      {i + 1}. {approver}
                    </span>
                    {i < rule.approvers.length - 1 && (
                      <ChevronRight size={12} className="text-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/admin/approval-rules/${rule.id}`}
              className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              Edit Rule <ChevronRight size={14} />
            </Link>
          </Card>
        ))}

        <Link href="/admin/approval-rules/create">
          <Card className="p-6 flex flex-col items-center justify-center text-center min-h-70 border-dashed border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center mb-3 transition-colors">
              <Plus size={20} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-slate-700 group-hover:text-amber-700 transition-colors">Create New Rule</p>
            <p className="text-xs text-slate-400 mt-1">Define a new approval workflow</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}