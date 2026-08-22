import api from './api';

export const authService = {
  // We will plug the exact endpoint URLs here tomorrow
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  checkSession: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};