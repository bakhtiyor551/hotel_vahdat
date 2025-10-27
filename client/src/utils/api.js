import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
};

export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  create: (data) => api.post('/reviews', data),
};

export const contactsAPI = {
  get: () => api.get('/contacts'),
  sendMessage: (data) => api.post('/contacts/message', data),
};

export default api;

