import { api } from './client';
import { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', { email, password }),

  getMe: () => api.get<{ success: boolean; data: User }>('/auth/me'),

  listUsers: () => api.get('/auth/users'),
  createUser: (data: Record<string, unknown>) => api.post('/auth/users', data),
  updateUser: (id: string, data: Record<string, unknown>) => api.put(`/auth/users/${id}`, data),
};

export const clientsApi = {
  list: (params?: Record<string, unknown>) => api.get('/clients', { params }),
  get: (id: string) => api.get(`/clients/${id}`),
  create: (data: Record<string, unknown>) => api.post('/clients', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  history: (id: string) => api.get(`/clients/${id}/history`),
};

export const licensesApi = {
  list: (params?: Record<string, unknown>) => api.get('/licenses', { params }),
  get: (id: string) => api.get(`/licenses/${id}`),
  create: (data: Record<string, unknown>) => api.post('/licenses', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/licenses/${id}`, data),
  suspend: (id: string) => api.post(`/licenses/${id}/suspend`),
  reactivate: (id: string) => api.post(`/licenses/${id}/reactivate`),
  transfer: (id: string, newMachineId: string) => api.post(`/licenses/${id}/transfer`, { newMachineId }),
  logs: (id: string) => api.get(`/licenses/${id}/logs`),
  activations: (params?: Record<string, unknown>) => api.get('/licenses/activations', { params }),
  approveActivation: (id: string, data: {
    licenseTypeId: string;
    maxUsers?: number;
    maxWorkstations?: number;
    clientId?: string;
  }) => api.post(`/licenses/activations/${id}/approve`, {
    licenseTypeId: data.licenseTypeId,
    ...(data.maxUsers != null ? { maxUsers: Number(data.maxUsers) } : {}),
    ...(data.maxWorkstations != null ? { maxWorkstations: Number(data.maxWorkstations) } : {}),
    ...(data.clientId ? { clientId: data.clientId } : {}),
  }),
  rejectActivation: (id: string, reason: string) => api.post(`/licenses/activations/${id}/reject`, { reason }),
};

export const catalogApi = {
  products: {
    list: () => api.get('/catalog/products'),
    get: (id: string) => api.get(`/catalog/products/${id}`),
    create: (data: Record<string, unknown>) => api.post('/catalog/products', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/catalog/products/${id}`, data),
  },
  modules: {
    list: () => api.get('/catalog/modules'),
    create: (data: Record<string, unknown>) => api.post('/catalog/modules', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/catalog/modules/${id}`, data),
  },
  licenseTypes: {
    list: () => api.get('/catalog/license-types'),
    create: (data: Record<string, unknown>) => api.post('/catalog/license-types', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/catalog/license-types/${id}`, data),
  },
  appVersions: {
    list: () => api.get('/catalog/app-versions'),
    create: (data: Record<string, unknown>) => api.post('/catalog/app-versions', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/catalog/app-versions/${id}`, data),
  },
};

export const statsApi = {
  dashboard: () => api.get('/stats/dashboard'),
  auditLogs: (params?: Record<string, unknown>) => api.get('/stats/audit-logs', { params }),
};
