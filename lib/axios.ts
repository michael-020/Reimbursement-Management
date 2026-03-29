import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
    // Get token from cookies (client-side)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split('=')[1];
      return '';
    };
    
    const token = getCookie('authToken');
    
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return config;
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);