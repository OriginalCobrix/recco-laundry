import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="orb orb-1" style={{ width: '600px', height: '600px', background: '#FFD700', top: '-20%', left: '-10%', filter: 'blur(120px)', opacity: '0.15' }}></div>
        <div className="orb orb-2" style={{ width: '500px', height: '500px', background: '#FFA500', bottom: '-20%', right: '-10%', filter: 'blur(120px)', opacity: '0.15' }}></div>
      </div>
      <PublicNavbar />
      <main style={{ flex: 1, width: '100%' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}