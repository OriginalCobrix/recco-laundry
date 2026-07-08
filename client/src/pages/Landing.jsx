import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Truck, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    { icon: Zap, title: 'Express Delivery', desc: 'Get your premium laundry cleaned and delivered within 24 hours.' },
    { icon: ShieldCheck, title: 'Quality Assurance', desc: 'Multi-point quality check ensures your garments are treated with care.' },
    { icon: Truck, title: 'Doorstep Pickup', desc: 'Schedule a pickup in 2 clicks. Track your order in real-time.' }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero Section */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem', position: 'relative' }}>
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '20px', marginBottom: '2rem' }}
          >
            <Sparkles size={16} color="var(--yellow)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--yellow)' }}>Next-Gen Laundry SaaS Platform</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Laundry Made <br /> <span className="gradient-text">Effortless.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2.5rem' }}>
            Enterprise-grade laundry management for Customers, Washermen, and Admins. Real-time tracking, automated dispatch, and premium care.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button onClick={() => navigate('/login')} className="premium-btn" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
              Get Started
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              className="card-3d"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
              style={{ padding: '2.5rem', perspective: 1000 }}
            >
              <div style={{ background: 'rgba(255,215,0,0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <feat.icon size={28} color="var(--yellow)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}