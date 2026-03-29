"use client";

import { useState, useEffect } from "react";
import { receiptsApi, Receipt, PaginatedResponse } from "../api";

interface UseExpensesOptions {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchExpenses = async (fetchOptions?: Partial<UseExpensesOptions>) => {
    setLoading(true);
    setError(null);

    try {
      const finalOptions = { ...options, ...fetchOptions };
      const response = await receiptsApi.getAll(finalOptions) as PaginatedResponse<Receipt>;
      
      if (response.receipts) {
        setExpenses(response.receipts);
      } else if (response.data) {
        setExpenses(response.data);
      }
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateExpenseStatus = async (id: string, action: 'approve' | 'reject', comment?: string) => {
    try {
      await receiptsApi.updateStatus(id, action, comment);
      // Refresh the expenses list after updating
      await fetchExpenses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
      return false;
    }
  };

  const createExpense = async (data: Parameters<typeof receiptsApi.create>[0]) => {
    try {
      await receiptsApi.create(data);
      // Refresh the expenses list after creating
      await fetchExpenses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
      return false;
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchExpenses();
    }
  }, [options.status, options.category, options.page, options.limit]);

  return {
    expenses,
    loading,
    error,
    pagination,
    fetchExpenses,
    updateExpenseStatus,
    createExpense,
    refetch: () => fetchExpenses(),
  };
}
