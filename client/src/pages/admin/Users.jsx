import { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Mail, Phone, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data); } catch (e) { console.error(e); }
  };

  const filteredUsers = filter === 'All' ? users : users.filter(u => u.role === filter);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>User <span className="gradient-text">Management</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>View and manage all platform users.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['All', 'Customer',  'Admin'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'premium-btn' : 'premium-btn-outline'} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            {f}
          </button>
        ))}
      </div>

      <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#aaa' }}><Mail size={14} /> {u.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}><Phone size={14} /> {u.phone}</div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFD700' }}>
                      <Shield size={14} /> {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.approvalStatus === 'Active' ? 'badge-active' : u.approvalStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                      {u.approvalStatus}
                    </span>
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