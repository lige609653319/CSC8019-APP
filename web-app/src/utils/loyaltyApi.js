import request from './request';

export const fetchLoyaltyBalance = async () => {
  const res = await request.get('/loyalty/me');
  return res?.data ?? res ?? { username: '', pointsBalance: 0 };
};

export const fetchLoyaltyTransactions = async (limit = 10) => {
  const safeLimit = Math.min(50, Math.max(1, limit));
  const res = await request.get(`/loyalty/me/transactions?limit=${safeLimit}`);
  return res?.data ?? res ?? [];
};
