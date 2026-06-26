import axios from 'axios';

// ==========================================
// API
// ==========================================
// Desenvolvimento:
// VITE_API_URL=http://localhost:8000
//
// Produção:
// VITE_API_URL=https://api.sistemaestoque.com.br
// ==========================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ==========================================
// Response
// ==========================================

api.interceptors.response.use(

  (response) => response.data,

  (error) => {

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro interno do servidor';

    return Promise.reject(new Error(message));

  }

);

// ==========================================
// Categories
// ==========================================

export const categoriesApi = {

  list: () => api.get('/categories'),

  find: (id) => api.get(`/categories/${id}`),

  create: (data) => api.post('/categories', data),

  update: (id, data) => api.put(`/categories/${id}`, data),

  delete: (id) => api.delete(`/categories/${id}`),

};

// ==========================================
// Suppliers
// ==========================================

export const suppliersApi = {

  list: () => api.get('/suppliers'),

  find: (id) => api.get(`/suppliers/${id}`),

  create: (data) => api.post('/suppliers', data),

  update: (id, data) => api.put(`/suppliers/${id}`, data),

  delete: (id) => api.delete(`/suppliers/${id}`),

};

// ==========================================
// Products
// ==========================================

export const productsApi = {

  list: () => api.get('/products'),

  find: (id) => api.get(`/products/${id}`),

  create: (data) => api.post('/products', data),

  update: (id, data) => api.put(`/products/${id}`, data),

  delete: (id) => api.delete(`/products/${id}`),

};

// ==========================================
// Stock
// ==========================================

export const stockApi = {

  list: () => api.get('/stock'),

  lowStock: () => api.get('/stock/low'),

  find: (id) => api.get(`/stock/${id}`),

};

// ==========================================
// Movements
// ==========================================

export const movementsApi = {

  list: (filters = {}) =>
    api.get('/movements', {
      params: filters,
    }),

  find: (id) => api.get(`/movements/${id}`),

  create: (data) => api.post('/movements', data),

};

// ==========================================
// Entries
// ==========================================

export const entriesApi = {

  list: () => api.get('/entries'),

  find: (id) => api.get(`/entries/${id}`),

  create: (data) => api.post('/entries', data),

};

export default api;