import { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Shield, Trash2, AlertTriangle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try { 
      const res = await api.get('/users'); 
      setUsers(res.data); 
    } catch (e) { 
      console.error(e); 
    }
  };

  // ✅ NEW: Delete User Function
  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteModal._id}`);
      setDeleteModal(null);
      await fetchUsers();
      alert('User deleted successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = filter === 'All' ? users : users.filter(u => u.role === filter);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>User <span className="gradient-text">Management</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>View and manage all platform users.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['All', 'Customer', 'Admin'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={filter === f ? 'premium-btn' : 'premium-btn-outline'} 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            {f} ({f === 'All' ? users.length : users.filter(u => u.role === f).length})
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
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No users found.
                  </td>
                </tr>
              )}
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#aaa' }}>
                      <Mail size={14} /> {u.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>
                      <Phone size={14} /> {u.phone || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFD700' }}>
                      <Shield size={14} /> {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.approvalStatus === 'Active' ? 'badge-active' : 
                      u.approvalStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'
                    }`}>
                      {u.approvalStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#888' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setDeleteModal(u)}
                      className="premium-btn-outline"
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        color: '#ef4444', 
                        borderColor: '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ✅ Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
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
            onClick={() => !deleting && setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-3d"
              style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  background: 'rgba(239,68,68,0.1)', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={32} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#ef4444' }}>Delete User</h3>
                  <p style={{ margin: '0.3rem 0 0 0', color: '#888', fontSize: '0.9rem' }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '1rem', 
                borderRadius: '12px', 
                marginBottom: '1.5rem' 
              }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem' }}>
                  Are you sure you want to delete:
                </p>
                <div style={{ 
                  padding: '0.8rem', 
                  background: 'rgba(239,68,68,0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.2)'
                }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{deleteModal.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.3rem' }}>
                    {deleteModal.email} • {deleteModal.role}
                  </div>
                </div>
                <p style={{ 
                  margin: '1rem 0 0 0', 
                  color: '#ef4444', 
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  ⚠️ This will also delete all orders associated with this user!
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="premium-btn"
                  style={{ 
                    flex: 1, 
                    background: '#ef4444', 
                    borderColor: '#ef4444',
                    opacity: deleting ? 0.7 : 1
                  }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete User'}
                </button>
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  className="premium-btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}