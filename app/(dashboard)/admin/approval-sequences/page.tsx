"use client";

import { useState, useEffect } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import { ShieldCheck, Plus, Edit, Trash2, GripVertical, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";

interface ApprovalStep {
  id: string;
  approverType: "MANAGER" | "FINANCE" | "DIRECTOR";
  specificApproverId?: string;
  specificApprover?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  order: number;
  isRequired: boolean;
}

interface ApprovalSequence {
  id: string;
  name: string;
  description?: string;
  steps: ApprovalStep[];
  createdAt: string;
}

export default function ApprovalSequencesPage() {
  const [sequences, setSequences] = useState<ApprovalSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSequences = async () => {
      try {
        const response = await axiosInstance.get("/admin/approval-sequences");
        setSequences(response.data.approvalSequences || []);
      } catch (error) {
        console.error("Error fetching approval sequences:", error);
        toast.error("Failed to fetch approval sequences");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSequences();
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Approval Sequences"
          subtitle="Manage sequential approval workflows"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading approval sequences...</div>
        </div>
      </div>
    );
  }

  const getApproverLabel = (step: ApprovalStep) => {
    if (step.specificApprover) {
      return step.specificApprover.name;
    }
    return step.approverType.charAt(0) + step.approverType.slice(1).toLowerCase();
  };

  const getApproverTypeLabel = (type: string) => {
    switch (type) {
      case "MANAGER": return "Manager";
      case "FINANCE": return "Finance Team";
      case "DIRECTOR": return "Director";
      default: return type;
    }
  };

  return (
    <div>
      <PageHeader
        title="Approval Sequences"
        subtitle="Manage sequential approval workflows"
      />

      <div className="space-y-6">
        {sequences.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Approval Sequences</h3>
            <p className="text-sm text-slate-500 mb-6">
              Create approval sequences to define multi-step approval workflows for expenses.
            </p>
            <Link href="/admin/approval-sequences/create">
              <button className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 flex items-center gap-2 mx-auto">
                <Plus size={16} />
                Create First Sequence
              </button>
            </Link>
          </Card>
        ) : (
          sequences.map((sequence) => (
            <Card key={sequence.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{sequence.name}</h3>
                    {sequence.description && (
                      <p className="text-sm text-slate-500">{sequence.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/approval-sequences/edit/${sequence.id}`}>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                      <Edit size={16} />
                    </button>
                  </Link>
                  <span className="text-xs text-slate-400">
                    Created {new Date(sequence.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Approval Steps */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-3">
                  Approval Sequence
                </p>
                {sequence.steps
                  .sort((a, b) => a.order - b.order)
                  .map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {step.order}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            step.isRequired 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {getApproverLabel(step)}
                            {!step.isRequired && " (Optional)"}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({getApproverTypeLabel(step.approverType)})
                          </span>
                        </div>
                      </div>
                      {index < sequence.steps.length - 1 && (
                        <ChevronRight size={16} className="text-slate-300" />
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          ))
        )}

        <Link href="/admin/approval-sequences/create">
          <Card className="p-6 flex flex-col items-center justify-center text-center min-h-32 border-dashed border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center mb-3 transition-colors">
              <Plus size={20} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-slate-700 group-hover:text-amber-700 transition-colors">Create New Sequence</p>
            <p className="text-xs text-slate-400 mt-1">Define a sequential approval workflow</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
