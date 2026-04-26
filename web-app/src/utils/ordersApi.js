import request from './request';

// ── Types ────────────────────────────────────────────────────────────────────

export const ORDER_STATUSES = ['PENDING', 'PREPARING', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

// ── API calls ────────────────────────────────────────────────────────────────

/** GET /api/orders — current user's orders (backend filters by auth token) */
export const fetchMyOrders = (userId) =>
    request.get(`/orders`).then((res) => res.data ?? []);

/** GET /api/store/list */
export const fetchStores = () =>
  request.get('/api/store/list').then((res) => res.data ?? []);

/** GET /api/menu/search?storeId=X */
export const fetchMenuByStore = (storeId) =>
  request.get('/api/menu/search', { params: { storeId } }).then((res) => res.data ?? []);

/** POST /api/orders/create */
export const createOrder = (payload) =>
  request.post('/api/orders/create', payload).then((res) => res.data);
