import { APP_CONFIG } from "../constants";

const BASE = APP_CONFIG.apiBaseUrl;

export const API_ENDPOINTS = {
  health: `${BASE}/health`,
  auth: {
    login: `${BASE}/api/auth/login`,
    me: `${BASE}/api/auth/me`,
    refresh: `${BASE}/api/auth/refresh`,
  },
  tows: {
    list: `${BASE}/api/tows`,
    detail: (id: string) => `${BASE}/api/tows/${id}`,
    updateStatus: (id: string) => `${BASE}/api/tows/${id}/status`,
    assignDriver: (id: string) => `${BASE}/api/tows/${id}/assign`,
  },
  drivers: {
    list: `${BASE}/api/drivers`,
    detail: (id: string) => `${BASE}/api/drivers/${id}`,
    verify: (id: string) => `${BASE}/api/drivers/${id}/verify`,
    status: (id: string) => `${BASE}/api/drivers/${id}/status`,
  },
  users: {
    list: `${BASE}/api/users`,
    detail: (id: string) => `${BASE}/api/users/${id}`,
    profile: `${BASE}/api/profile`,
  },
  vehicles: {
    list: `${BASE}/api/vehicles`,
    detail: (id: string) => `${BASE}/api/vehicles/${id}`,
    uploadImage: `${BASE}/api/vehicles/upload-image`,
  },
} as const;

