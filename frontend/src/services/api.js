import axios from 'axios';

// Create configured axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register endpoints
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// ===== Product API =====
export const productAPI = {
  getAll: async () => {
    const res = await api.get('/products');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  getByCategory: async (category) => {
    const res = await api.get(`/products/category/${encodeURIComponent(category)}`);
    return res.data;
  },
  create: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },
  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

// ===== Review API =====
export const reviewAPI = {
  getProductReviews: async (productId) => {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
  },
  addReview: async (productId, reviewData) => {
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data;
  },
  deleteReview: async (reviewId) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
  },
  getMyReviews: async () => {
    const res = await api.get('/reviews/my');
    return res.data;
  },
};

// ===== Cart API =====
export const cartAPI = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },
  addToCart: async (productId, quantity = 1) => {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data;
  },
  updateQuantity: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },
  updateItemQuantity: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },
  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },
  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data;
  },
};

// ===== Order & Checkout API =====
export const orderAPI = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await api.get('/orders/my');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  getAllOrders: async () => {
    const res = await api.get('/admin/orders');
    return res.data;
  },
  updateStatus: async (orderId, status) => {
    const res = await api.put(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },
};

// ===== Cloudinary Images API =====
export const imageAPI = {
  getImages: async (folder) => {
    const url = folder ? `/images?folder=${encodeURIComponent(folder)}` : '/images';
    const res = await api.get(url);
    return res.data;
  },
  uploadImage: async (formData) => {
    const res = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  deleteImage: async (publicId) => {
    const res = await api.delete(`/images?publicId=${encodeURIComponent(publicId)}`);
    return res.data;
  },
};

// ===== Subscriber API =====
export const subscriberAPI = {
  subscribe: async (email) => {
    const res = await api.post('/subscribers', { email });
    return res.data;
  },
};

export default api;
