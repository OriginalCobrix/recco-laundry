import { motion } from 'framer-motion';
import { Droplets, Shirt, Wind, Sparkles, Crown, Loader2 } from 'lucide-react';

export default function Services() {
  const services = [
    { icon: Droplets, title: 'Wash & Fold', price: '$2.5/lb', desc: 'Everyday laundry washed, dried, and neatly folded.' },
    { icon: Shirt, title: 'Wash & Iron', price: '$3/item', desc: 'Perfectly washed and crisply ironed for a professional look.' },
    { icon: Wind, title: 'Dry Cleaning', price: '$5/item', desc: 'Premium care for your delicate and special garments.' },
    { icon: Sparkles, title: 'Steam Iron', price: '$2/item', desc: 'Quick steam press to remove wrinkles and refresh clothes.' },
    { icon: Crown, title: 'Premium Laundry', price: '$10/item', desc: 'Luxury care for high-end fabrics and designer wear.' },
    { icon: Loader2, title: 'Express Laundry', price: '+50% charge', desc: 'Need it fast? Get your laundry done in 24 hours.' }
  ];

  return (
    <div style={{ paddingTop: '10rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>Our <span className="gradient-text">Premium Services</span></h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>Tailored solutions for every fabric type. Transparent pricing, no hidden charges.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {services.map((s, i) => (
          <motion.div 
            key={i} className="glass-card"
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -10 }} style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1.2rem', background: 'rgba(255,215,0,0.1)', borderBottomLeftRadius: '12px', color: '#FFD700', fontWeight: 600, fontSize: '0.85rem' }}>
              {s.price}
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <s.icon size={28} color="#FFD700" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>{s.title}</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}