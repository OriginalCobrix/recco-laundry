import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', subject: '', message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' }); // Reset form
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '10rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>Get In <span className="gradient-text">Touch</span></h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>Have questions? We're here to help. Reach out and our team will get back to you within 24 hours.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }} className="contact-grid">
        {/* Info Side */}
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="contact-info-side">
          {[
            { icon: Mail, title: 'Email Us', value: 'support@recco.com', desc: 'For any general queries' },
            { icon: Phone, title: 'Call Us', value: '+1 (800) 123-4567', desc: 'Mon-Sat 9am-6pm' },
            { icon: MapPin, title: 'Visit Us', value: '123 Tech Avenue, NY', desc: 'New York, USA' }
          ].map((c, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,215,0,0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={22} color="#FFD700" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.title}</h4>
                <p style={{ margin: '0 0 0.2rem 0', color: '#fff', fontWeight: 600 }}>{c.value}</p>
                <p style={{ margin: 0, color: '#555', fontSize: '0.85rem' }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Form Side */}
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card" style={{ padding: '3rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }} className="form-grid-2">
              <input className="premium-input" type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} style={{ height: '52px' }} />
              <input className="premium-input" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} style={{ height: '52px' }} />
            </div>
            <input className="premium-input" type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} style={{ height: '52px', marginBottom: '1.2rem' }} />
            <input className="premium-input" type="text" name="subject" placeholder="Subject" required value={formData.subject} onChange={handleChange} style={{ height: '52px', marginBottom: '1.2rem' }} />
            <textarea className="premium-input" name="message" placeholder="Your Message" required rows="5" value={formData.message} onChange={handleChange} style={{ padding: '1rem', marginBottom: '1.5rem', resize: 'vertical', minHeight: '120px' }}></textarea>
            
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="premium-btn" 
              disabled={loading}
              style={{ width: '100%', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  Send Message <Send size={18} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .form-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}