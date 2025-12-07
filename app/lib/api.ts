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

// Request queue for handling concurrent 401s during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// Response interceptor with proper refresh token queueing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Already refreshing - queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token via Remix action
        // In Remix architecture, refresh should happen server-side
        // This is a fallback - ideally use loader/action pattern
        await fetch('/api/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Session expired - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
