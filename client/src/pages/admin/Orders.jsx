import { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [washermen, setWashermen] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchWashermen();
  }, []);

  const fetchOrders = async () => {
    try { const res = await api.get('/orders/all'); setOrders(res.data); } catch (e) { console.error(e); }
  };

  const fetchWashermen = async () => {
    try { 
      const res = await api.get('/users'); 
      setWashermen(res.data.filter(u => u.role === 'Washerman' && u.approvalStatus === 'Active')); 
    } catch (e) { console.error(e); }
  };

  const handleAssign = async (orderId, washermanId) => {
    try {
      await api.put('/admin/assign-order', { orderId, washermanId });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handlePaymentReceived = async (orderId) => {
    try {
      await api.put(`/payments/verify/${orderId}`, { status: 'Received' });
      fetchOrders(); // Refresh orders to show updated status
    } catch (e) { 
      alert(e.response?.data?.message || 'Failed to update payment'); 
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Order <span className="gradient-text">Management</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Track all platform orders, assign washermen, and verify payments.</p>
      </motion.div>

      <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Price</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Assign Washerman</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No Orders yet.</td></tr>
              )}
              {orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 600 }}>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.customer?.name || 'N/A'}</td>
                  <td>${o.price || 0}</td>
                  <td>
                    <span className={`badge ${o.status === 'Completed' ? 'badge-completed' : o.status === 'Cancelled' ? 'badge-cancelled' : 'badge-active'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                      <span className={`badge ${o.paymentStatus === 'Received' ? 'badge-received' : 'badge-pending'}`}>
                        {o.paymentStatus}
                      </span>
                      {o.paymentStatus !== 'Received' && o.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handlePaymentReceived(o._id)} 
                          className="premium-btn-outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <DollarSign size={12} /> Mark Received
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    {o.washerman ? (
                      <span style={{ color: '#10b981', fontSize: '0.9rem' }}>{o.washerman.name}</span>
                    ) : (
                      <select 
                        onChange={(e) => handleAssign(o._id, e.target.value)} 
                        defaultValue="" 
                        style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', padding: '0.5rem', borderRadius: '8px', outline: 'none' }}
                      >
                        <option value="" disabled>Assign...</option>
                        {washermen.map(w => (
                          <option key={w._id} value={w._id}>{w.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}