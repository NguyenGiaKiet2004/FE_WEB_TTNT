import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-config';

// Types
interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'super_admin' | 'hr_manager' | 'employee';
  departmentId: number | null;
  phoneNumber: string | null;
  createdAt: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  departmentId?: number;
  phoneNumber?: string;
  role?: 'super_admin' | 'hr_manager' | 'employee';
}

// Authentication hook
export const useAuth = () => {
  return useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      // Check if we have any stored auth data first
      const storedAuth = localStorage.getItem('auth-data');
      if (!storedAuth) {
        // No stored auth, return not authenticated without API call
        return { authenticated: false, user: null };
      }
      
      try {
        // Try to get fresh data from server using main API (session-based)
        const response = await apiRequest('/auth/me');
        return response;
      } catch (error: any) {
        // Silently handle 401 (not authenticated) - this is expected
        if (error.status === 401) {
          // Clear invalid stored data
          localStorage.removeItem('auth-data');
          return { authenticated: false, user: null };
        }
        // Re-throw other errors
        throw error;
      }
    },
    retry: false, // Disable retries completely
    retryOnMount: false, // Don't retry on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: !!localStorage.getItem('auth-data'), // Enable if we have stored auth data
    // Return stored data immediately while fetching fresh data
    initialData: () => {
      const stored = localStorage.getItem('auth-data');
      return stored ? JSON.parse(stored) : { authenticated: false, user: null };
    },
  });
};

// Extract authentication state
export const useAuthState = () => {
  const { data, isLoading, error } = useAuth();
  
  return {
    isAuthenticated: data?.authenticated || false,
    user: data?.user || null,
    isLoading,
    error,
    role: data?.user?.role || null,
    departmentId: data?.user?.departmentId || null
  };
};

// Login hook
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Use main API for login (session-based)
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response;
    },
    onSuccess: (data) => {
      // Store JWT token and user data
      const authData = { 
        authenticated: true, 
        user: data.user,
        token: data.token // Store JWT token
      };
      localStorage.setItem('auth-data', JSON.stringify(authData));
      
      // Set auth data immediately after successful login
      queryClient.setQueryData(['/api/auth/me'], authData);
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });
};

// Logout hook
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Use main API for logout (session-based)
      const response = await apiRequest('/auth/logout', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      // Clear localStorage
      localStorage.removeItem('auth-data');
      
      // Clear auth data
      queryClient.setQueryData(['/api/auth/me'], { authenticated: false, user: null });
    },
  });
};