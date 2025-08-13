import { QueryClient } from '@tanstack/react-query';

// Custom error interface
interface ApiError extends Error {
  status?: number;
  data?: any;
}

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Helper function for API requests
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session management
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw error with response data for better error handling
    const error = new Error(data.message || `HTTP error! status: ${response.status}`) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Query function for React Query
export const getQueryFn = async ({ queryKey }: { queryKey: string[] }) => {
  const url = queryKey[0];
  return apiRequest(url);
};

// Create and configure QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});