import request from './request';

export const PAYMENT_MESSAGES = {
  SUCCESS: 'Payment successful.',
  ORDER_NOT_FOUND: 'Order not found.',
  ORDER_NOT_PAYABLE: 'Order is already paid or not payable.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INSUFFICIENT_POINTS_FOR_FULL_REDEMPTION: 'Not enough points to fully redeem this order.',
  LOYALTY_REDEMPTION_FAILED: 'Failed to redeem points for this order.',
  SYSTEM_ERROR: 'A system error occurred. Please try again.',
};

export const executePayment = async (orderId, { forceStatus, usePoints = false } = {}) => {
  if (!orderId) {
    throw new Error('orderId is required');
  }

  const params = new URLSearchParams();
  if (typeof forceStatus === 'boolean') {
    params.set('forceStatus', String(forceStatus));
  }
  params.set('usePoints', String(Boolean(usePoints)));

  const url = `/payment/execute/${orderId}?${params.toString()}`;
  const res = await request.post(url);
  const code = res?.code || 'SYSTEM_ERROR';

  return {
    ...res,
    uiMessage: PAYMENT_MESSAGES[code] || res?.message || PAYMENT_MESSAGES.SYSTEM_ERROR,
  };
};
