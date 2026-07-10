import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Users, LogOut, Settings, Bell, Package } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = {
    Customer: [
      { name: 'Dashboard', path: '/customer-dashboard', icon: LayoutDashboard }
    ],
    Admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Orders', path: '/admin/orders', icon: Package },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Services', path: '/admin/services', icon: Settings }
    ]
  };

  if (!user) return null;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header logo-area">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="gradient-text sidebar-logo-text">RECO</h1>
          </motion.div>
        </div>
        <nav className="sidebar-nav">
          {links[user.role]?.map((link, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={link.path} className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}>
                <link.icon size={20} className="sidebar-icon" />
                <span className="sidebar-text">{link.name}</span>
              </Link>
            </motion.div>
          ))}
          <button onClick={handleLogout} className="sidebar-link mobile-logout-btn">
            <LogOut size={20} className="sidebar-icon" />
            <span className="sidebar-text">Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer profile-area">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="sidebar-profile-box">
              <div className="sidebar-avatar">{user?.name?.charAt(0)}</div>
              <div className="profile-details">
                <p className="sidebar-username">{user?.name}</p>
                <p className="sidebar-userrole">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="sidebar-link logout-btn">
              <LogOut size={20} /> <span>Logout</span>
            </button>
          </motion.div>
        </div>
      </aside>
      <main className="main-content">
        <div className="main-bell-wrapper">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="bell-icon-wrapper">
            <Bell size={24} color="var(--text-muted)" />
            <span className="bell-badge">3</span>
          </motion.div>
        </div>
        {children}
      </main>

      <style>{`
        .app-layout { display: flex; min-height: 100vh; background: #050505; }
        .sidebar { width: 260px; background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(20px); border-right: 1px solid var(--border-color); padding: 2rem 1rem; height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; z-index: 50; }
        .logo-area { margin-bottom: 3rem; padding-left: 0.5rem; }
        .sidebar-logo-text { font-size: 1.8rem; font-weight: 800; margin: 0; font-family: 'Sora', sans-serif; letter-spacing: 0.1em; }
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
        .sidebar-link { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem; border-radius: 12px; color: var(--text-muted); text-decoration: none; font-weight: 500; margin-bottom: 0.2rem; transition: all 0.3s ease; position: relative; background: none; border: none; cursor: pointer; width: 100%; font-family: 'Outfit', sans-serif; font-size: 1rem; text-align: left; }
        .sidebar-link:hover { background: rgba(255, 215, 0, 0.05); color: var(--text-light); }
        .sidebar-link.active { background: rgba(255, 215, 0, 0.1); color: var(--yellow); }
        .sidebar-link.active::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 3px; background: var(--yellow-gradient); border-radius: 2px; }
        .mobile-logout-btn { display: none; }
        .sidebar-footer { margin-top: auto; }
        .sidebar-profile-box { padding: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.8rem; }
        .sidebar-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--yellow-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .profile-details { min-width: 0; }
        .sidebar-username { font-size: 0.9rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-userrole { font-size: 0.75rem; color: var(--text-muted); margin: 0; text-transform: capitalize; }
        .main-content { flex: 1; padding: 2.5rem 3rem; width: calc(100% - 260px); min-width: 0; }
        .main-bell-wrapper { display: flex; justify-content: flex-end; margin-bottom: 2rem; }
        .bell-icon-wrapper { position: relative; cursor: pointer; }
        .bell-badge { position: absolute; top: -5px; right: -5px; background: var(--yellow-gradient); color: #000; font-size: 0.6rem; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 768px) {
          .app-layout { flex-direction: column-reverse; }
          .sidebar { width: 100%; height: auto; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom)); align-items: center; justify-content: space-around; border-top: 1px solid var(--border-color); border-right: none; backdrop-filter: blur(20px); background: rgba(5, 5, 5, 0.95); z-index: 1000; }
          .logo-area, .profile-area { display: none !important; }
          .sidebar-nav { flex-direction: row; width: 100%; gap: 0; justify-content: space-around; align-items: center; }
          .sidebar-link { flex-direction: column; gap: 0.2rem; padding: 0.5rem; margin: 0; font-size: 0.7rem; border-radius: 10px; }
          .sidebar-link.active::before { display: none; }
          .sidebar-link.active { background: transparent; color: var(--yellow); }
          .sidebar-text { font-size: 0.65rem; }
          .mobile-logout-btn { display: flex; color: #ef4444; border-left: 1px solid rgba(255,255,255,0.1); border-radius: 0; padding-left: 1rem; margin-left: 0.5rem; }
          .mobile-logout-btn:hover { background: transparent; color: #ef4444; }
          .main-content { width: 100%; padding: 1.5rem 1rem 6rem 1rem; }
          .main-bell-wrapper { margin-bottom: 1.5rem; }
        }
      `}</style>
    </div>
  );
}