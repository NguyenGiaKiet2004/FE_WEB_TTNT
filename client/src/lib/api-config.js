// API Configuration
export const API_CONFIG = {
  // Main Backend API (Port 3001) - Cho tất cả chức năng
  MAIN_API: {
    BASE_URL: 'http://localhost:3001/api',
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
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Session-based authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
