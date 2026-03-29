// Managers API functions
export const managersApi = {
  // Get all managers
  getAll: async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${API_BASE_URL}/api/admin/managers`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
