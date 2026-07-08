import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [washermen, setWashermen] = useState([]);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchStats();
    fetchWashermen();
  }, []);

  const fetchStats = async () => {
    try { const res = await api.get('/admin/stats'); setStats(res.data); } catch (e) { console.error(e); }
  };

  const fetchWashermen = async () => {
    try { 
      const res = await api.get('/users'); 
      setWashermen(res.data.filter(u => u.role === 'Washerman')); 
    } catch (e) { console.error(e); }
  };

  const handleApproval = async (id, action) => {
    try {
      const payload = { washermanId: id, action };
      if (action === 'Reject' && rejectingId === id) {
        payload.rejectionReason = rejectReason;
      }
      await api.put('/admin/washerman-approval', payload);
      setRejectingId(null);
      setRejectReason('');
      fetchWashermen();
    } catch (e) { console.error(e); }
  };

  const revenueData = [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 }, { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 8000 }
  ];
  const orderPieData = [
    { name: 'Active', value: stats.activeOrders || 0 },
    { name: 'Completed', value: stats.completedOrders || 0 },
    { name: 'Pending', value: stats.todayOrders || 0 }
  ];
  const PIE_COLORS = ['#FFD700', '#10b981', '#f59e0b'];

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue || 0}`, icon: DollarSign, color: '#10b981' },
    { title: 'Total Orders', value: (stats.todayOrders || 0) + (stats.activeOrders || 0) + (stats.completedOrders || 0), icon: ShoppingBag, color: '#FFD700' },
    { title: 'Total Customers', value: stats.totalCustomers || 0, icon: Users, color: '#3b82f6' },
    { title: 'Pending Washermen', value: stats.pendingWashermen || 0, icon: Clock, color: '#ef4444' }
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Admin <span className="gradient-text">Control Center</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor metrics, manage users, and oversee operations.</p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((stat, i) => (
          <motion.div key={i} className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</p>
                <h3 style={{ fontSize: '2rem' }}>{stat.value}</h3>
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

      {/* Enterprise Washerman Approval Table */}
      <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Washerman Approvals & Management</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {washermen.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No Washermen registered yet.</td>
                </tr>
              )}
              {washermen.map((w) => (
                <tr key={w._id}>
                  <td style={{ fontWeight: 600 }}>{w.name}</td>
                  <td>{w.email}</td>
                  <td>{w.phone}</td>
                  <td>
                    <span className={`badge ${w.approvalStatus === 'Active' ? 'badge-active' : w.approvalStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                      {w.approvalStatus}
                    </span>
                    {w.approvalStatus === 'Rejected' && w.rejectionReason && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Reason: {w.rejectionReason}</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {w.approvalStatus === 'Pending Approval' && (
                      <>
                        <button onClick={() => handleApproval(w._id, 'Approve')} className="premium-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={14} /> Approve
                        </button>
                        {rejectingId === w._id ? (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <input 
                              type="text" 
                              placeholder="Reason..." 
                              value={rejectReason} 
                              onChange={(e) => setRejectReason(e.target.value)} 
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem', color: '#fff', width: '120px' }}
                            />
                            <button onClick={() => handleApproval(w._id, 'Reject')} className="premium-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}>Save</button>
                          </div>
                        ) : (
                          <button onClick={() => setRejectingId(w._id)} className="premium-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <XCircle size={14} /> Reject
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .admin-charts {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}