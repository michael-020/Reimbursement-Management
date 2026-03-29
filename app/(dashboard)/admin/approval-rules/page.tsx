"use client";

import { Card, PageHeader } from "@/components/ui/card";
import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

const defaultRule = {
  name: "Default Company Rule",
  managerRequired: true,
  isSequential: true,
  minApprovalPercent: 60,
  approvers: [
    { name: "John", required: true },
    { name: "Mitchell", required: false },
    { name: "Andreas", required: false },
  ],
};

export default function ApprovalRulesPage() {
  return (
    <div>
      <PageHeader
        title="Default Approval Rule"
        subtitle="This rule is applied to all expense submissions"
      />

      <Card className="p-6 max-w-xl mt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{defaultRule.name}</h3>
            <p className="text-sm text-slate-500">Company-wide default approval flow</p>
          </div>
        </div>

        {/* Config */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Manager Required</span>
            <span className="font-semibold">
              {defaultRule.managerRequired ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Sequential Flow</span>
            <span className="font-semibold">
              {defaultRule.isSequential ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Min Approval %</span>
            <span className="font-semibold">
              {defaultRule.minApprovalPercent}%
            </span>
          </div>
        </div>

        {/* Approvers */}
        <div>
          <p className="text-xs text-slate-400 mb-2 uppercase">
            Approval Chain
          </p>

          <div className="flex flex-wrap gap-2">
            {defaultRule.approvers.map((a, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="bg-slate-100 px-2 py-1 text-xs rounded">
                  {i + 1}. {a.name}
                  {a.required && " (Required)"}
                </span>
                {i < defaultRule.approvers.length - 1 && (
                  <ChevronRight size={12} className="text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Edit */}
        <Link
          href="/admin/approval-rules/edit"
          className="text-amber-600 font-semibold text-sm flex items-center gap-1"
        >
          Edit Rule <ChevronRight size={14} />
        </Link>
      </Card>
    </div>
  );
}