import React, { useState, useEffect } from 'react';
import {
  NavBar, List, DotLoading, ErrorBlock, PullToRefresh,
  Card, Tag, Button, Modal, Switch, Toast, SpinLoading,
} from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders, updateOrderStatus } from '../utils/ordersApi';
import { executePayment } from '../utils/paymentApi';
import { fetchLoyaltyBalance } from '../utils/loyaltyApi';
import { CreditCard, Gift, CheckCircle, XCircle } from 'lucide-react';

const BROWN = '#6F4E37';
const POINTS_FOR_FREE = 100;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-GB', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getStatusColor = (status) => {
  const map = {
    PENDING: 'orange', PREPARING: 'primary',
    COMPLETED: 'success', DELIVERED: 'success', CANCELLED: 'danger',
  };
  return map[status] || 'default';
};

const capitalize = (s) => {
  if (!s) return '';
  return String(s[0]).toUpperCase() + String(s).slice(1).toLowerCase();
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

const PaymentModal = ({ order, visible, onClose, onPaid }) => {
  const [usePoints, setUsePoints] = useState(false);
  const [loyalty, setLoyalty] = useState(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState(null); // null | 'success' | 'error'
  const [resultMessage, setResultMessage] = useState('');

  // Load loyalty balance when modal opens
  useEffect(() => {
    if (!visible) {
      // Reset state on close
      setUsePoints(false);
      setResult(null);
      setResultMessage('');
      return;
    }
    setLoyaltyLoading(true);
    fetchLoyaltyBalance()
      .then(setLoyalty)
      .catch(() => setLoyalty(null))
      .finally(() => setLoyaltyLoading(false));
  }, [visible]);

  if (!order) return null;

  const hasEnoughPoints = (loyalty?.pointsBalance ?? 0) >= POINTS_FOR_FREE;
  const isFreeWithPoints = usePoints && hasEnoughPoints;
  const amountDue = isFreeWithPoints ? 0 : order.totalPrice;

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await executePayment(order.id, { usePoints });
      if (res?.code === 'SUCCESS' || res?.code === 200) {
        setResult('success');
        setResultMessage(res.uiMessage || 'Payment successful!');
        onPaid(order.id); // notify parent to flip status → PREPARING
      } else {
        setResult('error');
        setResultMessage(res?.uiMessage || 'Payment failed. Please try again.');
      }
    } catch {
      setResult('error');
      setResultMessage('Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

    const handleDone = async () => {
        try {
            // Call the API to update status to PREPARING
            await updateOrderStatus(order.id, 'PREPARING');
            setResult(null);
            onClose();
        } catch (error) {
            console.error("Failed to update status on server:", error);
            Toast.show({
                content: 'Could not sync status with server',
                position: 'bottom',
            });
            // Optional: Still close the modal or let them try again
            setResult(null);
            onClose();
        }
    };

  return (
    <Modal
      visible={visible}
      closeOnMaskClick={!paying}
      onClose={onClose}
      content={
        <div style={{ padding: '4px 0' }}>

          {/* ── Result screen ── */}
          {result ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              {result === 'success' ? (
                <>
                  <CheckCircle size={56} color="#52c41a" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#389e0d', marginBottom: 6 }}>
                    Payment Successful
                  </div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
                    {resultMessage}
                  </div>
                  <div style={{
                    background: '#f6ffed', border: '1px solid #b7eb8f',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#389e0d',
                  }}>
                    Your order is now <strong>PREPARING</strong> ☕
                  </div>
                  <Button
                    block color="primary" size="large"
                    style={{ background: BROWN, border: 'none', borderRadius: 12 }}
                    onClick={handleDone}
                  >
                    Done
                  </Button>
                </>
              ) : (
                <>
                  <XCircle size={56} color="#ff4d4f" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#cf1322', marginBottom: 6 }}>
                    Payment Failed
                  </div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
                    {resultMessage}
                  </div>
                  <Button
                    block color="danger" size="large"
                    style={{ borderRadius: 12 }}
                    onClick={() => setResult(null)}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* ── Order summary ── */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Order Summary</div>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 14, color: '#444', padding: '3px 0',
                  }}>
                    <span>{item.quantity} × {item.menuName}{item.size ? ` (${capitalize(item.size)})` : ''}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 14, color: '#888' }}>Order Total</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: BROWN }}>
                    £{(order.totalPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ── Loyalty points toggle ── */}
              <div style={{
                background: hasEnoughPoints ? '#fff7e6' : '#fafafa',
                border: `1px solid ${hasEnoughPoints ? '#ffd666' : '#f0f0f0'}`,
                borderRadius: 10, padding: '12px 14px', marginBottom: 16,
              }}>
                {loyaltyLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                    <SpinLoading color={BROWN} style={{ '--size': '24px' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Gift size={20} color={hasEnoughPoints ? '#d48806' : '#bbb'} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: hasEnoughPoints ? '#874d00' : '#999' }}>
                          {hasEnoughPoints ? '🎉 Redeem for FREE order' : 'Loyalty Points'}
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                          {loyalty
                            ? `${loyalty.pointsBalance} pts${!hasEnoughPoints ? ` — need ${POINTS_FOR_FREE} to redeem` : ''}`
                            : 'Could not load points'}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={usePoints}
                      disabled={!hasEnoughPoints}
                      onChange={setUsePoints}
                      style={{ '--checked-color': BROWN }}
                    />
                  </div>
                )}
              </div>

              {/* ── Amount due ── */}
              <div style={{
                background: isFreeWithPoints ? '#f6ffed' : '#f5ece4',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, color: '#666' }}>Amount Due</span>
                <div style={{ textAlign: 'right' }}>
                  {isFreeWithPoints && (
                    <span style={{
                      textDecoration: 'line-through', color: '#bbb',
                      fontSize: 13, marginRight: 8,
                    }}>
                      £{(order.totalPrice || 0).toFixed(2)}
                    </span>
                  )}
                  <span style={{
                    fontWeight: 800, fontSize: 20,
                    color: isFreeWithPoints ? '#389e0d' : BROWN,
                  }}>
                    {isFreeWithPoints ? 'FREE' : `£${amountDue.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* ── Pay button ── */}
              <Button
                block color="primary" size="large" loading={paying}
                style={{ background: BROWN, border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16 }}
                onClick={handlePay}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CreditCard size={18} />
                  {isFreeWithPoints ? 'Redeem & Place Order' : `Pay £${amountDue.toFixed(2)}`}
                </span>
              </Button>
            </>
          )}
        </div>
      }
      showCloseButton={!paying && !result}
      title={
        result ? null : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} color={BROWN} />
            <span>Pay for Order #{order.id}</span>
          </div>
        )
      }
    />
  );
};

// ── Orders Page ───────────────────────────────────────────────────────────────

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null); // order being paid
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchMyOrders();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  // Called by PaymentModal on success — flip the order to PREPARING locally
  const handlePaid = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: 'PREPARING' } : o)
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <DotLoading color="primary" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar className="nav-bar" back={null}>
        <span style={{ fontWeight: 'bold', color: '#6F4E37', fontSize: '18px' }}>Orders</span>
      </NavBar>

      <div className="content-scroll">
        <PullToRefresh onRefresh={loadOrders}>
          {error ? (
            <ErrorBlock status="error" title="Failed" description={error} />
          ) : orders.length === 0 ? (
            <ErrorBlock status="empty" title="No orders yet" description="Your order history will appear here." />
          ) : (
            <List
              header="Your Recent Orders"
              style={{ '--padding-left': '12px', '--padding-right': '12px' }}
            >
              {orders.map((order) => (
                <List.Item key={order.id} style={{ padding: '8px 0' }}>
                  <Card style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>

                    {/* Top row: Order label + status tag + Pay button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>
                          Order
                        </span>
                        <Tag
                          color={getStatusColor(order.status)}
                          style={{ '--border-radius': '4px', padding: '2px 6px', fontSize: 11, fontWeight: 600 }}
                        >
                          {order.status}
                        </Tag>
                      </div>

                      {/* Pay button — only for PENDING orders */}
                      {order.status === 'PENDING' && (
                        <Button
                          size="mini"
                          style={{
                            background: BROWN, color: '#fff', border: 'none',
                            borderRadius: 16, padding: '4px 12px',
                            fontSize: 12, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                          onClick={() => setPayingOrder(order)}
                        >
                          <CreditCard size={12} />
                          Pay Now
                        </Button>
                      )}
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                      {formatDate(order.orderDate)}
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: 10 }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                          {item.quantity} × {item.menuName}
                          {item.size ? ` (${capitalize(item.size)})` : ''}
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div style={{
                      paddingTop: 8, borderTop: '1px solid #fafafa',
                      fontWeight: 'bold', color: BROWN, fontSize: 16,
                    }}>
                      Total: £{(order.totalPrice || 0).toFixed(2)}
                    </div>

                  </Card>
                </List.Item>
              ))}
            </List>
          )}
        </PullToRefresh>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        order={payingOrder}
        visible={!!payingOrder}
        onClose={() => setPayingOrder(null)}
        onPaid={handlePaid}
      />
    </div>
  );
};

export default Orders;
