"use client";

import { useState, useEffect } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Percent,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CreateApprovalRulePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ruleType: "PERCENTAGE" as "PERCENTAGE" | "SPECIFIC_APPROVER" | "HYBRID",
    percentageThreshold: 60,
    specificApproverId: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/admin/users");
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.ruleType === "PERCENTAGE" && !formData.percentageThreshold) {
        toast.error("Percentage threshold is required");
        setIsLoading(false);
        return;
      }

      if (formData.ruleType === "SPECIFIC_APPROVER" && !formData.specificApproverId) {
        toast.error("Specific approver is required");
        setIsLoading(false);
        return;
      }

      if (formData.ruleType === "HYBRID" && (!formData.percentageThreshold || !formData.specificApproverId)) {
        toast.error("Both percentage threshold and specific approver are required");
        setIsLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        ruleType: formData.ruleType,
        ...(formData.percentageThreshold && { percentageThreshold: formData.percentageThreshold }),
        ...(formData.specificApproverId && { specificApproverId: formData.specificApproverId }),
      };

      await axiosInstance.post("/admin/approval-rules", payload);
      toast.success("Approval rule created successfully");
      
      setFormData({
        name: "",
        description: "",
        ruleType: "PERCENTAGE",
        percentageThreshold: 60,
        specificApproverId: "",
      });
    } catch (error) {
      console.error("Error creating approval rule:", error);
      toast.error("Failed to create approval rule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/approval-rules"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Approval Rules
        </Link>
        <PageHeader
          title="Create Approval Rule"
          subtitle="Define the workflow, thresholds, and approver sequence for expense submissions."
        />
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <ShieldCheck className="text-slate-900" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Rule Configuration</h2>
                <p className="text-sm text-slate-400">Define the basic parameters for this approval rule</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rule Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Travel Expense Rule"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rule Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData(prev => ({ ...prev, ruleType: e.target.value as any }))}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white"
                  required
                >
                  <option value="PERCENTAGE">Percentage Based</option>
                  <option value="SPECIFIC_APPROVER">Specific Approver</option>
                  <option value="HYBRID">Hybrid (Percentage + Specific)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of this approval rule"
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800 resize-none"
              />
            </div>
          </Card>

          {/* Rule Type Configuration */}
          {formData.ruleType === "PERCENTAGE" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Percent className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Percentage Threshold</h3>
                  <p className="text-sm text-slate-400">Set the minimum approval percentage required</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Percentage Threshold (%) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percentageThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentageThreshold: parseInt(e.target.value) || 0 }))}
                  placeholder="60"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Expense will be approved when this percentage of total approvers have approved
                </p>
              </div>
            </Card>
          )}

          {formData.ruleType === "SPECIFIC_APPROVER" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <User className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Specific Approver</h3>
                  <p className="text-sm text-slate-400">Select a specific user who can auto-approve expenses</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Specific Approver <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.specificApproverId}
                  onChange={(e) => setFormData(prev => ({ ...prev, specificApproverId: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white"
                  required
                >
                  <option value="">Select specific approver...</option>
                  {users
                    .filter(user => ["FINANCE", "DIRECTOR"].includes(user.role))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  This user can approve any expense regardless of other approvals
                </p>
              </div>
            </Card>
          )}

          {formData.ruleType === "HYBRID" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Users className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Hybrid Rule</h3>
                  <p className="text-sm text-slate-400">Combine percentage threshold with specific approver</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Percentage Threshold (%) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentageThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentageThreshold: parseInt(e.target.value) || 0 }))}
                    placeholder="60"
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specific Approver <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.specificApproverId}
                    onChange={(e) => setFormData(prev => ({ ...prev, specificApproverId: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white"
                    required
                  >
                    <option value="">Select specific approver...</option>
                    {users
                      .filter(user => ["FINANCE", "DIRECTOR"].includes(user.role))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Expense will be approved if percentage threshold is met OR this specific approver approves
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/admin/approval-rules">
              <button
                type="button"
                className="text-sm px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="text-sm px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={15} />
              {isLoading ? "Creating Rule..." : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
