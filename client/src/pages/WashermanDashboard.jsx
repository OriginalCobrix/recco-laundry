import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, CheckCircle, Clock, MapPin, Phone, 
  User, TrendingUp, Inbox, PlayCircle, CheckCircle2 
} from 'lucide-react';
import io from 'socket.io-client';

let socket;

const STATUS_OPTIONS = [
  'Accepted', 'Picked Up', 'Sorting', 'Washing', 
  'Drying', 'Ironing', 'Packaging', 'Quality Check', 
  'Ready For Pickup', 'Completed'
];

const STATUS_PROGRESS = {
  'Accepted': 10,
  'Picked Up': 20,
  'Sorting': 30,
  'Washing': 45,
  'Drying': 55,
  'Ironing': 70,
  'Packaging': 80,
  'Quality Check': 90,
  'Ready For Pickup': 95,
  'Completed': 100
};

export default function WashermanDashboard() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('incoming'); // incoming | active | completed
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    // FIX 1: Remove '/api' from the URL because Socket.IO connects to the root domain
    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    
    // FIX 2: Add transports and credentials for stable Railway/Vercel connection
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    if (user?._id) {
      socket.emit('join', user._id);
    }

    // FIX 3: Listen to 'newOrder' event (matches the backend emit event)
    socket.on('newOrder', (newOrder) => {
      console.log('🔔 New Order Received via Socket:', newOrder);
      fetchOrders(); // Refresh the order list immediately
      
      // Optional: Play a sound or show a browser notification here
      // new Audio('/notification.mp3').play(); 
    });

    // Listen to status updates as well
    socket.on('orderStatusUpdated', () => fetchOrders());

    // Cleanup on unmount
    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
      socket.disconnect();
    };
  }, [user?._id]); // Added user?._id as dependency to prevent infinite re-renders

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (e) { console.error(e); }
  };

  // Incoming: unassigned Pending orders
  const incoming = orders.filter(o => o.status === 'Pending' && !o.washerman);
  // Active: assigned to me, accepted but not completed
  const active = orders.filter(o => o.washerman?._id === user._id && o.status !== 'Completed' && o.status !== 'Cancelled');
  // Completed: assigned to me and completed
  const completed = orders.filter(o => o.washerman?._id === user._id && o.status === 'Completed');

  const stats = [
    { title: 'Incoming', value: incoming.length, icon: Inbox, color: '#f59e0b' },
    { title: 'Active', value: active.length, icon: PlayCircle, color: '#3b82f6' },
    { title: 'Completed', value: completed.length, icon: CheckCircle2, color: '#10b981' },
    { title: 'Total Assigned', value: orders.filter(o => o.washerman?._id === user._id).length, icon: Package, color: '#FFD700' }
  ];

  const handleAccept = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await api.put('/orders/accept', { orderId });
      await fetchOrders();
      setTab('active');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to accept');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const progress = STATUS_PROGRESS[status] ?? 50;
      await api.put('/orders/status', { orderId, status, progress });
      await fetchOrders();
      if (status === 'Completed') setTab('completed');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProgressUpdate = async (orderId, progress) => {
    setUpdatingId(orderId);
    try {
      let status;
      if (progress >= 100) status = 'Completed';
      else if (progress >= 90) status = 'Quality Check';
      else if (progress >= 70) status = 'Ironing';
      else if (progress >= 45) status = 'Washing';
      else if (progress >= 20) status = 'Picked Up';
      else status = 'Accepted';

      await api.put('/orders/status', { orderId, status, progress: Number(progress) });
      await fetchOrders();
      if (progress >= 100) setTab('completed');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const list =
    tab === 'incoming' ? incoming :
    tab === 'active' ? active :
    completed;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', margin: 0 }}>
          Operations <span className="gradient-text">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Accept new jobs, update progress, and complete deliveries.
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            className="card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ background: `${s.color}18`, padding: '0.75rem', borderRadius: '12px' }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.6rem', margin: 0 }}>{s.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'incoming', label: 'Incoming', count: incoming.length },
          { id: 'active', label: 'Active Orders', count: active.length },
          { id: 'completed', label: 'Completed', count: completed.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'premium-btn' : 'premium-btn-outline'}
            style={{ padding: '0.7rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {t.label}
            <span style={{
              background: tab === t.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,215,0,0.15)',
              color: tab === t.id ? '#000' : '#FFD700',
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

      {/* Order Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '1.25rem' }}>
        <AnimatePresence mode="popLayout">
          {list.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-3d"
              style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}
            >
              <Package size={40} color="#444" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {tab === 'incoming' && 'No incoming orders right now. New customer requests will appear here.'}
                {tab === 'active' && 'No active orders. Accept an incoming job to get started.'}
                {tab === 'completed' && 'No completed orders yet.'}
              </p>
            </motion.div>
          )}

          {list.map((order, idx) => (
            <motion.div
              key={order._id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.04 }}
              className="card-3d"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>#{order._id.slice(-6).toUpperCase()}</h3>
                  <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {order.serviceType?.name || 'Service'}
                  </p>
                </div>
                <span className={`badge ${
                  order.status === 'Completed' ? 'badge-completed' :
                  order.status === 'Pending' ? 'badge-pending' : 'badge-active'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Customer Info */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                  <User size={15} color="#FFD700" />
                  <span>{order.customer?.name || 'Customer'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#888' }}>
                  <Phone size={15} color="#FFD700" />
                  <span>{order.phone || order.customer?.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#888' }}>
                  <MapPin size={15} color="#FFD700" />
                  <span>
                    {order.pickupAddress?.street}
                    {order.pickupAddress?.city ? `, ${order.pickupAddress.city}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#888' }}>
                  <Clock size={15} color="#FFD700" />
                  <span>
                    Pickup: {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              {/* Progress Bar (Active + Completed) */}
              {tab !== 'incoming' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Progress</span>
                    <span style={{ fontSize: '0.85rem', color: '#FFD700', fontWeight: 600 }}>{order.progress || 0}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${order.progress || 0}%` }}
                      transition={{ duration: 0.6 }}
                      style={{
                        height: '100%',
                        background: order.progress >= 100
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : 'linear-gradient(90deg, #FFD700, #FFA500)',
                        borderRadius: '10px',
                        boxShadow: '0 0 10px rgba(255,215,0,0.3)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Incoming: Accept Button */}
              {tab === 'incoming' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={updatingId === order._id}
                  onClick={() => handleAccept(order._id)}
                  className="premium-btn"
                  style={{ width: '100%', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={18} />
                  {updatingId === order._id ? 'Accepting...' : 'Accept Order'}
                </motion.button>
              )}

              {/* Active: Status + Progress Controls */}
              {tab === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Update Status
                    </label>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="premium-input"
                      style={{ height: '48px', padding: '0 1rem', cursor: 'pointer' }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Progress Slider — Left: {100 - (order.progress || 0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={order.progress || 0}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleProgressUpdate(order._id, e.target.value)}
                      style={{
                        width: '100%',
                        accentColor: '#FFD700',
                        cursor: 'pointer',
                        height: '6px'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#555', marginTop: '0.3rem' }}>
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <button
                    disabled={updatingId === order._id}
                    onClick={() => handleStatusUpdate(order._id, 'Completed')}
                    className="premium-btn-outline"
                    style={{ width: '100%', padding: '0.75rem', borderColor: '#10b981', color: '#10b981' }}
                  >
                    Mark as Completed
                  </button>
                </div>
              )}

              {/* Completed badge */}
              {tab === 'completed' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
                  <CheckCircle2 size={18} /> Job Completed Successfully
                </div>
              )}

              {order.price > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#888' }}>Order Value</span>
                  <span style={{ color: '#FFD700', fontWeight: 700 }}>${order.price}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}