// Server-side API client for Remix loaders/actions
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8000/api/v1';

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
    return client.get('/applications/', { params });
  },

  get: async (accessToken: string, id: string) => {
    const client = createAPIClient(accessToken);
    return client.get(`/applications/${id}/`);
  },

  getStats: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/applications/stats/');
  },
};

/**
 * Jobs API (Server-side)
 */
export const jobsAPI = {
  list: async (accessToken: string, params?: any) => {
    const client = createAPIClient(accessToken);
    return client.get('/jobs/', { params });
  },

  get: async (accessToken: string, id: string) => {
    const client = createAPIClient(accessToken);
    return client.get(`/jobs/${id}/`);
  },

  getSaved: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/jobs/saved/');
  },
};

/**
 * Chats API (Server-side)
 */
export const chatsAPI = {
  list: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/chats/conversations/');
  },

  getUnreadCount: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/chats/unread-count/');
  },
};

/**
 * Notifications API (Server-side)
 */
export const notificationsAPI = {
  list: async (accessToken: string, params?: { unread_only?: boolean }) => {
    const client = createAPIClient(accessToken);
    return client.get('/notifications/', { params });
  },

  getUnreadCount: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/notifications/unread-count/');
  },
};

/**
 * Resumes API (Server-side)
 */
export const resumesAPI = {
  list: async (accessToken: string) => {
    const client = createAPIClient(accessToken);
    return client.get('/resumes/');
  },
};
