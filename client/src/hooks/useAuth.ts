import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

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
      const response = await apiRequest('/api/auth/me');
      return response;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response;
    },
    onSuccess: (data) => {
      // Set auth data immediately after successful login
      if (data.authenticated) {
        queryClient.setQueryData(['/api/auth/me'], data);
      }
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
      const response = await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      // Clear auth data
      queryClient.setQueryData(['/api/auth/me'], { authenticated: false, user: null });
    },
  });
};