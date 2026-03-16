import request from './request';

/**
 * Loyalty API – uses shared request so Authorization is set automatically.
 * Backend returns { code, message, data }; request interceptor returns that object.
 */

export const fetchLoyaltyBalance = async () => {
  const res = await request.get('/loyalty/me');
  return res?.data ?? { username: '', pointsBalance: 0 };
};

export const fetchLoyaltyTransactions = async (limit = 10) => {
  const safeLimit = Math.min(50, Math.max(1, limit));
  const res = await request.get(`/loyalty/me/transactions?limit=${safeLimit}`);
  return res?.data ?? [];
};
