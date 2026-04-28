import React, { useState, useEffect } from 'react';
import { NavBar, List, Badge, DotLoading, ErrorBlock, PullToRefresh, Card, Tag } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders } from '../utils/ordersApi';
import { ShoppingBag } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchMyOrders();
            setOrders(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        const map = { PENDING: 'orange', PREPARING: 'primary', COMPLETED: 'success', DELIVERED: 'success', CANCELLED: 'danger' };
        return map[status] || 'default';
    };

    if (loading && orders.length === 0) return <div style={{ padding: 20, textAlign: 'center' }}><DotLoading color='primary' /></div>;

    return (
        <div className="app-container">
            <NavBar back={null}>My Order History</NavBar>
            <div className="content-scroll">
                <PullToRefresh onRefresh={loadOrders}>
                    {error ? (
                        <ErrorBlock status='error' title='Failed' description={error} />
                    ) : (
                        <List header='Your Recent Orders' style={{ '--padding-left': '12px', '--padding-right': '12px' }}>
                            {orders.map((order) => (
                                <List.Item key={order.id} style={{ padding: '8px 0' }}>
                                    <Card style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                                        {/* Top Row: Order # and Status side-by-side */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '4px'
                                        }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                                Order
                                            </span>

                                            {/* Spacing between ID and Tag */}
                                            <div style={{ marginLeft: '12px' }}>
                                                <Tag
                                                    color={getStatusColor(order.status)}
                                                    style={{
                                                        '--border-radius': '4px',
                                                        padding: '2px 6px',
                                                        fontSize: '11px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {order.status}
                                                </Tag>
                                            </div>
                                        </div>

                                        {/* Date Section */}
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                                            {formatDate(order.orderDate)}
                                        </div>

                                        {/* Items Section */}
                                        <div style={{ marginBottom: '10px' }}>
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                                                    {item.quantity}x {item.menuName}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total Section */}
                                        <div style={{
                                            paddingTop: '8px',
                                            borderTop: '1px solid #fafafa',
                                            fontWeight: 'bold',
                                            color: '#6F4E37',
                                            fontSize: '16px'
                                        }}>
                                            Total: ${(order.totalPrice || 0).toFixed(2)}
                                        </div>
                                    </Card>
                                </List.Item>
                            ))}
                        </List>
                    )}
                </PullToRefresh>
            </div>
        </div>
    );
};

export default Orders;