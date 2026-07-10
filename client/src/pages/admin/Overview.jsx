import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, CreditCard, Package, CheckCircle } from 'lucide-react';

export default function AdminOverview() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, [user]);

  const fetchStats = async () => {
    try { const res = await api.get('/admin/stats'); setStats(res.data); } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (e) { console.error(e); }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  const totalPendingPayments = orders.reduce((sum, o) => sum + ((o.price || 0) - (o.paidAmount || 0)), 0);
  const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  const revenueData = [
    { name: 'Jan', revenue: 40000 }, { name: 'Feb', revenue: 30000 }, 
    { name: 'Mar', revenue: 50000 }, { name: 'Apr', revenue: 45000 }, 
    { name: 'May', revenue: 60000 }, { name: 'Jun', revenue: 80000 }
  ];
  const orderPieData = [
    { name: 'Active', value: activeOrders.length },
    { name: 'Completed', value: completedOrders.length },
    { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length }
  ];
  const PIE_COLORS = ['#FFD700', '#10b981', '#f59e0b'];

  const statCards = [
    { title: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#10b981' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: '#FFD700' },
    { title: 'Active Orders', value: activeOrders.length, icon: Package, color: '#3b82f6' },
    { title: 'Pending Payments', value: `Rs. ${totalPendingPayments.toLocaleString()}`, icon: CreditCard, color: '#ef4444' }
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Admin <span className="gradient-text">Control Center</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor metrics, manage orders, and handle payments.</p>
      </motion.div>

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

      <style>{`
        @media (max-width: 768px) {
          .admin-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}