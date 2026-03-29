'use client';

import { useEffect, useState } from 'react';
import { Card, PageHeader } from "@/components/ui/card";
import { UserPlus, Search } from "lucide-react";
import Link from "next/link";
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  manager?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-amber-100 text-amber-800",
  MANAGER: "bg-sky-100 text-sky-800",
  EMPLOYEE: "bg-slate-100 text-slate-700",
  FINANCE: "bg-green-100 text-green-800",
  DIRECTOR: "bg-purple-100 text-purple-800",
};

export default function AdminDashboard() {
  const { authUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingPasswordFor, setSendingPasswordFor] = useState<string | null>(null);
  const [editingManager, setEditingManager] = useState<Record<string, string>>({});
  const [assigningManagerFor, setAssigningManagerFor] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch admin data if user is actually an admin
      if (!authUser || authUser.role !== 'ADMIN') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [usersResponse, managersResponse] = await Promise.all([
          axiosInstance.get('/admin/users'),
          axiosInstance.get('/admin/managers'),
        ]);
        setUsers(usersResponse.data.users);
        setManagers(managersResponse.data.managers);
      } catch (error) {
        console.error('Error fetching data:', error);
        let errorMessage = 'Failed to fetch data';
        if (error instanceof AxiosError && error.response?.data?.msg) {
          errorMessage = error.response.data.msg as string;
        }
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  const handleSendPassword = async (userId: string, userEmail: string) => {
    setSendingPasswordFor(userId);
    try {
      await axiosInstance.post(`/admin/send-password/${userId}`);
      toast.success(`Password sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending password:', error);
      let errorMessage = 'Failed to send password';
      if (error instanceof AxiosError && error.response?.data?.msg) {
        errorMessage = error.response.data.msg as string;
      }
      toast.error(errorMessage);
    } finally {
      setSendingPasswordFor(null);
    }
  };

  const handleAssignManager = async (userId: string) => {
    const managerId = editingManager[userId];
    if (!managerId) {
      toast.error('Please select a manager');
      return;
    }

    setAssigningManagerFor(userId);
    try {
      await axiosInstance.post('/admin/assign-manager', {
        userId,
        managerId,
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              manager: managers.find(m => m.id === managerId) 
                ? { id: managerId, name: managers.find(m => m.id === managerId)!.name }
                : null 
            }
          : user
      ));
      
      // Clear the editing state
      setEditingManager(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      
      toast.success('Manager assigned successfully');
    } catch (error) {
      console.error('Error assigning manager:', error);
      let errorMessage = 'Failed to assign manager';
      if (error instanceof AxiosError && error.response?.data?.msg) {
        errorMessage = error.response.data.msg as string;
      }
      toast.error(errorMessage);
    } finally {
      setAssigningManagerFor(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!authUser || authUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} total users in the system`}
        action={
          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200"
          >
            <UserPlus size={16} />
            Add User
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex-1 max-w-sm">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            />
          </div>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="">All Roles</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Manager</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.filter(user => !selectedRole || user.role === selectedRole).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.filter(user => !selectedRole || user.role === selectedRole).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Select 
                          value={editingManager[user.id] || ''} 
                          onValueChange={(value) => setEditingManager(prev => ({ ...prev, [user.id]: value }))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder={user.manager?.name || 'Select manager'} />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.filter(manager => manager.id !== user.id).map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {editingManager[user.id] && (
                          <button
                            onClick={() => handleAssignManager(user.id)}
                            disabled={assigningManagerFor === user.id}
                            className="bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {assigningManagerFor === user.id ? 'Assigning...' : 'Assign'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSendPassword(user.id, user.email)}
                        disabled={sendingPasswordFor === user.id}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingPasswordFor === user.id ? 'Sending...' : 'Send Password'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}