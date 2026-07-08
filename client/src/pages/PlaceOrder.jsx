import { useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // <-- Custom Toast
import { Calendar, MapPin, CreditCard, Package, Loader2 } from 'lucide-react';

export default function PlaceOrder() {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast(); // <-- Custom Toast
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceType: '', pickupDate: '', deliveryDate: '', phone: user?.phone || '',
    pickupAddress: { street: '', city: '', state: '', zipCode: '' },
    paymentMethod: 'Pay At Office', deliveryType: 'Normal', specialInstructions: ''
  });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
      if (res.data.length > 0) setFormData(prev => ({ ...prev, serviceType: res.data[0]._id }));
    } catch (e) { console.error(e); } finally { setLoadingServices(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceType) return showToast('Please select a service first.', 'warning'); // <-- Custom Toast
    setSubmitting(true);
    try {
      await api.post('/orders', formData);
      showToast('Order placed successfully!', 'success'); // <-- Custom Toast
      navigate('/customer-dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to place order. Please try again.', 'error'); // <-- Custom Toast
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find(s => s._id === formData.serviceType);

  return (
    <DashboardLayout>
      <div className="place-order-page">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <h1 className="page-title gradient-text">Schedule Pickup</h1>
          <p className="page-subtitle">Premium laundry at your doorstep.</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="card-3d place-order-form" initial={{ opacity: 0, rotateX: -10, y: 50 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="form-group">
            <label className="form-label">Select Service</label>
            {loadingServices ? (
              <div className="loading-text"><Loader2 size={18} className="animate-spin" /> Loading services...</div>
            ) : services.length === 0 ? (
              <p className="error-text">No services available. Please contact admin.</p>
            ) : (
              <>
                <select className="premium-select" value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} required>
                  {services.map(s => (<option key={s._id} value={s._id} style={{ background: '#111' }}>{s.name} - ${s.price} ({s.priceType})</option>))}
                </select>
                {selectedService && <p className="service-desc">{selectedService.description}</p>}
              </>
            )}
          </div>
          <div className="form-divider"></div>
          <div className="form-grid-2">
            <div className="form-group"><label className="form-label-icon"><Calendar size={14} /> Pickup Date</label><input className="premium-input" type="date" onChange={(e) => setFormData({...formData, pickupDate: e.target.value})} required /></div>
            <div className="form-group"><label className="form-label-icon"><Calendar size={14} /> Delivery Date</label><input className="premium-input" type="date" onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="premium-input" type="text" defaultValue={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
          <div className="form-divider"></div>
          <h3 className="section-icon-title"><MapPin size={18} /> Pickup Address</h3>
          <div className="form-group"><input className="premium-input" type="text" placeholder="Street Address" onChange={(e) => setFormData({...formData, pickupAddress: {...formData.pickupAddress, street: e.target.value}})} required /></div>
          <div className="form-grid-2">
            <div className="form-group"><input className="premium-input" type="text" placeholder="City" onChange={(e) => setFormData({...formData, pickupAddress: {...formData.pickupAddress, city: e.target.value}})} required /></div>
            <div className="form-group"><input className="premium-input" type="text" placeholder="State / Province" onChange={(e) => setFormData({...formData, pickupAddress: {...formData.pickupAddress, state: e.target.value}})} required /></div>
          </div>
          <div className="form-divider"></div>
          <div className="form-group">
            <label className="form-label">Special Instructions (Optional)</label>
            <textarea className="premium-input form-textarea" placeholder="e.g., Wash whites separately, mild detergent, etc." onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}></textarea>
          </div>
          <div className="form-grid-2">
            <div className="form-group"><label className="form-label-icon"><Package size={14} /> Delivery Type</label><select className="premium-select" onChange={(e) => setFormData({...formData, deliveryType: e.target.value})}><option value="Normal">Normal (48 Hours)</option><option value="Express">Express (24 Hours)</option></select></div>
            <div className="form-group"><label className="form-label-icon"><CreditCard size={14} /> Payment Method</label><select className="premium-select" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}><option value="Pay At Office">Pay At Office</option><option value="WhatsApp Payment">WhatsApp Payment</option></select></div>
          </div>
          {selectedService && (<div className="price-display"><span>Estimated Total</span><span className="price-value">${selectedService.price}</span></div>)}
          <motion.button type="submit" className="premium-btn submit-btn" disabled={submitting || !formData.serviceType} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{submitting ? 'Placing Order...' : 'Confirm & Schedule Pickup'}</motion.button>
        </motion.form>
      </div>

      <style>{`
        .place-order-page { max-width: 800px; margin: 0 auto; width: 100%; }
        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: clamp(1.8rem, 4vw, 2.5rem); margin: 0 0 0.5rem 0; font-family: 'Sora', sans-serif; }
        .page-subtitle { color: var(--text-muted); margin: 0; font-size: 1rem; }
        .place-order-form { padding: 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .form-label-icon { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
        .form-textarea { resize: vertical; min-height: 80px; padding: 1rem; }
        .form-divider { height: 1px; background: var(--border-color); margin: 0.5rem 0; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .section-icon-title { font-size: 1.1rem; color: var(--yellow); display: flex; align-items: center; gap: 0.5rem; margin: 0; font-family: 'Sora', sans-serif; }
        .loading-text { display: flex; align-items: center; gap: 0.5rem; color: #888; }
        .error-text { color: #ef4444; }
        .service-desc { font-size: 0.85rem; color: #888; margin-top: 0.5rem; }
        .price-display { background: rgba(255,215,0,0.05); padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid rgba(255,215,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .price-value { font-size: 1.5rem; font-weight: 700; color: #FFD700; font-family: 'Sora', sans-serif; }
        .submit-btn { margin-top: 1rem; width: 100%; height: 56px; font-size: 1.1rem; }
        @media (max-width: 768px) { .place-order-form { padding: 1.5rem; } .form-grid-2 { grid-template-columns: 1fr; gap: 1rem; } }
        @media (max-width: 480px) { .place-order-form { padding: 1.2rem; } .price-display { padding: 0.8rem 1rem; } .price-value { font-size: 1.2rem; } }
      `}</style>
    </DashboardLayout>
  );
}