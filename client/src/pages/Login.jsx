import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const PremiumInput = ({ icon: Icon, type, placeholder, name, value, onChange, isFocused, setIsFocused, rightIcon }) => {
  const isFloating = isFocused || value.length > 0;

  return (
    <div style={{ position: 'relative', height: '64px', marginBottom: '1.2rem' }}>
      <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, color: isFocused ? '#FFD700' : '#555', transition: 'color 0.3s ease', display: 'flex', alignItems: 'center' }}>
        <Icon size={20} />
      </div>
      <input type={type} name={name} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} required style={{ width: '100%', height: '100%', padding: '22px 50px 0 50px', boxSizing: 'border-box', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${isFocused ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '14px', color: '#f5f5f5', fontSize: '1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: isFocused ? '0 0 0 4px rgba(255, 215, 0, 0.05)' : 'none' }} />
      <label style={{ position: 'absolute', left: '50px', top: isFloating ? '12px' : '50%', transform: isFloating ? 'translateY(0)' : 'translateY(-50%)', fontSize: isFloating ? '0.7rem' : '1rem', color: isFloating ? '#FFD700' : '#666', pointerEvents: 'none', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{placeholder}</label>
      {rightIcon && <div onClick={rightIcon.onClick} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#555', zIndex: 2, display: 'flex', alignItems: 'center' }}>{rightIcon.visible ? <EyeOff size={20} /> : <Eye size={20} />}</div>}
    </div>
  );
};

const Particle = ({ delay, duration, size, left }) => (
  <motion.div initial={{ y: '100vh', opacity: 0 }} animate={{ y: '-10vh', opacity: [0, 1, 0] }} transition={{ duration, delay, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: '#FFD700', filter: 'blur(2px)', left, boxShadow: '0 0 10px #FFD700' }} />
);

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'Customer' });
  const { login } = useContext(AuthContext);
  const { showToast } = useToast(); // <-- Custom Toast
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(formData.email, formData.password);
        if (user.role === 'Admin') navigate('/admin');
        else navigate(`/${user.role.toLowerCase()}-dashboard`);
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true);
        showToast('Registration successful! Please login.', 'success'); // <-- Custom Toast
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong', 'error'); // <-- Custom Toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', backgroundColor: '#050505', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <motion.div animate={{ x: [0, 500, 0], y: [0, 300, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '20%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <Particle delay={0} duration={10} size={4} left="10%" /><Particle delay={2} duration={12} size={6} left="30%" /><Particle delay={5} duration={8} size={3} left="70%" /><Particle delay={1} duration={15} size={5} left="85%" /><Particle delay={7} duration={11} size={4} left="50%" />
      </div>

      <PublicNavbar />

      <div className="split-content" style={{ display: 'flex', flex: 1, zIndex: 5, marginTop: '80px' }}>
        <motion.div className="left-panel" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 4rem', borderRight: '1px solid rgba(255, 215, 0, 0.05)' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.1, margin: '0 0 1.5rem 0' }}>The Future of <br /> <span className="gradient-text">Premium Laundry.</span></motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ color: '#888', fontSize: '1.1rem', maxWidth: '450px', margin: '0 0 3rem 0', lineHeight: 1.6 }}>Enterprise-grade management for customers, washermen, and admins. Real-time tracking, automated dispatch, and analytics at your fingertips.</motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, rotateY: [0, 5, 0, -5, 0], y: [0, -10, 0] }} transition={{ delay: 0.6, duration: 0.8, rotateY: { delay: 1.5, duration: 8, repeat: Infinity, ease: 'easeInOut' }, y: { delay: 1.5, duration: 4, repeat: Infinity, ease: 'easeInOut' } }} className="glass-card" style={{ maxWidth: '400px', padding: '1.8rem', transformStyle: 'preserve-3d', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div><p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 0.3rem 0' }}>Live Order Status</p><h4 style={{ fontSize: '1.1rem', margin: 0 }}>Order #RECCO8472</h4></div>
              <span className="badge badge-active">In Progress</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.2rem' }}><motion.div initial={{ width: '0%' }} animate={{ width: '75%' }} transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #FFD700, #FFA500)', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFD700' }}><ShieldCheck size={16} /> Quality Check Passed</div><div style={{ color: '#888' }}>Est. 2:00 PM</div></div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem' }}>
            <div><h3 className="gradient-text" style={{ fontSize: '1.6rem', margin: '0 0 0.2rem 0' }}>10k+</h3><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Active Users</p></div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div><h3 className="gradient-text" style={{ fontSize: '1.6rem', margin: '0 0 0.2rem 0' }}>4.9/5</h3><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Customer Rating</p></div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div><h3 className="gradient-text" style={{ fontSize: '1.6rem', margin: '0 0 0.2rem 0' }}>24h</h3><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Express Delivery</p></div>
          </motion.div>
        </motion.div>

        <div className="right-panel" style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem clamp(1.2rem, 5vw, 4rem)' }}>
          <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '5px', marginBottom: '2rem', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
              {['Login', 'Register'].map((tab) => (
                <button key={tab} onClick={() => setIsLogin(tab === 'Login')} style={{ flex: 1, padding: '0.8rem 2rem', background: 'transparent', border: 'none', color: isLogin === (tab === 'Login') ? '#000' : '#888', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', zIndex: 2, transition: 'color 0.3s ease', position: 'relative', fontSize: '0.95rem' }}>
                  {tab}
                  {isLogin === (tab === 'Login') && <motion.div layoutId="activeTab" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '8px', zIndex: -1, boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                </button>
              ))}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, x: isLogin ? -15 : 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isLogin ? 15 : -15 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.8rem)', margin: '0 0 0.5rem 0' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p style={{ color: '#666', margin: '0 0 1.8rem 0', fontSize: '0.95rem' }}>{isLogin ? 'Enter your credentials to access your dashboard' : 'Start your premium laundry journey today'}</p>
                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      <PremiumInput icon={User} type="text" placeholder="Full Name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} isFocused={focusedField === 'name'} setIsFocused={(v) => setFocusedField(v ? 'name' : null)} />
                      <PremiumInput icon={Phone} type="text" placeholder="Phone Number" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} isFocused={focusedField === 'phone'} setIsFocused={(v) => setFocusedField(v ? 'phone' : null)} />
                    </>
                  )}
                  <PremiumInput icon={Mail} type="email" placeholder="Email Address" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} isFocused={focusedField === 'email'} setIsFocused={(v) => setFocusedField(v ? 'email' : null)} />
                  <PremiumInput icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} isFocused={focusedField === 'password'} setIsFocused={(v) => setFocusedField(v ? 'password' : null)} rightIcon={{ visible: showPassword, onClick: () => setShowPassword(!showPassword) }} />
                  {!isLogin && (
                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
                      {['Customer', 'Washerman'].map((role) => (
                        <div key={role} onClick={() => setFormData({...formData, role})} style={{ flex: 1, padding: '0.9rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: formData.role === role ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${formData.role === role ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255,255,255,0.08)'}`, color: formData.role === role ? '#FFD700' : '#666', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.85rem' }}>{role}</div>
                      ))}
                    </div>
                  )}
                  {isLogin && <div style={{ textAlign: 'right', margin: '0 0 1.5rem 0' }}><span style={{ color: '#FFD700', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span></div>}
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', height: '56px', background: loading ? '#222' : 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(255, 215, 0, 0.2)', transition: 'all 0.3s ease', margin: '0 0 1.5rem 0' }}>
                    {loading ? 'Processing...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}{!loading && <ArrowRight size={20} />}
                  </motion.button>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .left-panel { padding: 2rem !important; } .right-panel { padding: 2rem 2rem !important; } }
        @media (max-width: 768px) { .split-content { flex-direction: column !important; margin-top: 80px !important; padding-bottom: 40px; min-height: calc(100vh - 80px); } .left-panel { display: none !important; } .right-panel { width: 100% !important; padding: 2rem 1.5rem !important; } }
        @media (max-width: 480px) { .right-panel { padding: 1.5rem 1.2rem !important; } .right-panel > div { max-width: 100% !important; } }
      `}</style>
    </div>
  );
}