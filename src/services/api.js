import axios from 'axios'

//  AQUI É ONDE CONECTA O FRONT COM O BACK
// Em desenvolvimento local ele aponta para o servidor PHP rodando no XAMPP
// QUANDO FOR COLOCAR EM PRODUÇÃO, troca pela URL da EC2 (ex http://api.seudominio.com)

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
})

//  Interceptor de resposta, extrai sempre o campo "data" do JSON
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Erro desconhecido'
    return Promise.reject(new Error(message))
  }
)

//  CATEGORIES 
export const categoriesApi = {
  list:    ()         => api.get('/categories'),
  find:    (id)       => api.get(`/categories/${id}`),
  create:  (data)     => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  delete:  (id)       => api.delete(`/categories/${id}`),
}

//  SUPPLIERS 
export const suppliersApi = {
  list:    ()         => api.get('/suppliers'),
  find:    (id)       => api.get(`/suppliers/${id}`),
  create:  (data)     => api.post('/suppliers', data),
  update:  (id, data) => api.put(`/suppliers/${id}`, data),
  delete:  (id)       => api.delete(`/suppliers/${id}`),
}

//  PRODUCTS
export const productsApi = {
  list:    ()         => api.get('/products'),
  find:    (id)       => api.get(`/products/${id}`),
  create:  (data)     => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  delete:  (id)       => api.delete(`/products/${id}`),
}

//  STOCK 
export const stockApi = {
  list:     ()   => api.get('/stock'),
  lowStock: ()   => api.get('/stock/low'),
  find:     (id) => api.get(`/stock/${id}`),
}

//  MOVEMENTS
export const movementsApi = {
  list:   (filters = {}) => api.get('/movements', { params: filters }),
  find:   (id)           => api.get(`/movements/${id}`),
  create: (data)         => api.post('/movements', data),
}

//  ENTRIES 
export const entriesApi = {
  list:   ()     => api.get('/entries'),
  find:   (id)   => api.get(`/entries/${id}`),
  create: (data) => api.post('/entries', data),
}

export default api
