// Server-side API client for Remix loaders/actions
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8000';

/**
 * Auth API (Server-side - no token needed for register/login)
 */
export const authAPI = {
  register: async (data: {
    email: string;
    full_name: string;
    password: string;
    user_type: string;
    phone_number?: string;
  }) => {
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return client.post('/api/v1/auth/register/', data);
  },

  login: async (email: string, password: string) => {
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return client.post('/api/v1/auth/login/', { email, password });
  },
};

/**
 * Create API client with authentication token
 */
export function createAPIClient(accessToken: string) {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return client;
}

/**
 * Applications API (Server-side)
 */
export const applicationsAPI = {
  list: async (accessToken: string, params?: { limit?: number; offset?: number }) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/applications/', { params });
  },

  get: async (accessToken: string, id: string) => {
    const client = createAPIClient(accessToken);
    return client.get(`/api/v1/applications/${id}/`);
  },

  getStats: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/applications/stats/');
  },
};

/**
 * Jobs API (Server-side)
 */
export const jobsAPI = {
  list: async (accessToken: string, params?: any) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/jobs/', { params });
  },

  get: async (accessToken: string, id: string) => {
    const client = createAPIClient(accessToken);
    return client.get(`/api/v1/jobs/${id}/`);
  },

  getSaved: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/jobs/saved/');
  },
};

/**
 * Chats API (Server-side)
 */
export const chatsAPI = {
  list: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/chats/conversations/');
  },

  getUnreadCount: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/chats/unread-count/');
  },
};

/**
 * Notifications API (Server-side)
 */
export const notificationsAPI = {
  list: async (accessToken: string, params?: { unread_only?: boolean }) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/notifications/', { params });
  },

  getUnreadCount: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/notifications/unread-count/');
  },
};

/**
 * Resumes API (Server-side)
 */
export const resumesAPI = {
  list: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/api/v1/resumes/');
  },
};
