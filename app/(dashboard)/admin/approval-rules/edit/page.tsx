"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Approver = {
  id: number;
  name: string;
  required: boolean;
};

const users = ["John", "Mitchell", "Andreas", "Sarah", "Finance", "Director"];

export default function DefaultApprovalRulePage() {
  const [ruleName, setRuleName] = useState("Default Expense Rule");
  const [isManagerApprover, setIsManagerApprover] = useState(true);
  const [isSequential, setIsSequential] = useState(true);
  const [minApprovalPercent, setMinApprovalPercent] = useState(100);

  const [approvers, setApprovers] = useState<Approver[]>([
    { id: 1, name: "John", required: true },
    { id: 2, name: "Mitchell", required: false },
    { id: 3, name: "Andreas", required: false },
  ]);

  const toggleRequired = (id: number) => {
    setApprovers((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, required: !a.required } : a
      )
    );
  };

  return (
    <div>
      <Link href="/admin" className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <ArrowLeft size={14} />
        Back
      </Link>

      <PageHeader
        title="Default Approval Rule"
        subtitle="Configure the default approval flow for your company"
      />

      <Card className="p-6 space-y-6">

        {/* Rule Name */}
        <div>
          <label className="font-semibold text-sm">Rule Name</label>
          <input
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Manager Toggle */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">Is Manager First Approver?</span>
          <input
            type="checkbox"
            checked={isManagerApprover}
            onChange={() => setIsManagerApprover(!isManagerApprover)}
          />
        </div>

        {/* Approvers List */}
        <div>
          <h3 className="font-semibold mb-2">Approvers</h3>

          {approvers.map((a, index) => (
            <div key={a.id} className="flex justify-between items-center border p-2 rounded mb-2">
              <span>{index + 1}. {a.name}</span>

              <div className="flex items-center gap-2">
                <label className="text-sm">Required</label>
                <input
                  type="checkbox"
                  checked={a.required}
                  onChange={() => toggleRequired(a.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sequence Toggle */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">Follow Sequence?</span>
          <input
            type="checkbox"
            checked={isSequential}
            onChange={() => setIsSequential(!isSequential)}
          />
        </div>

        {/* Percentage Rule */}
        <div>
          <label className="font-semibold text-sm">
            Minimum Approval Percentage
          </label>
          <input
            type="number"
            value={minApprovalPercent}
            onChange={(e) => setMinApprovalPercent(Number(e.target.value))}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Save Button */}
        <button className="w-full bg-yellow-500 p-3 rounded font-semibold flex items-center justify-center gap-2">
          <ShieldCheck size={16} />
          Save Default Rule
        </button>
      </Card>
    </div>
  );
}