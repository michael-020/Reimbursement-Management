const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic fetch function with error handling
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Receipt/Expense API functions
export const receiptsApi = {
  // Get all receipts with optional filters
  getAll: (params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return apiFetch(`/api/receipts?${searchParams.toString()}`);
  },

  // Get a single receipt by ID
  getById: (id: string) => apiFetch(`/api/receipts/${id}`),

  // Create a new receipt
  create: (data: {
    amountOriginal?: number;
    currencyOriginal?: string;
    amountConverted: number;
    currencyCompany?: string;
    conversionRate?: number;
    category: string;
    description: string;
    expenseDate: string;
    receiptUrl?: string;
  }) => apiFetch('/api/receipts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update receipt status (approve/reject)
  updateStatus: (id: string, action: 'approve' | 'reject', comment?: string) => 
    apiFetch(`/api/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action, comment }),
    }),
};

// User API functions
export const userApi = {
  // Get current user info
  getCurrent: () => apiFetch('/api/auth/me'),
};

// Types based on the API responses
export interface Receipt {
  id: string;
  employee: string;
  employeeId?: string;
  category: string;
  amount: string;
  amountOriginal?: number;
  currencyOriginal?: string;
  amountConverted?: number;
  currencyCompany?: string;
  conversionRate?: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  manager?: string;
  receiptUrl?: string;
  createdAt: string;
  approvals?: Array<{
    id: string;
    approver: string;
    approverRole: string;
    status: string;
    order: number;
    approvedAt?: string;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  employees?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface PaginatedResponse<T> {
  data?: T[];
  receipts?: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
