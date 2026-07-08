import { motion } from 'framer-motion';
import { Target, Eye, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div style={{ paddingTop: '10rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>Redefining <span className="gradient-text">Laundry Care</span></h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>We're on a mission to make laundry effortless through technology and premium care.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '6rem', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Our Story</h2>
          <p style={{ color: '#888', lineHeight: 1.8, marginBottom: '1rem' }}>Founded in 2024, RECCO started with a simple idea: laundry should consume your time, not your day. We saw a gap between traditional laundry services and modern customer expectations.</p>
          <p style={{ color: '#888', lineHeight: 1.8 }}>By building a unified platform connecting customers, washermen, and administrators, we've created an ecosystem where transparency, speed, and quality are guaranteed.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {[
            { icon: Users, value: '10k+', label: 'Happy Users' },
            { icon: Award, value: '50k+', label: 'Orders Done' },
            { icon: Target, value: '99%', label: 'On-Time Rate' },
            { icon: Eye, value: '24/7', label: 'Support' }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <s.icon size={32} color="#FFD700" style={{ marginBottom: '1rem', margin: '0 auto 1rem auto' }} />
              <h3 className="gradient-text" style={{ fontSize: '2rem', margin: '0 0 0.3rem 0' }}>{s.value}</h3>
              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {[
          { icon: Target, title: 'Our Mission', desc: 'To eliminate the friction of laundry management through real-time tracking and automated dispatch.' },
          { icon: Eye, title: 'Our Vision', desc: 'To be the global standard infrastructure that powers all localized laundry and dry-cleaning businesses.' }
        ].map((v, i) => (
          <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ padding: '2.5rem' }}>
            <div style={{ background: 'rgba(255,215,0,0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <v.icon size={24} color="#FFD700" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>{v.title}</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}