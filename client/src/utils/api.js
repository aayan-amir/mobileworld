export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export const api = {
  getInventory: () => request('/api/inventory'),
  getProduct: (id) => request(`/api/inventory/${id}`),
  createOrder: (formData) => request('/api/orders', { method: 'POST', body: formData }),
  getOrder: (id) => request(`/api/orders/${id}`),
  adminLogin: (payload) => request('/api/admin/login', { method: 'POST', body: JSON.stringify(payload) }),
  adminLogout: () => request('/api/admin/logout', { method: 'POST' }),
  adminMe: () => request('/api/admin/me'),
  adminOrders: (status = '') => request(`/api/admin/orders${status ? `?status=${status}` : ''}`),
  updateOrder: (id, payload) => request(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminInventory: () => request('/api/admin/inventory'),
  replaceInventory: (payload) => request('/api/admin/inventory', { method: 'PUT', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/api/admin/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateVariant: (id, variantId, payload) => request(`/api/admin/inventory/${id}/variants/${variantId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/api/admin/inventory/${id}`, { method: 'DELETE' })
};

export function pkr(amount) {
  return `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;
}

export function imageUrl(filename) {
  if (!filename) return '';
  if (/^https?:\/\//.test(filename)) return filename;
  return `${API_BASE}/api/admin/uploads/${filename}`;
}
