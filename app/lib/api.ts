// Client-side API client for Remix
// NOTE: In Remix, prefer using useFetcher/useActionData instead of direct API calls
// This file is only for special cases (e.g., real-time features, client-side mutations)

import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined'
  ? window.ENV?.API_URL || 'http://localhost:8000'
  : 'http://localhost:8000';

/**
 * Client API instance - Uses cookies for authentication
 * NO localStorage! Cookies are automatically sent with withCredentials: true
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies automatically
});

// Simple response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, redirect to login (session expired)
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API (Client-side - for login/register forms only)
 * These methods return data to be handled by Remix actions
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    return api.post('/api/v1/auth/login/', { email, password });
  },

  register: async (data: any) => {
    return api.post('/api/v1/auth/register/', data);
  },

  logout: async () => {
    return api.post('/api/v1/auth/logout/');
  },

  me: async () => {
    return api.get('/api/v1/auth/me/');
  },
};

/**
 * Jobs API (Client-side - prefer using useFetcher instead)
 */
export const jobsAPI = {
  list: async (params?: any) => {
    return api.get('/api/v1/jobs/', { params });
  },

  get: async (id: string) => {
    return api.get(`/api/v1/jobs/${id}/`);
  },

  search: async (query: string, filters?: any) => {
    return api.get('/api/v1/jobs/search/', {
      params: { q: query, ...filters },
    });
  },
};

/**
 * Applications API (Client-side)
 */
export const applicationsAPI = {
  create: async (data: any) => {
    return api.post('/api/v1/applications/', data);
  },

  list: async () => {
    return api.get('/api/v1/applications/');
  },

  get: async (id: string) => {
    return api.get(`/api/v1/applications/${id}/`);
  },

  update: async (id: string, data: any) => {
    return api.patch(`/api/v1/applications/${id}/`, data);
  },

  withdraw: async (id: string) => {
    return api.post(`/api/v1/applications/${id}/withdraw/`);
  },
};

/**
 * Resumes API (Client-side)
 */
export const resumesAPI = {
  list: async () => {
    return api.get('/api/v1/resumes/');
  },

  get: async (id: string) => {
    return api.get(`/api/v1/resumes/${id}/`);
  },

  create: async (data: FormData) => {
    return api.post('/api/v1/resumes/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (id: string, data: FormData) => {
    return api.patch(`/api/v1/resumes/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: async (id: string) => {
    return api.delete(`/api/v1/resumes/${id}/`);
  },

  download: (id: string) => {
    return `${API_BASE_URL}/api/v1/resumes/${id}/download/`;
  },
};

/**
 * Chats API (Client-side)
 */
export const chatsAPI = {
  listConversations: async () => {
    return api.get('/api/v1/chats/conversations/');
  },

  getConversation: async (id: string) => {
    return api.get(`/api/v1/chats/conversations/${id}/`);
  },

  sendMessage: async (conversationId: string, message: string) => {
    return api.post(`/api/v1/chats/conversations/${conversationId}/messages/`, {
      message,
    });
  },
};

/**
 * Notifications API (Client-side)
 */
export const notificationsAPI = {
  list: async (params?: { unread_only?: boolean }) => {
    return api.get('/api/v1/notifications/', { params });
  },

  markAsRead: async (id: string) => {
    return api.post(`/api/v1/notifications/${id}/mark-read/`);
  },

  markAllAsRead: async () => {
    return api.post('/api/v1/notifications/mark-all-read/');
  },
};
