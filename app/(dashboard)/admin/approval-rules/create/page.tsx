"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ShieldCheck,
  Users,
  Percent,
  User,
} from "lucide-react";
import Link from "next/link";

type ApproverType = "manager" | "specific" | "percentage";

interface ApproverStep {
  id: number;
  type: ApproverType;
  specificUser?: string;
  percentage?: number;
}

const availableApprovers = [
  "Morgan Lee (Manager)",
  "Sam Wilson (Manager)",
  "Alex Carter (Admin)",
  "Finance Team",
  "HR Head",
  "Department Head",
  "CFO",
  "CEO",
];

const categories = ["Travel", "Meals", "Equipment", "Software", "Training", "Office Supplies", "Marketing", "Other"];

export default function CreateApprovalRulePage() {
  const [isManagerRequired, setIsManagerRequired] = useState(true);
  const [approverSteps, setApproverSteps] = useState<ApproverStep[]>([
    { id: 1, type: "manager" },
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const nextId = approverSteps.length > 0 ? Math.max(...approverSteps.map((s) => s.id)) + 1 : 1;

  const addStep = () => {
    setApproverSteps((prev) => [...prev, { id: nextId, type: "specific", specificUser: "" }]);
  };

  const removeStep = (id: number) => {
    setApproverSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStep = (id: number, updates: Partial<ApproverStep>) => {
    setApproverSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">

          {/* Section 1: Basic Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <ShieldCheck size={15} className="text-slate-900" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
                <p className="text-xs text-slate-400">Name and describe this rule</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rule Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Employee Expense Rule"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe when this rule applies..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Thresholds */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <Percent size={15} className="text-sky-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Amount Thresholds</h2>
                <p className="text-xs text-slate-400">Set min/max expense amount this rule applies to</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full text-sm border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    className="w-full text-sm border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Percentage input */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Approval Percentage Required (%)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    defaultValue="100"
                    className="w-full accent-amber-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    defaultValue={100}
                    min={1}
                    max={100}
                    className="w-24 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-center font-semibold text-slate-800"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Percentage of approvers who must approve for the rule to pass</p>
            </div>
          </Card>

          {/* Section 3: Manager Requirement */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Users size={15} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manager Requirement</h2>
                  <p className="text-xs text-slate-400">Make manager approval mandatory as the first step</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setIsManagerRequired((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isManagerRequired ? "bg-amber-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform ${
                    isManagerRequired ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isManagerRequired && (
              <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                  <ShieldCheck size={15} className="text-amber-600" />
                  Direct manager will be automatically added as Step 1 approver
                </p>
              </div>
            )}
          </Card>

          {/* Section 4: Approval Steps */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User size={15} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Approval Sequence</h2>
                  <p className="text-xs text-slate-400">Add approvers in the order they should review</p>
                </div>
              </div>
              <button
                onClick={addStep}
                className="flex items-center gap-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={14} />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {isManagerRequired && (
                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <GripVertical size={16} className="text-amber-300" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">Direct Manager</p>
                    <p className="text-xs text-amber-600">Auto-added · Cannot be removed</p>
                  </div>
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Required</span>
                </div>
              )}

              {approverSteps.map((step, index) => {
                const stepNum = isManagerRequired ? index + 2 : index + 1;
                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {stepNum}
                    </div>
                    <GripVertical size={16} className="text-slate-300 mt-1 cursor-grab" />

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Approver Type */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Approver Type</label>
                        <select
                          value={step.type}
                          onChange={(e) => updateStep(step.id, { type: e.target.value as ApproverType })}
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white"
                        >
                          <option value="manager">Reporting Manager</option>
                          <option value="specific">Specific Approver</option>
                          <option value="percentage">Percentage Based</option>
                        </select>
                      </div>

                      {/* Conditional field */}
                      {step.type === "specific" && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Approver</label>
                          <select
                            value={step.specificUser}
                            onChange={(e) => updateStep(step.id, { specificUser: e.target.value })}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white"
                          >
                            <option value="">Choose an approver...</option>
                            {availableApprovers.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {step.type === "percentage" && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Percentage Required</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={step.percentage ?? 50}
                              onChange={(e) => updateStep(step.id, { percentage: Number(e.target.value) })}
                              min={1}
                              max={100}
                              className="w-full text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-800"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                          </div>
                        </div>
                      )}

                      {step.type === "manager" && (
                        <div className="flex items-end">
                          <div className="text-xs text-slate-400 p-2.5 bg-slate-50 rounded-lg border border-slate-200 w-full">
                            Resolved automatically from org chart
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeStep(step.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors mt-0.5 p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}

              {approverSteps.length === 0 && !isManagerRequired && (
                <div className="text-center py-10 text-slate-400">
                  <Users size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm">No approvers added yet. Click "Add Step" to begin.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Section 5: Categories */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Applicable Categories</h2>
            <p className="text-xs text-slate-400 mb-5">Select which expense categories this rule applies to</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-sm px-4 py-2 rounded-xl font-medium transition-all border ${
                    selectedCategories.includes(cat)
                      ? "bg-amber-500 border-amber-500 text-slate-900 shadow-sm shadow-amber-200"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar Preview */}
        <div className="space-y-5">
          {/* Sequence Preview */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={15} className="text-amber-500" />
              Approval Flow Preview
            </h3>
            <div className="space-y-2">
              {isManagerRequired && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="flex-1 text-sm font-medium text-slate-700">Direct Manager</div>
                </div>
              )}
              {approverSteps.map((step, i) => {
                const num = isManagerRequired ? i + 2 : i + 1;
                const label =
                  step.type === "manager"
                    ? "Reporting Manager"
                    : step.type === "specific"
                    ? step.specificUser || "Not selected"
                    : `${step.percentage ?? 50}% of approvers`;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    {i > 0 || isManagerRequired ? (
                      <ChevronRight size={12} className="text-slate-300 ml-2" />
                    ) : null}
                    {!(i > 0 || isManagerRequired) && <div className="w-6" />}
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {num}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-600 truncate">{label}</div>
                  </div>
                );
              })}
              {approverSteps.length === 0 && !isManagerRequired && (
                <p className="text-xs text-slate-400 text-center py-4">No steps defined yet</p>
              )}
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="p-6 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Rule Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Steps</span>
                <span className="font-bold text-slate-900">{approverSteps.length + (isManagerRequired ? 1 : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Manager Required</span>
                <span className={`font-bold ${isManagerRequired ? "text-emerald-600" : "text-slate-400"}`}>
                  {isManagerRequired ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categories</span>
                <span className="font-bold text-slate-900">
                  {selectedCategories.length === 0 ? "All" : selectedCategories.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm py-3 rounded-xl transition-colors shadow-sm shadow-amber-200 flex items-center justify-center gap-2">
              <ShieldCheck size={15} />
              Save Rule
            </button>
            <Link href="/admin/approval-rules">
              <button className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm py-3 rounded-xl transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}