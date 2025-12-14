// API client utility functions
const API_BASE = '/api';

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Make authenticated API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name?: string) =>
    apiRequest<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
};

// Expense APIs
export const expenseApi = {
  getAll: (params?: { startDate?: string; endDate?: string; categoryId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);
    if (params?.categoryId) queryParams.set('categoryId', params.categoryId);
    const query = queryParams.toString();
    return apiRequest<{ expenses: any[] }>(`/expenses${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiRequest<{ expense: any }>(`/expenses/${id}`),
  create: (data: { amount: number; description?: string; date?: string; categoryId: string }) =>
    apiRequest<{ expense: any }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { amount?: number; description?: string; date?: string; categoryId?: string }) =>
    apiRequest<{ expense: any }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};

// Category APIs
export const categoryApi = {
  getAll: () => apiRequest<{ categories: any[] }>('/categories'),
  create: (data: { name: string; color?: string }) =>
    apiRequest<{ category: any }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: (period: 'week' | 'month' = 'month') =>
    apiRequest<{
      totalExpenses: number;
      currency: string;
      categoryBreakdown: any[];
      dailyData: { [key: string]: number };
      period: string;
    }>(`/dashboard?period=${period}`),
};

// Export API
export const exportApi = {
  getReport: (startDate: string, endDate: string) =>
    apiRequest<{
      expenses: any[];
      total: number;
      currency: string;
      startDate: string;
      endDate: string;
      userName: string;
    }>(`/export?startDate=${startDate}&endDate=${endDate}`),
};

// User API
export const userApi = {
  updateCurrency: (currency: string) =>
    apiRequest<{ user: any }>('/user/currency', {
      method: 'PUT',
      body: JSON.stringify({ currency }),
    }),
};
