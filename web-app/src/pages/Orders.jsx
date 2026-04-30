import React, { useState, useEffect } from 'react';
import {
  NavBar, List, DotLoading, ErrorBlock, PullToRefresh,
  Card, Tag, Button, Modal, Input,
} from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders, updateOrderStatus } from '../utils/ordersApi';
import { executePayment } from '../utils/paymentApi';
import { CreditCard, CheckCircle, XCircle, Apple, Smartphone } from 'lucide-react';

const BROWN = '#6F4E37';

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

const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const getCardType = (num) => {
  const d = num.replace(/\s/g, '');
  if (/^4/.test(d)) return 'Visa';
  if (/^5[1-5]/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'Amex';
  return null;
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

const PaymentModal = ({ order, visible, onClose, onPaid }) => {
  // step: 'method' | 'card' | 'processing' | 'success' | 'error'
  const [step, setStep] = useState('method');
  const [resultMessage, setResultMessage] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    if (!visible) {
      setStep('method');
      setCardNumber(''); setCardName(''); setExpiry(''); setCvv('');
      setCardErrors({}); setResultMessage('');
    }
  }, [visible]);

  if (!order) return null;

  const cardType = getCardType(cardNumber);

  const validateCard = () => {
    const errors = {};
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) errors.cardNumber = 'Enter a valid 16-digit card number';
    if (!cardName.trim()) errors.cardName = 'Enter the cardholder name';
    const parts = expiry.split('/');
    const mm = parseInt(parts[0], 10);
    const yy = parseInt(parts[1], 10);
    const now = new Date();
    const expYear = 2000 + yy;
    if (!mm || !yy || mm < 1 || mm > 12 || expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && mm < now.getMonth() + 1)) {
      errors.expiry = 'Enter a valid expiry date';
    }
    if (!cvv || cvv.length < 3) errors.cvv = 'Enter a valid CVV';
    return errors;
  };

  // Core payment + status update logic
  const runPayment = async () => {
    setStep('processing');
    try {
      const res = await executePayment(order.id, { usePoints: false });
      if (res?.code === 'SUCCESS' || res?.code === 200) {
        try { await updateOrderStatus(order.id, 'PREPARING'); }
        catch { console.warn('Status update failed silently'); }
        onPaid(order.id);
        setStep('success');
      } else {
        setResultMessage(res?.uiMessage || 'Payment failed. Please try again.');
        setStep('error');
      }
    } catch {
      setResultMessage('Something went wrong. Please try again.');
      setStep('error');
    }
  };

  const handleConfirmCard = async () => {
    const errors = validateCard();
    if (Object.keys(errors).length > 0) { setCardErrors(errors); return; }
    await runPayment();
  };

  const inputBox = (hasError) => ({
    border: `1.5px solid ${hasError ? '#ff4d4f' : '#e8e0d8'}`,
    borderRadius: 10, padding: '10px 14px', background: '#fdfaf8',
  });

  return (
    <Modal
      visible={visible}
      closeOnMaskClick={step !== 'processing'}
      onClose={onClose}
      showCloseButton={step !== 'processing' && step !== 'success' && step !== 'error'}
      title={
        step === 'success' || step === 'error' || step === 'processing' ? null : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} color={BROWN} />
            <span style={{ fontWeight: 700 }}>
              {step === 'method' ? `Pay for Order #${order.id}` : 'Card Details'}
            </span>
          </div>
        )
      }
      content={
        <div style={{ padding: '4px 0' }}>

          {/* ── Method selection ── */}
          {step === 'method' && (
            <>
              {/* Order summary */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Order Summary</div>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: 14, color: '#444', padding: '3px 0', lineHeight: 1.5 }}>
                    {item.quantity} × {item.menuName}{item.size ? ` (${capitalize(item.size)})` : ''}
                  </div>
                ))}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#888' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: BROWN }}>£{(order.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>Choose payment method</div>

              {/* Apple Pay */}
              <button onClick={runPayment} style={{
                width: '100%', padding: '14px', marginBottom: 10,
                background: '#000', color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Apple size={18} /> Pay
              </button>

              {/* Google Pay */}
              <button onClick={runPayment} style={{
                width: '100%', padding: '14px', marginBottom: 14,
                background: '#fff', color: '#3c4043', border: '1.5px solid #dadce0',
                borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <Smartphone size={18} color="#4285F4" />
                <span style={{ color: '#4285F4', fontWeight: 700 }}>G</span>
                <span style={{ color: '#EA4335', fontWeight: 700 }}>o</span>
                <span style={{ color: '#FBBC05', fontWeight: 700 }}>o</span>
                <span style={{ color: '#4285F4', fontWeight: 700 }}>g</span>
                <span style={{ color: '#34A853', fontWeight: 700 }}>l</span>
                <span style={{ color: '#EA4335', fontWeight: 700 }}>e</span>
                &nbsp;Pay
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                <span style={{ fontSize: 12, color: '#bbb' }}>or pay by card</span>
                <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
              </div>

              <Button block size="large"
                style={{ background: '#f5ece4', color: BROWN, border: 'none', borderRadius: 12, fontWeight: 600 }}
                onClick={() => setStep('card')}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CreditCard size={18} /> Debit / Credit Card
                </span>
              </Button>
            </>
          )}

          {/* ── Card form ── */}
          {step === 'card' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Card Number</div>
                <div style={{ ...inputBox(cardErrors.cardNumber), display: 'flex', alignItems: 'center' }}>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(v) => { setCardNumber(formatCardNumber(v)); setCardErrors(e => ({ ...e, cardNumber: null })); }}
                    style={{ flex: 1, '--font-size': '15px' }}
                    type="tel"
                  />
                  {cardType && <span style={{ fontSize: 11, color: '#888', fontWeight: 600, marginLeft: 8 }}>{cardType}</span>}
                </div>
                {cardErrors.cardNumber && <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>{cardErrors.cardNumber}</div>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Cardholder Name</div>
                <div style={inputBox(cardErrors.cardName)}>
                  <Input
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(v) => { setCardName(v); setCardErrors(e => ({ ...e, cardName: null })); }}
                    style={{ '--font-size': '15px' }}
                  />
                </div>
                {cardErrors.cardName && <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>{cardErrors.cardName}</div>}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Expiry Date</div>
                  <div style={inputBox(cardErrors.expiry)}>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(v) => { setExpiry(formatExpiry(v)); setCardErrors(e => ({ ...e, expiry: null })); }}
                      style={{ '--font-size': '15px' }}
                      type="tel"
                    />
                  </div>
                  {cardErrors.expiry && <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>{cardErrors.expiry}</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>CVV</div>
                  <div style={inputBox(cardErrors.cvv)}>
                    <Input
                      placeholder="123"
                      value={cvv}
                      onChange={(v) => { setCvv(v.replace(/\D/g, '').slice(0, 4)); setCardErrors(e => ({ ...e, cvv: null })); }}
                      style={{ '--font-size': '15px' }}
                      type="tel"
                    />
                  </div>
                  {cardErrors.cvv && <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>{cardErrors.cvv}</div>}
                </div>
              </div>

              <div style={{ background: '#f5ece4', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#888' }}>Amount Due</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: BROWN }}>£{(order.totalPrice || 0).toFixed(2)}</span>
              </div>

              <Button block color="primary" size="large"
                style={{ background: BROWN, border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16 }}
                onClick={handleConfirmCard}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CreditCard size={18} /> Pay £{(order.totalPrice || 0).toFixed(2)}
                </span>
              </Button>

              <button onClick={() => setStep('method')}
                style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer' }}
              >
                ← Back to payment options
              </button>
            </>
          )}

          {/* ── Processing ── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: '#f5ece4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite',
              }}>
                <CreditCard size={26} color={BROWN} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#333', marginBottom: 6 }}>Processing Payment</div>
              <div style={{ fontSize: 13, color: '#999' }}>Please wait…</div>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <CheckCircle size={64} color="#52c41a" strokeWidth={1.5} style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: 20, color: '#389e0d', marginBottom: 8 }}>Payment Successful!</div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>£{(order.totalPrice || 0).toFixed(2)} paid</div>
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#389e0d' }}>
                Your order is now <strong>PREPARING</strong> ☕
              </div>
              <Button block color="primary" size="large"
                style={{ background: BROWN, border: 'none', borderRadius: 12, fontWeight: 700 }}
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <XCircle size={64} color="#ff4d4f" strokeWidth={1.5} style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: 20, color: '#cf1322', marginBottom: 8 }}>Payment Failed</div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>{resultMessage}</div>
              <Button block color="danger" size="large"
                style={{ borderRadius: 12, fontWeight: 700 }}
                onClick={() => setStep('method')}
              >
                Try Again
              </Button>
            </div>
          )}

        </div>
      }
    />
  );
};

// ── Orders Page ───────────────────────────────────────────────────────────────

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);
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

  const handlePaid = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: 'PREPARING' } : o)
    );
  };

  if (loading && orders.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center' }}><DotLoading color="primary" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar className="nav-bar" back={null}>
        <span style={{ fontWeight: 'bold', color: BROWN, fontSize: '18px' }}>Orders</span>
      </NavBar>

      <div className="content-scroll">
        <PullToRefresh onRefresh={loadOrders}>
          {error ? (
            <ErrorBlock status="error" title="Failed" description={error} />
          ) : orders.length === 0 ? (
            <ErrorBlock status="empty" title="No orders yet" description="Your order history will appear here." />
          ) : (
            <List header="Your Recent Orders" style={{ '--padding-left': '12px', '--padding-right': '12px' }}>
              {orders.map((order) => (
                <List.Item key={order.id} style={{ padding: '8px 0' }}>
                  <Card style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>Order #{order.id}</span>
                        <Tag color={getStatusColor(order.status)}
                          style={{ '--border-radius': '4px', padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>
                          {order.status}
                        </Tag>
                      </div>

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => setPayingOrder(order)}
                          style={{
                            background: BROWN, color: '#fff', border: 'none',
                            borderRadius: 16, padding: '5px 13px',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <CreditCard size={12} /> Pay Now
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{formatDate(order.orderDate)}</div>

                    <div style={{ marginBottom: 10 }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                          {item.quantity} × {item.menuName}{item.size ? ` (${capitalize(item.size)})` : ''}
                        </div>
                      ))}
                    </div>

                    <div style={{ paddingTop: 8, borderTop: '1px solid #fafafa', fontWeight: 'bold', color: BROWN, fontSize: 16 }}>
                      Total: £{(order.totalPrice || 0).toFixed(2)}
                    </div>
                  </Card>
                </List.Item>
              ))}
            </List>
          )}
        </PullToRefresh>
      </div>

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
