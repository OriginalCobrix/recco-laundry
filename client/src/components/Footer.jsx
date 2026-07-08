import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const TwitterIcon = ({ size = 16, color = '#888' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const InstagramIcon = ({ size = 16, color = '#888' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
);
const LinkedinIcon = ({ size = 16, color = '#888' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);
const GithubIcon = ({ size = 16, color = '#888' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
);

export default function Footer() {
  const socials = [TwitterIcon, InstagramIcon, LinkedinIcon, GithubIcon];

  return (
    <footer style={{ background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255, 215, 0, 0.1)', padding: '4rem 3rem 2rem 3rem', marginTop: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} color="#000" /></div>
            <h3 className="gradient-text" style={{ margin: 0, fontSize: '1.4rem' }}>RECCO</h3>
          </div>
          <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>The next generation laundry management platform. Premium care, real-time tracking, and effortless dispatch.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {socials.map((Icon, i) => (
              <div key={i} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                <Icon size={16} color="#888" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: '#fff' }}>Company</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {['About Us', 'Our Services', 'Pricing', 'Careers'].map(link => <Link key={link} to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>{link}</Link>)}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: '#fff' }}>Support</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {['Contact Us', 'FAQs', 'Terms of Service', 'Privacy Policy'].map(link => <Link key={link} to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>{link}</Link>)}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: '#fff' }}>Stay Updated</h4>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Subscribe to our newsletter for the latest updates.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="email" placeholder="Email address" style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            <button className="premium-btn" style={{ padding: '0.8rem 1rem' }}>→</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>© 2024 RECCO Technologies. All rights reserved.</p>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>Crafted with premium care.</p>
      </div>
    </footer>
  );
}