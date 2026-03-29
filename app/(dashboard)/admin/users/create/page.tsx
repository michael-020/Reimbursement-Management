"use client";

import { Card, PageHeader } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roles = ["Employee", "Manager", "Finance", "Director"];

export default function CreateUserPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingManagers, setIsFetchingManagers] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    managerId: "",
  });

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axiosInstance.get("/admin/managers");
        setManagers(response.data.managers);
      } catch (error) {
        console.error("Error fetching managers:", error);
        let errorMessage = "Failed to fetch managers";
        if (error instanceof AxiosError && error.response?.data?.msg) {
          errorMessage = error.response.data.msg as string;
        }
        toast.error(errorMessage);
      } finally {
        setIsFetchingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "role") {
      setSelectedRole(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.role) {
      toast.error("Role is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(),
        managerId: formData.managerId || undefined,
      };

      await axiosInstance.post("/add-users", payload);
      toast.success("User created successfully");
      router.push("/admin/users");
    } catch (error) {
      console.error("Error creating user:", error);
      let errorMessage = "Failed to create user";
      if (error instanceof AxiosError && error.response?.data?.msg) {
        errorMessage = error.response.data.msg as string;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>
        <PageHeader
          title="Add New User"
          subtitle="Create a new user account and assign their role and manager."
        />
      </div>

      <div className="max-w-2xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-200">
              <UserPlus size={18} className="text-slate-900" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">User Details</p>
              <p className="text-sm text-slate-400">Fill in the information below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Jordan Smith"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all placeholder-slate-300 ${
                  errors.name
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100 text-red-800"
                    : "border-slate-200 focus:border-amber-400 focus:ring-amber-100 text-slate-800"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="jordan@company.com"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  name="role"
                  value={selectedRole}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white cursor-pointer"
                >
                  <option value="">Select a role...</option>
                  {roles.map((r) => (
                    <option key={r} value={r.toLowerCase()}>{r}</option>
                  ))}
                </select>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reporting Manager {selectedRole !== "admin" && <span className="text-red-400">*</span>}
                </label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleInputChange}
                  disabled={selectedRole === "admin" || isFetchingManagers}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">Select manager...</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
                </select>
                {errors.managerId && <p className="text-xs text-red-500 mt-1">{errors.managerId}</p>}
                {!isLoadingManagers && managers.length === 0 && selectedRole !== "admin" && (
                  <p className="text-xs text-amber-500 mt-1">No managers available. Please create a manager first.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/admin/users"
                className="text-sm px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="text-sm px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-colors shadow-sm shadow-amber-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus size={15} />
                {isLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
          </form>
        </Card>
      </div>
    </div>
  );
}