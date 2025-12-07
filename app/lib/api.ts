import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.onetop.com' 
  : 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Services
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login/', { email, password }),
  
  register: (data: any) =>
    api.post('/api/v1/auth/register/', data),
  
  logout: () =>
    api.post('/api/v1/auth/logout/'),
  
  getProfile: () =>
    api.get('/api/v1/auth/me/'),
};

export const jobsAPI = {
  list: (params?: any) =>
    api.get('/api/v1/jobs/', { params }),
  
  get: (id: string) =>
    api.get(`/api/v1/jobs/${id}/`),
  
  create: (data: any) =>
    api.post('/api/v1/jobs/', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/v1/jobs/${id}/`, data),
  
  delete: (id: string) =>
    api.delete(`/api/v1/jobs/${id}/`),
  
  search: (query: string, filters?: any) =>
    api.get('/api/v1/jobs/search/', { params: { q: query, ...filters } }),
};

export const applicationsAPI = {
  list: () =>
    api.get('/api/v1/applications/'),
  
  create: (data: any) =>
    api.post('/api/v1/applications/', data),
  
  get: (id: string) =>
    api.get(`/api/v1/applications/${id}/`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/v1/applications/${id}/`, { status }),
  
  downloadCV: (id: string) =>
    api.get(`/api/v1/media/application/${id}/download/`, {
      responseType: 'blob',
    }),
};

export const resumeAPI = {
  list: () =>
    api.get('/api/v1/resumes/'),
  
  create: (formData: FormData) =>
    api.post('/api/v1/resumes/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  get: (id: string) =>
    api.get(`/api/v1/resumes/${id}/`),
  
  update: (id: string, formData: FormData) =>
    api.put(`/api/v1/resumes/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  delete: (id: string) =>
    api.delete(`/api/v1/resumes/${id}/`),
  
  download: (id: string) =>
    api.get(`/api/v1/media/resume/${id}/download/`, {
      responseType: 'blob',
    }),
};

export const companiesAPI = {
  list: (params?: any) =>
    api.get('/api/v1/companies/', { params }),
  
  get: (id: string) =>
    api.get(`/api/v1/companies/${id}/`),
};

export const chatAPI = {
  getConversations: () =>
    api.get('/api/v1/chats/conversations/'),
  
  getMessages: (conversationId: string) =>
    api.get(`/api/v1/chats/conversations/${conversationId}/messages/`),
  
  sendMessage: (conversationId: string, message: string) =>
    api.post(`/api/v1/chats/conversations/${conversationId}/messages/`, {
      message,
    }),
};

export const notificationsAPI = {
  list: () =>
    api.get('/api/v1/notifications/'),
  
  markAsRead: (id: string) =>
    api.patch(`/api/v1/notifications/${id}/`, { is_read: true }),
  
  markAllAsRead: () =>
    api.post('/api/v1/notifications/mark-all-read/'),
};
