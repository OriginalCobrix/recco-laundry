import { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, Edit3, XCircle } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, priceType: 'Fixed', category: 'Wash & Fold' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try { const res = await api.get('/services'); setServices(res.data); } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure price is sent as a Number
      const payload = { ...formData, price: Number(formData.price) };
      
      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
      } else {
        await api.post('/services', payload);
      }
      
      setFormData({ name: '', description: '', price: 0, priceType: 'Fixed', category: 'Wash & Fold' });
      setEditingId(null);
      setShowForm(false);
      fetchServices();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      priceType: service.priceType,
      category: service.category
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchServices();
      } catch (e) { 
        alert(e.response?.data?.message || 'Failed to delete service'); 
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', price: 0, priceType: 'Fixed', category: 'Wash & Fold' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Services <span className="gradient-text">Management</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Add, edit, or remove laundry services.</p>
        </div>
        <button onClick={() => showForm ? handleCancel() : setShowForm(true)} className="premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {showForm ? <XCircle size={20} /> : <PlusCircle size={20} />} 
          {showForm ? 'Cancel' : 'Add Service'}
        </button>
      </motion.div>

      {showForm && (
        <motion.form 
          onSubmit={handleSubmit} 
          className="card-3d" 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          style={{ padding: '2rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
        >
          <input className="premium-input" type="text" placeholder="Service Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input className="premium-input" type="number" placeholder="Price" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
          
          <select className="premium-input" value={formData.priceType} onChange={(e) => setFormData({...formData, priceType: e.target.value})}>
            <option value="Fixed">Fixed</option>
            <option value="Per Kg">Per Kg</option>
            <option value="Per Item">Per Item</option>
          </select>
          
          <select className="premium-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            <option value="Wash & Fold">Wash & Fold</option>
            <option value="Dry Cleaning">Dry Cleaning</option>
            <option value="Premium">Premium</option>
            <option value="Custom">Custom</option>
          </select>
          
          <textarea className="premium-input" placeholder="Description" style={{ gridColumn: '1 / -1', resize: 'vertical' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          
          <button type="submit" className="premium-btn" style={{ gridColumn: '1 / -1' }}>
            {editingId ? 'Update Service' : 'Save Service'}
          </button>
        </motion.form>
      )}

      <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No services added yet. Click "Add Service" to create one.
                  </td>
                </tr>
              )}
              {services.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.category}</td>
                  <td>${s.price} ({s.priceType})</td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-active' : 'badge-cancelled'}`}>
                      {s.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(s)} className="premium-btn-outline" style={{ padding: '0.4rem', color: '#FFD700', borderColor: 'rgba(255,215,0,0.3)' }}>
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="premium-btn-outline" style={{ padding: '0.4rem', color: '#ef4444', borderColor: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          form.card-3d { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}