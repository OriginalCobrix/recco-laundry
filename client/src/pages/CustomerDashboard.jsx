import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { ShoppingBag, Clock, CheckCircle, MapPin, Phone, Calendar, CreditCard, Wallet } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        timeout: 20000
      });
    }

    const socket = socketRef.current;
    socket.emit('join', user._id);

    socket.on('connect', () => {
      console.log('✅ Customer Socket connected');
      socket.emit('join', user._id);
    });

    socket.on('orderAssigned', (order) => {
      console.log('🔔 New Order Assigned:', order);
      fetchOrders();
    });

    socket.on('orderStatusUpdated', () => {
      console.log('🔔 Order Status Updated');
      fetchOrders();
    });

    socket.on('paymentUpdated', () => {
      console.log('🔔 Payment Updated');
      fetchOrders();
    });

    fetchOrders();

    return () => {
      socket.off('orderAssigned');
      socket.off('orderStatusUpdated');
      socket.off('paymentUpdated');
    };
  }, [user?._id]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  const totalPending = orders.reduce((sum, o) => sum + ((o.price || 0) - (o.paidAmount || 0)), 0);

  const stats = [
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag },
    { title: 'In Progress', value: orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length, icon: Clock },
    { title: 'Completed', value: orders.filter(o => o.status === 'Completed').length, icon: CheckCircle },
    { title: 'Total Paid', value: `Rs. ${totalSpent.toLocaleString()}`, icon: Wallet }
  ];

  const trackingSteps = ['Accepted', 'Picked Up', 'Washing', 'Ready For Pickup', 'Completed'];

  return (
    <DashboardLayout>
      <div className="customer-dashboard">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <h1 className="page-title">My <span className="gradient-text">Dashboard</span></h1>
          <p className="page-subtitle">Track your orders and payments in real-time.</p>
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              className="card-3d stat-card" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <div className="stat-icon-box">
                <stat.icon size={24} color="var(--yellow)" />
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={activeTab === 'orders' ? 'premium-btn' : 'premium-btn-outline'}
            style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShoppingBag size={16} /> My Orders
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={activeTab === 'payments' ? 'premium-btn' : 'premium-btn-outline'}
            style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <CreditCard size={16} /> Payment History
          </button>
        </div>

        {activeTab === 'orders' && (
          <>
            <h2 className="section-title">Your Orders</h2>
            <div className="orders-list">
              {orders.length === 0 && (
                <div className="card-3d empty-state">
                  <ShoppingBag size={40} color="#444" />
                  <p>No orders assigned yet. Our admin will assign orders to you shortly.</p>
                </div>
              )}
              
              {orders.map((order, idx) => {
                const currentStepIndex = trackingSteps.indexOf(order.status);
                const isCompleted = order.status === 'Completed';
                const isCancelled = order.status === 'Cancelled';
                
                return (
                  <motion.div 
                    key={order._id} 
                    className="card-3d order-card" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="order-header">
                      <div>
                        <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                        <p>{order.serviceType?.name}</p>
                      </div>
                      <span className={`badge ${
                        isCompleted ? 'badge-completed' : 
                        isCancelled ? 'badge-rejected' : 
                        'badge-active'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-details-grid">
                      <div className="order-detail-item">
                        <Calendar size={14} color="#FFD700" />
                        <span>Pickup: {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="order-detail-item">
                        <Phone size={14} color="#FFD700" />
                        <span>{order.phone}</span>
                      </div>
                      <div className="order-detail-item full-width">
                        <MapPin size={14} color="#FFD700" />
                        <span>
                          {order.pickupAddress?.street}{order.pickupAddress?.city ? `, ${order.pickupAddress.city}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="payment-summary">
                      <div className="payment-row">
                        <span>Total Amount</span>
                        <span style={{ color: '#FFD700', fontWeight: 700 }}>Rs. {order.price || 0}</span>
                      </div>
                      <div className="payment-row">
                        <span>Paid</span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>Rs. {order.paidAmount || 0}</span>
                      </div>
                      <div className="payment-row" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                        <span>Remaining</span>
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>Rs. {(order.price - (order.paidAmount || 0)).toLocaleString()}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className={`badge ${
                          order.paymentStatus === 'Paid' ? 'badge-completed' :
                          order.paymentStatus === 'Partial' ? 'badge-active' : 'badge-pending'
                        }`}>
                          {order.paymentStatus || 'Unpaid'}
                        </span>
                      </div>
                    </div>

                    {!isCancelled && (
                      <>
                        <div className="progress-section">
                          <div className="progress-header">
                            <span>Overall Progress</span>
                            <span className="progress-value">{order.progress || 0}%</span>
                          </div>
                          <div className="progress-track">
                            <motion.div 
                              key={order.progress}
                              initial={{ width: 0 }} 
                              animate={{ width: `${order.progress || 0}%` }} 
                              transition={{ duration: 0.8 }}
                              className="progress-bar-fill" 
                            />
                          </div>
                        </div>

                        <div className="tracking-timeline">
                          {trackingSteps.map((step, i) => (
                            <div key={step} className={`timeline-step ${i <= currentStepIndex ? 'active' : ''}`}>
                              <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                transition={{ delay: i * 0.1 + 0.5 }} 
                                className="timeline-dot" 
                              />
                              <span className="timeline-label">{step}</span>
                            </div>
                          ))}
                          <div className="timeline-line">
                            <motion.div 
                              key={currentStepIndex}
                              initial={{ width: '0%' }} 
                              animate={{ width: `${Math.max(0, (currentStepIndex / (trackingSteps.length - 1)) * 100)}%` }} 
                              transition={{ duration: 1, ease: 'easeOut' }} 
                              className="timeline-line-fill" 
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {isCancelled && (
                      <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', textAlign: 'center', color: '#ef4444' }}>
                        This order has been cancelled.
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'payments' && (
          <>
            <h2 className="section-title">Payment History</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))' }}>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Total Billed</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#FFD700' }}>
                  Rs. {orders.reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString()}
                </h3>
              </motion.div>
              <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(52,211,153,0.05))' }}>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Total Paid</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#10b981' }}>
                  Rs. {totalSpent.toLocaleString()}
                </h3>
              </motion.div>
              <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(248,113,113,0.05))' }}>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Remaining</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#ef4444' }}>
                  Rs. {totalPending.toLocaleString()}
                </h3>
              </motion.div>
            </div>

            <div className="orders-list">
              {orders.length === 0 && (
                <div className="card-3d empty-state">
                  <CreditCard size={40} color="#444" />
                  <p>No payment records yet.</p>
                </div>
              )}

              {orders.map((order, idx) => (
                <motion.div 
                  key={order._id} 
                  className="card-3d order-card" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="order-header">
                    <div>
                      <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                      <p>{order.serviceType?.name}</p>
                    </div>
                    <span className={`badge ${
                      order.paymentStatus === 'Paid' ? 'badge-completed' :
                      order.paymentStatus === 'Partial' ? 'badge-active' : 'badge-pending'
                    }`}>
                      {order.paymentStatus || 'Unpaid'}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#888' }}>Payment Progress</span>
                      <span style={{ fontSize: '0.85rem', color: '#FFD700', fontWeight: 600 }}>
                        {order.price > 0 ? Math.round(((order.paidAmount || 0) / order.price) * 100) : 0}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${order.price > 0 ? ((order.paidAmount || 0) / order.price) * 100 : 0}%` }} 
                        transition={{ duration: 0.8 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '10px' }} 
                      />
                    </div>
                  </div>

                  <div className="payment-summary">
                    <div className="payment-row">
                      <span>Total Amount</span>
                      <span style={{ color: '#FFD700', fontWeight: 700 }}>Rs. {order.price || 0}</span>
                    </div>
                    <div className="payment-row">
                      <span>Amount Paid</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>Rs. {order.paidAmount || 0}</span>
                    </div>
                    <div className="payment-row" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                      <span>Balance Due</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>Rs. {(order.price - (order.paidAmount || 0)).toLocaleString()}</span>
                    </div>
                  </div>

                  {order.paymentHistory && order.paymentHistory.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#FFD700', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={14} /> Payment History
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {order.paymentHistory.map((payment, i) => (
                          <div 
                            key={i} 
                            style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                                Rs. {payment.amount}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                {payment.method} {payment.note && `• ${payment.note}`}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              {new Date(payment.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .customer-dashboard { width: 100%; }
        .page-header { margin-bottom: 2.5rem; }
        .page-title { font-size: clamp(1.8rem, 4vw, 2.5rem); margin: 0 0 0.5rem 0; font-family: 'Sora', sans-serif; }
        .page-subtitle { color: var(--text-muted); margin: 0; font-size: 1rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .stat-icon-box { background: rgba(255,215,0,0.1); padding: 0.8rem; border-radius: 12px; flex-shrink: 0; }
        .stat-info h3 { font-size: 1.8rem; margin: 0; font-family: 'Sora', sans-serif; }
        .stat-info p { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
        .section-title { font-size: 1.5rem; margin-bottom: 1.5rem; font-family: 'Sora', sans-serif; }
        .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .empty-state { padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--text-muted); }
        .order-card { padding: 2rem; }
        .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .order-header h3 { font-size: 1.2rem; margin: 0; font-family: 'Sora', sans-serif; }
        .order-header p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
        .order-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; }
        .order-detail-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #aaa; }
        .order-detail-item.full-width { grid-column: 1 / -1; }
        .payment-summary { background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; }
        .payment-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.9rem; }
        .progress-section { margin-bottom: 2.5rem; }
        .progress-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
        .progress-value { color: var(--yellow); font-weight: 600; }
        .progress-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #FFD700, #FFA500); }
        .tracking-timeline { display: flex; justify-content: space-between; position: relative; padding-top: 20px; }
        .timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 2; min-width: 0; }
        .timeline-dot { width: 16px; height: 16px; border-radius: 50%; margin-bottom: 0.5rem; background: #333; transition: all 0.3s ease; flex-shrink: 0; }
        .timeline-step.active .timeline-dot { background: linear-gradient(135deg, #FFD700, #FFA500); box-shadow: 0 0 10px rgba(255,215,0,0.4); }
        .timeline-label { font-size: 0.7rem; text-align: center; color: var(--text-muted); transition: color 0.3s ease; line-height: 1.2; word-break: break-word; width: 100%; }
        .timeline-step.active .timeline-label { color: var(--text-light); font-weight: 600; }
        .timeline-line { position: absolute; top: 28px; left: 10%; right: 10%; height: 2px; background: #333; z-index: 1; }
        .timeline-line-fill { height: 100%; background: linear-gradient(90deg, #FFD700, #FFA500); }
        @media (max-width: 768px) {
          .order-card { padding: 1.5rem; }
          .progress-section { margin-bottom: 2rem; }
          .tracking-timeline { padding-top: 15px; gap: 4px; }
          .timeline-dot { width: 12px; height: 12px; }
          .timeline-label { font-size: 0.6rem; }
          .timeline-line { top: 21px; left: 5%; right: 5%; }
          .order-details-grid { grid-template-columns: 1fr; gap: 0.8rem; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
          .stat-card { padding: 1.2rem; }
          .stat-info h3 { font-size: 1.5rem; }
          .tracking-timeline { overflow-x: auto; padding-bottom: 10px; justify-content: flex-start; scroll-snap-type: x mandatory; }
          .tracking-timeline::-webkit-scrollbar { display: none; }
          .timeline-step { flex: 0 0 auto; width: 70px; scroll-snap-align: start; }
          .timeline-line { display: none; }
          .order-header h3 { font-size: 1.1rem; }
        }
      `}</style>
    </DashboardLayout>
  );
}