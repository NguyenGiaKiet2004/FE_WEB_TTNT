import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, LoginRequest } from "@shared/schema";

interface AuthResponse {
  authenticated: boolean;
  user?: User;
  message?: string;
}

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const authData = data as AuthResponse | undefined;

  return {
    user: authData?.user,
    isLoading,
    isAuthenticated: authData?.authenticated || false,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.authenticated) {
        // Invalidate auth query to refresh user data
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return await response.json();
    },
    onSuccess: () => {
      // Clear all queries and redirect
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}