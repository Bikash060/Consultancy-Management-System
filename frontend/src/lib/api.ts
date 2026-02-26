import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aacademyapi.ashlya.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
                try {
                    const { data } = await axios.post(`${API_URL}/auth/refresh`, null, {
                        headers: { Authorization: `Bearer ${refreshToken}` },
                    });
                    localStorage.setItem('access_token', data.access_token);
                    error.config.headers.Authorization = `Bearer ${data.access_token}`;
                    return api(error.config);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) =>
        api.post('/auth/register', data),
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
        api.post('/auth/reset-password', { token, password }),
};

export const usersApi = {
    getAll: () => api.get('/users'),
    getById: (id: number) => api.get(`/users/${id}`),
    getCounselors: () => api.get('/users/counselors'),
    getClients: () => api.get('/users/clients'),
    update: (id: number, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
};

export const appointmentsApi = {
    getAll: () => api.get('/appointments'),
    getById: (id: number) => api.get(`/appointments/${id}`),
    create: (data: Record<string, unknown>) => api.post('/appointments', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/appointments/${id}`, data),
    cancel: (id: number) => api.delete(`/appointments/${id}`),
};

export const applicationsApi = {
    getAll: () => api.get('/applications'),
    getById: (id: number) => api.get(`/applications/${id}`),
    create: (data: Record<string, unknown>) => api.post('/applications', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/applications/${id}`, data),
    updateStage: (id: number, stageData: Record<string, unknown>) =>
        api.post(`/applications/${id}/stages`, stageData),
};

export const documentsApi = {
    getAll: () => api.get('/documents'),
    getById: (id: number) => api.get(`/documents/${id}`),
    upload: (file: File, documentType: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', documentType);
        return api.post('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    verify: (id: number) => api.put(`/documents/${id}/verify`),
    delete: (id: number) => api.delete(`/documents/${id}`),
};

export const messagesApi = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (userId: number) => api.get(`/messages/${userId}`),
    send: (receiverId: number, content: string) =>
        api.post('/messages', { receiver_id: receiverId, content }),
    markAsRead: (userId: number) => api.put(`/messages/${userId}/read`),
};

export const aiApi = {
    chat: (message: string) => api.post('/ai/chat', { message }),
    getFaqs: () => api.get('/ai/faq'),
};

export const statsApi = {
    getDashboard: () => api.get('/stats/dashboard'),
    getClientStats: () => api.get('/stats/client'),
    getCounselorStats: () => api.get('/stats/counselor'),
    getAdminStats: () => api.get('/stats/admin'),
};

export const adminApi = {
    getDashboard: () => api.get('/admin/stats'),
    getStats: () => api.get('/admin/stats'),
    getCountryStats: () => api.get('/admin/country-stats'),
    // User management
    getUsers: (role?: string) => api.get('/admin/users', { params: { role } }),
    getUser: (id: number) => api.get(`/admin/users/${id}`),
    createUser: (data: { email: string; password: string; first_name: string; last_name: string; role: string }) =>
        api.post('/admin/users', data),
    updateUser: (id: number, data: Partial<{ email: string; is_active: boolean; role: string }>) =>
        api.put(`/admin/users/${id}`, data),
    deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
    // Reports
    getReports: () => api.get('/admin/reports/counselor-performance'),
    // Settings
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data: Record<string, unknown>) => api.put('/admin/settings', data),
};

export default api;
