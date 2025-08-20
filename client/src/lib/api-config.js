// API Configuration
export const API_CONFIG = {
  // Main Backend API (Port 3001) - Cho tất cả chức năng
  MAIN_API: {
    BASE_URL: 'http://localhost:3000/api',
    ENDPOINTS: {
      AUTH_LOGIN: '/auth/login',
      AUTH_REGISTER: '/auth/register',
      AUTH_ME: '/auth/me',
      AUTH_LOGOUT: '/auth/logout',
      DEPARTMENTS: '/departments',
      EMPLOYEES: '/employees',
      ATTENDANCE: '/attendance',
      DASHBOARD_STATS: '/dashboard/stats',
      ROLES: '/roles',
      SYSTEM_CONFIGS: '/system/configs',
    }
  }
};

// Helper functions
export const getMainApiUrl = (endpoint) => {
  return `${API_CONFIG.MAIN_API.BASE_URL}${endpoint}`;
};

// API request functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = getMainApiUrl(endpoint);
  
  // Debug: Check auth data
  const authData = localStorage.getItem('auth-data');
  const parsedAuthData = authData ? JSON.parse(authData) : {};
  const token = parsedAuthData.token || null;
  const user = parsedAuthData.user || {};
  
  console.log('🔐 API Request Debug:', { 
    endpoint, 
    url, 
    hasToken: !!token,
    userId: user.userId || user.user_id,
    userRole: user.role
  });
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 
        'Authorization': `Bearer ${token}`,
        'user-id': user.userId || user.user_id
      } : {}),
      ...options.headers,
    },
  });
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};
