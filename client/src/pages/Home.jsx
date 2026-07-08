import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  
  // Parallax effects for desktop
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.5], [0, 15]);
  const cardY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  const features = [
    { icon: Zap, title: 'Express Delivery', desc: 'Get your premium laundry cleaned and delivered within 24 hours. We never compromise on speed.' },
    { icon: ShieldCheck, title: 'Quality Assurance', desc: 'Multi-point quality check ensures your garments are treated with utmost care and precision.' },
    { icon: Truck, title: 'Doorstep Pickup', desc: 'Schedule a pickup in 2 clicks. Track your order in real-time from dashboard to delivery.' },
    { icon: Clock, title: '24/7 Support', desc: 'Our dedicated support team is always available to assist you with any queries or issues.' }
  ];

  return (
    <div ref={ref} className="home-container">
      
      {/* HERO SECTION */}
      <section className="hero-section">
        <motion.div className="hero-content" style={{ y: heroTextY, opacity: heroTextOpacity }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="hero-badge"
          >
            <Sparkles size={16} color="#FFD700" />
            <span>Next-Gen Laundry SaaS Platform</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="hero-title"
          >
            Laundry Made <br /><span className="gradient-text">Effortless.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="hero-desc"
          >
            Enterprise-grade laundry management for Customers, Washermen, and Admins. Real-time tracking, automated dispatch, and premium care at your fingertips.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="hero-actions"
          >
            <Link to="/login" className="premium-btn hero-cta-btn">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/services" className="premium-btn-outline hero-cta-btn">
              Explore Services
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating 3D Card in Hero */}
        <motion.div 
          className="hero-card-wrapper"
          style={{ rotateX: cardRotateX, y: cardY }}
          initial={{ opacity: 0, x: 100 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="glass-card hero-card-inner">
            <div className="hero-card-header">
              <div>
                <p className="hero-card-subtitle">Live Order</p>
                <h4 className="hero-card-title">Order #RECCO8472</h4>
              </div>
              <span className="badge badge-active">In Progress</span>
            </div>
            <div className="hero-card-progress-track">
              <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ delay: 1, duration: 1.5 }} className="hero-card-progress-bar" />
            </div>
            <div className="hero-card-footer">
              <span className="hero-card-status"><ShieldCheck size={14} /> Quality Check</span>
              <span className="hero-card-eta">Est. 2:00 PM</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { value: '10k+', label: 'Active Users' },
            { value: '50k+', label: 'Orders Completed' },
            { value: '4.9/5', label: 'Customer Rating' },
            { value: '24h', label: 'Express Delivery' }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1 }}
              className="stat-item"
            >
              <h2 className="stat-value">{stat.value}</h2>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="section-header"
        >
          <h2 className="section-title">Why Choose <span className="gradient-text">RECCO?</span></h2>
          <p className="section-desc">We combine cutting-edge technology with premium laundry care to give you the best experience possible.</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feat, i) => (
            <motion.div 
              key={i} 
              className="glass-card feature-card"
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
            >
              <div className="feature-icon-box">
                <feat.icon size={28} color="#FFD700" />
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }}
          className="glass-card cta-card"
        >
          <h2 className="cta-title">Ready to Experience <span className="gradient-text">Premium Laundry?</span></h2>
          <p className="cta-desc">Join thousands of satisfied customers who have made the switch to RECCO.</p>
          <Link to="/login" className="premium-btn cta-btn">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Premium Responsive CSS */}
      <style>{`
        .home-container {
          overflow-x: hidden;
        }

        /* HERO SECTION */
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
          padding: 10rem 4rem 4rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .hero-content {
          flex: 1;
          max-width: 650px;
          z-index: 2;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }
        .hero-badge span {
          font-size: 0.85rem;
          color: #FFD700;
          font-weight: 500;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 5rem);
          line-height: 1.1;
          margin: 0 0 1.5rem 0;
          font-family: 'Sora', sans-serif;
        }
        .hero-desc {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #888;
          margin: 0 0 2.5rem 0;
          line-height: 1.6;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .hero-cta-btn {
          padding: 1.2rem 2.5rem !important;
          font-size: 1.1rem !important;
          text-decoration: none;
          display: flex !important;
          align-items: center;
          gap: 0.5rem;
        }

        /* HERO CARD */
        .hero-card-wrapper {
          flex: 0 0 400px;
          transform-style: preserve-3d;
          perspective: 1000px;
          z-index: 2;
        }
        .hero-card-inner {
          padding: 2rem;
        }
        .hero-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .hero-card-subtitle {
          color: #888;
          font-size: 0.8rem;
          margin: 0 0 0.3rem 0;
        }
        .hero-card-title {
          margin: 0;
          font-size: 1.2rem;
        }
        .hero-card-progress-track {
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .hero-card-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #FFD700, #FFA500);
        }
        .hero-card-footer {
          display: flex;
          justify-content: space-between;
          color: #888;
          font-size: 0.85rem;
        }
        .hero-card-status {
          color: #FFD700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* STATS SECTION */
        .stats-section {
          padding: 3rem 4rem;
          background: rgba(10,10,10,0.5);
          border-top: 1px solid rgba(255,215,0,0.05);
          border-bottom: 1px solid rgba(255,215,0,0.05);
        }
        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          text-align: center;
        }
        .stat-value {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 0 0 0.5rem 0;
          font-family: 'Sora', sans-serif;
        }
        .stat-label {
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.85rem;
        }

        /* FEATURES SECTION */
        .features-section {
          padding: 6rem 4rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 0 0 1rem 0;
          font-family: 'Sora', sans-serif;
        }
        .section-desc {
          color: #666;
          max-width: 600px;
          margin: 0 auto;
          font-size: 1.1rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .feature-card {
          padding: 2.5rem;
          transform-style: preserve-3d;
        }
        .feature-icon-box {
          background: rgba(255,215,0,0.1);
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .feature-title {
          font-size: 1.5rem;
          margin: 0 0 0.8rem 0;
          font-family: 'Sora', sans-serif;
        }
        .feature-desc {
          color: #666;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        /* CTA SECTION */
        .cta-section {
          padding: 4rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cta-card {
          padding: clamp(2.5rem, 5vw, 4rem);
          text-align: center;
          background: radial-gradient(circle at center, rgba(255,215,0,0.05) 0%, transparent 70%);
        }
        .cta-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin: 0 0 1rem 0;
          font-family: 'Sora', sans-serif;
        }
        .cta-desc {
          color: #666;
          font-size: 1.1rem;
          max-width: 500px;
          margin: 0 auto 2rem auto;
        }
        .cta-btn {
          padding: 1.2rem 3rem !important;
          font-size: 1.1rem !important;
          text-decoration: none;
          display: inline-flex !important;
          align-items: center;
          gap: 0.5rem;
        }

        /* RESPONSIVE BREAKPOINTS */
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-section {
            padding: 8rem 2rem 4rem 2rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column;
            text-align: center;
            justify-content: center;
            padding-top: 8rem;
            gap: 3rem;
          }
          .hero-content {
            max-width: 100%;
          }
          .hero-badge {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-card-wrapper {
            flex: 1 1 100%;
            width: 100%;
            max-width: 400px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
          }
          .stats-section, .features-section, .cta-section {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          .features-section {
            padding-top: 4rem;
            padding-bottom: 4rem;
          }
        }

        @media (max-width: 480px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hero-cta-btn {
            width: 100%;
            justify-content: center;
          }
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .feature-card {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}