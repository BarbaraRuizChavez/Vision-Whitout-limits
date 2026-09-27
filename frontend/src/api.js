const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const STORAGE_KEY = 'vwl_auth';

function getToken() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).token : null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.errors ? data.errors.join(' ') : data.error || 'Ocurrió un error inesperado.';
    throw new Error(message);
  }
  return data;
}

export function getProducts(category) {
  const query = category ? `?category=${category}` : '';
  return request(`/products${query}`);
}

export function getProductBySlug(slug) {
  return request(`/products/${slug}`);
}

export function createOrder(payload) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getOrder(id) {
  return request(`/orders/${id}`);
}

export function getOrders() {
  return request('/orders');
}

export function getMyOrders() {
  return request('/orders/mine');
}

export function loginRequest(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest({ firstName, lastName, email, password, photoUrl, acceptedTerms }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password, photoUrl, acceptedTerms }),
  });
}

export function googleLoginRequest(credential) {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function updateProfileRequest({ firstName, lastName, photoUrl }) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ firstName, lastName, photoUrl }),
  });
}

export function createProduct(payload) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' });
}
