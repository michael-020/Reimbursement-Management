"use client";

import { useState, useEffect } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import { ShieldCheck, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";

interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  ruleType: "PERCENTAGE" | "SPECIFIC_APPROVER" | "HYBRID";
  percentageThreshold?: number;
  specificApproverId?: string;
  specificApprover?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axiosInstance.get("/admin/approval-rules");
        setRules(response.data.approvalRules || []);
      } catch (error) {
        console.error("Error fetching approval rules:", error);
        toast.error("Failed to fetch approval rules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Approval Rules"
          subtitle="Manage expense approval workflows"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading approval rules...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Approval Rules"
        subtitle="Manage expense approval workflows"
      />

      <div className="space-y-6">
        {rules.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Approval Rules</h3>
            <p className="text-sm text-slate-500 mb-6">
              Create your first approval rule to define how expenses are processed in your organization.
            </p>
            <Link href="/admin/approval-rules/create">
              <button className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 flex items-center gap-2 mx-auto">
                <Plus size={16} />
                Create First Rule
              </button>
            </Link>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{rule.name}</h3>
                  <p className="text-sm text-slate-500">
                    {rule.ruleType === "PERCENTAGE" && `${rule.percentageThreshold}% approval threshold`}
                    {rule.ruleType === "SPECIFIC_APPROVER" && `Specific approver: ${rule.specificApprover?.name}`}
                    {rule.ruleType === "HYBRID" && `Hybrid: ${rule.percentageThreshold}% OR ${rule.specificApprover?.name}`}
                  </p>
                </div>
              </div>

              {rule.description && (
                <p className="text-sm text-slate-600 mb-4">{rule.description}</p>
              )}

              <div className="flex items-center justify-between">
                <Link href={`/admin/approval-rules/edit/${rule.id}`}>
                  <button className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Edit Rule
                  </button>
                </Link>
                <span className="text-xs text-slate-400">
                  Created {new Date(rule.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))
        )}

        <Link href="/admin/approval-rules/create">
          <Card className="p-6 flex flex-col items-center justify-center text-center min-h-32 border-dashed border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer group">
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