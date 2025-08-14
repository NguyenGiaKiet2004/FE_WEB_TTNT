// TypeScript declarations for api-config.js

export interface ApiConfig {
  AUTH_API: {
    BASE_URL: string;
    ENDPOINTS: {
      LOGIN: string;
      REGISTER: string;
    };
  };
  MAIN_API: {
    BASE_URL: string;
    ENDPOINTS: {
      AUTH_ME: string;
      DEPARTMENTS: string;
      EMPLOYEES: string;
      ATTENDANCE: string;
      DASHBOARD_STATS: string;
      ROLES: string;
      SYSTEM_CONFIGS: string;
    };
  };
}

export declare const API_CONFIG: ApiConfig;

export declare function getAuthApiUrl(endpoint: string): string;
export declare function getMainApiUrl(endpoint: string): string;

export declare function apiRequest(endpoint: string, options?: RequestInit): Promise<any>;
