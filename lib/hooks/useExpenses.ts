"use client";

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

interface Expense {
  id: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeRole?: string;
  amountOriginal?: number;
  currencyOriginal?: string;
  amountConverted?: number;
  currencyCompany?: string;
  conversionRate?: number;
  amount: string;
  category: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  createdAt: string;
  approvals?: Array<{
    id: string;
    status: string;
    approverName: string;
    approverEmail: string;
    approverRole: string;
    createdAt: string;
  }>;
  company?: {
    id: string;
    name: string;
    currency: string;
  };
  canApprove?: boolean;
}

interface CreateExpenseData {
  amountOriginal: number;
  currencyOriginal: string;
  category: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
}

interface UseExpensesOptions {
  autoFetch?: boolean;
}

export function useExpenses({ autoFetch = false }: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authUser } = useAuthStore();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use different endpoints based on user role
      let endpoint;
      if (authUser?.role === 'ADMIN') {
        endpoint = '/admin/expenses';
      } else {
        endpoint = '/expenses';
      }

      const response = await axiosInstance.get(endpoint);
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      let errorMessage = 'Failed to fetch expenses';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (data: CreateExpenseData): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/expenses', data);
      
      // Add the new expense to the list
      if (response.data.expense) {
        setExpenses(prev => [response.data.expense, ...prev]);
      }
      
      toast.success('Expense submitted successfully');
      // Extract of actual expense ID from the formatted ID (e.g., EXP-123456 -> 123456)
      const expenseId = id.replace('EXP-', '');
      
      const response = await fetch(`/api/approvals/${expenseId}`, {
        method: 'POST',
        body: JSON.stringify({ action, comment }),
      });
      
      // Refetch expenses to get updated data
      await fetchExpenses();
      
      return true;
    } catch (err) {
      console.error('Error creating expense:', err);
      let errorMessage = 'Failed to create expense';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error updating expense status:", err);
      return false;
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: 'APPROVED' | 'REJECTED'): Promise<boolean> => {
    try {
      await axiosInstance.post(`/expenses/${expenseId}/approve`, { status });
      
      // Update the expense in the list
      setExpenses(prev => prev.map(exp => 
        exp.id === expenseId 
          ? { ...exp, status: status.toLowerCase() as 'approved' | 'rejected' }
          : exp
      ));
      
      toast.success(`Expense ${status.toLowerCase()} successfully`);
      return true;
    } catch (err) {
      console.error('Error updating expense status:', err);
      let errorMessage = `Failed to ${status.toLowerCase()} expense`;
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    if (autoFetch && authUser) {
      fetchExpenses();
    }
  }, [autoFetch, authUser]);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpenseStatus,
  };
}
