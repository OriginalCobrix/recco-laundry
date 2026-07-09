import { motion } from 'framer-motion';
import { Target, Eye, Users, Award } from 'lucide-react';
import './About.css'; // CSS file import ki hai

export default function About() {
  return (
    <div className="about-container">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="about-header"
      >
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>
          Redefining <span className="gradient-text">Laundry Care</span>
        </h1>
        <p className="about-subtitle">
          We're on a mission to make laundry effortless through technology and premium care.
        </p>
      </motion.div>

      <div className="about-story-section">
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }}
        >
          <h2 className="story-heading">Our Story</h2>
          <p className="story-text">
            Founded in 2024, RECCO started with a simple idea: laundry should consume your time, not your day. We saw a gap between traditional laundry services and modern customer expectations.
          </p>
          <p className="story-text">
            By building a unified platform connecting customers, washermen, and administrators, we've created an ecosystem where transparency, speed, and quality are guaranteed.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          className="glass-card about-stats-card"
        >
          <div className="stats-grid">
            {[
              { icon: Users, value: '10k+', label: 'Happy Users' },
              { icon: Award, value: '50k+', label: 'Orders Done' },
              { icon: Target, value: '99%', label: 'On-Time Rate' },
              { icon: Eye, value: '24/7', label: 'Support' }
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <s.icon size={32} color="#FFD700" style={{ marginBottom: '1rem' }} />
                <h3 className="gradient-text stat-value">{s.value}</h3>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="about-values-section">
        {[
          { icon: Target, title: 'Our Mission', desc: 'To eliminate the friction of laundry management through real-time tracking and automated dispatch.' },
          { icon: Eye, title: 'Our Vision', desc: 'To be the global standard infrastructure that powers all localized laundry and dry-cleaning businesses.' }
        ].map((v, i) => (
          <motion.div 
            key={i} 
            className="glass-card value-card" 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: i * 0.1 }}
          >
            <div className="value-icon-box">
              <v.icon size={24} color="#FFD700" />
            </div>
            <h3 className="value-title">{v.title}</h3>
            <p className="value-desc">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}