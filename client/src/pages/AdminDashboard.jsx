import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, Clock, CheckCircle, Package, CheckCircle2, CreditCard, TrendingUp } from 'lucide-react';
import { io } from 'socket.io-client';

const STATUS_OPTIONS = [
  'Pending', 'Accepted', 'Picked Up', 'Sorting', 'Washing', 
  'Drying', 'Ironing', 'Packaging', 'Quality Check', 
  'Ready For Pickup', 'Completed', 'Cancelled'
];

const STATUS_PROGRESS = {
  'Pending': 0,
  'Accepted': 10,
  'Picked Up': 20,
  'Sorting': 30,
  'Washing': 45,
  'Drying': 55,
  'Ironing': 70,
  'Packaging': 80,
  'Quality Check': 90,
  'Ready For Pickup': 95,
  'Completed': 100,
  'Cancelled': 0
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    fetchStats();
    fetchCustomers();
    fetchOrders();

    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['polling'],
        reconnection: true,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Admin Socket connected');
      if (user?._id) socket.emit('join', user._id);
    });

    socket.on('newOrder', () => {
      console.log('🔔 New order received');
      fetchOrders();
      fetchStats();
    });

    socket.on('orderStatusUpdated', () => {
      fetchOrders();
      fetchStats();
    });

    socket.on('paymentUpdated', () => {
      fetchOrders();
      fetchStats();
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
      socket.off('paymentUpdated');
    };
  }, []);

  const fetchStats = async () => {
    try { 
      const res = await api.get('/admin/stats'); 
      setStats(res.data); 
    } catch (e) { console.error(e); }
  };

  const fetchCustomers = async () => {
    try { 
      const res = await api.get('/users'); 
      setCustomers(res.data.filter(u => u.role === 'Customer')); 
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (e) { console.error(e); }
  };

  const handleAssignOrder = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put('/orders/assign', { orderId });
      await fetchOrders();
      await fetchStats();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to assign order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      const progress = STATUS_PROGRESS[status] ?? 50;
      await api.put('/orders/status', { orderId, status, progress });
      await fetchOrders();
      await fetchStats();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await api.put('/orders/payment', {
        orderId: paymentModal._id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        note: paymentNote
      });
      
      setPaymentModal(null);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentNote('');
      await fetchOrders();
      await fetchStats();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update payment');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const activeOrders = orders.filter(o => o.status !== 'Pending' && o.status !== 'Completed' && o.status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  const totalPendingPayments = orders.reduce((sum, o) => sum + ((o.price || 0) - (o.paidAmount || 0)), 0);

  const revenueData = [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, 
    { name: 'Mar', revenue: 5000 }, { name: 'Apr', revenue: 4500 }, 
    { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 8000 }
  ];
  
  const orderPieData = [
    { name: 'Active', value: activeOrders.length },
    { name: 'Completed', value: completedOrders.length },
    { name: 'Pending', value: pendingOrders.length }
  ];
  const PIE_COLORS = ['#FFD700', '#10b981', '#f59e0b'];

  const statCards = [
    { title: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#10b981' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: '#FFD700' },
    { title: 'Total Customers', value: customers.length, icon: Users, color: '#3b82f6' },
    { title: 'Pending Payments', value: `Rs. ${totalPendingPayments.toLocaleString()}`, icon: CreditCard, color: '#ef4444' }
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Admin <span className="gradient-text">Control Center</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage orders, track progress, and handle payments.</p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((stat, i) => (
          <motion.div key={i} className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</p>
                <h3 style={{ fontSize: '1.8rem' }}>{stat.value}</h3>
              </div>
              <div style={{ background: `${stat.color}15`, padding: '0.6rem', borderRadius: '10px' }}>
                <stat.icon size={20} color={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} className="admin-charts">
        <motion.div className="card-3d" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '1.5rem', height: '350px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Revenue Analytics</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#777" fontSize={12} />
              <YAxis stroke="#777" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#FFD700" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="card-3d" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>Order Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={orderPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                {orderPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'orders', label: 'All Orders', count: orders.length, icon: Package },
          { id: 'pending', label: 'Pending', count: pendingOrders.length, icon: Clock },
          { id: 'active', label: 'Active', count: activeOrders.length, icon: TrendingUp },
          { id: 'completed', label: 'Completed', count: completedOrders.length, icon: CheckCircle }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id ? 'premium-btn' : 'premium-btn-outline'}
            style={{ padding: '0.7rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <t.icon size={16} />
            {t.label}
            <span style={{
              background: activeTab === t.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,215,0,0.15)',
              color: activeTab === t.id ? '#000' : '#FFD700',
              borderRadius: '20px',
              padding: '0.1rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Price</th>
                <th>Paid</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Progress</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders
                .filter(o => {
                  if (activeTab === 'pending') return o.status === 'Pending';
                  if (activeTab === 'active') return o.status !== 'Pending' && o.status !== 'Completed' && o.status !== 'Cancelled';
                  if (activeTab === 'completed') return o.status === 'Completed';
                  return true;
                })
                .map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div>{order.customer?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{order.customer?.phone}</div>
                  </td>
                  <td>{order.serviceType?.name || 'N/A'}</td>
                  <td style={{ color: '#FFD700', fontWeight: 600 }}>Rs. {order.price || 0}</td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>Rs. {order.paidAmount || 0}</td>
                  <td>
                    <span className={`badge ${
                      order.paymentStatus === 'Paid' ? 'badge-completed' :
                      order.paymentStatus === 'Partial' ? 'badge-active' : 'badge-pending'
                    }`}>
                      {order.paymentStatus || 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      order.status === 'Completed' ? 'badge-completed' :
                      order.status === 'Pending' ? 'badge-pending' : 
                      order.status === 'Cancelled' ? 'badge-rejected' : 'badge-active'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${order.progress || 0}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#FFD700' }}>{order.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleAssignOrder(order._id)}
                          disabled={updatingOrderId === order._id}
                          className="premium-btn"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          {updatingOrderId === order._id ? '...' : 'Accept'}
                        </button>
                      )}

                      {order.status !== 'Pending' && order.status !== 'Completed' && order.status !== 'Cancelled' && (
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order._id}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="premium-input"
                          style={{ padding: '0.3rem', fontSize: '0.75rem', height: 'auto', width: 'auto' }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                          ))}
                        </select>
                      )}

                      {order.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => setPaymentModal(order)}
                          className="premium-btn-outline"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981' }}
                        >
                          <CreditCard size={12} /> Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={() => setPaymentModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-3d"
              style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="#FFD700" />
                Record Payment
              </h3>
              
              <div style={{ background: 'rgba(255,215,0,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Order #{paymentModal._id.slice(-6).toUpperCase()}</span>
                  <span style={{ color: '#FFD700', fontWeight: 600 }}>Rs. {paymentModal.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Already Paid</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Rs. {paymentModal.paidAmount || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Remaining</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>Rs. {(paymentModal.price - (paymentModal.paidAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Amount (Rs.)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="premium-input"
                    style={{ width: '100%' }}
                    max={paymentModal.price - (paymentModal.paidAmount || 0)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="premium-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Cash" style={{ background: '#111' }}>Cash</option>
                    <option value="Bank Transfer" style={{ background: '#111' }}>Bank Transfer</option>
                    <option value="WhatsApp Payment" style={{ background: '#111' }}>WhatsApp Payment</option>
                    <option value="JazzCash" style={{ background: '#111' }}>JazzCash</option>
                    <option value="EasyPaisa" style={{ background: '#111' }}>EasyPaisa</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Note (Optional)</label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Any note..."
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handlePaymentUpdate}
                    className="premium-btn"
                    style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                  >
                    <CheckCircle size={16} /> Record Payment
                  </button>
                  <button
                    onClick={() => setPaymentModal(null)}
                    className="premium-btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .admin-charts { grid-template-columns: 1fr !important; }
          .enterprise-table { font-size: 0.8rem; }
          .enterprise-table th, .enterprise-table td { padding: 0.5rem; }
        }
      `}</style>
    </DashboardLayout>
  );
}