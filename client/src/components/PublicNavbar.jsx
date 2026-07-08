import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, Menu, X, LayoutDashboard, LogOut, ArrowRight } from 'lucide-react';

const Magnetic = ({ children, strength = 0.3 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY, display: 'inline-flex' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </motion.div>
  );
};

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setHoveredPath(null); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { name: 'Home', path: '/' }, { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' }, { name: 'Contact', path: '/contact' }
  ];

  const activePath = hoveredPath || location.pathname;

  return (
    <>
      <motion.nav className="recco-nav" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <motion.div animate={{ backgroundColor: scrolled ? 'rgba(5, 5, 5, 0.75)' : 'rgba(5, 5, 5, 0)', backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)', borderColor: scrolled ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0)', boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : '0 0 0 rgba(0,0,0,0)' }} transition={{ duration: 0.4 }} className="nav-bg-shell" />
        
        <Magnetic strength={0.2}>
          <Link to="/" className="nav-logo" onMouseEnter={() => setHoveredPath(null)}>
            <motion.div whileHover={{ rotate: 20, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} className="logo-icon-box">
              <Sparkles size={20} color="#000" />
            </motion.div>
            <h1 className="gradient-text nav-title">RECCO</h1>
          </Link>
        </Magnetic>

        <div className="desktop-nav-pill">
          {navLinks.map(link => {
            const isActive = activePath === link.path;
            const isCurrent = location.pathname === link.path;
            return (
              <Link key={link.name} to={link.path} className="nav-link-wrapper" onMouseEnter={() => setHoveredPath(link.path)} onMouseLeave={() => setHoveredPath(null)}>
                {isActive && (
                  <motion.div 
                    layoutId="navHighlight" 
                    className={`nav-highlight ${isCurrent ? 'is-current' : ''}`} 
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} 
                  />
                )}
                <span className={`nav-link-text ${isCurrent && isActive ? 'is-active-text' : ''}`}>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="desktop-auth-actions">
          {user ? (
            <>
              <Magnetic strength={0.2}>
                <Link to={user.role === 'Admin' ? '/admin' : `/${user.role.toLowerCase()}-dashboard`} style={{ textDecoration: 'none' }}>
                  <motion.div whileTap={{ scale: 0.95 }} className="premium-btn-outline nav-auth-btn">
                    <LayoutDashboard size={16} /> Dashboard
                  </motion.div>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <motion.button onClick={handleLogout} whileTap={{ scale: 0.9 }} className="premium-btn nav-auth-btn">
                  <LogOut size={16} /> Logout
                </motion.button>
              </Magnetic>
            </>
          ) : (
            <>
              <Magnetic strength={0.2}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <motion.div whileTap={{ scale: 0.95 }} className="premium-btn-outline nav-auth-btn">Login</motion.div>
                </Link>
              </Magnetic>
              <Magnetic strength={0.4}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <motion.button whileTap={{ scale: 0.9 }} className="premium-btn nav-auth-btn nav-cta-btn">
                    Get Started <ArrowRight size={16} />
                  </motion.button>
                </Link>
              </Magnetic>
            </>
          )}
          <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn"><Menu size={24} /></button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ clipPath: 'circle(0% at 100% 0%)' }} 
            animate={{ clipPath: 'circle(150% at 100% 0%)' }} 
            exit={{ clipPath: 'circle(0% at 100% 0%)' }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
            className="mobile-menu-overlay"
          >
            <button onClick={() => setMobileOpen(false)} className="mobile-close-btn"><X size={28} /></button>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }} 
              className="mobile-logo"
            >
              <div className="logo-icon-box" style={{ width: '40px', height: '40px' }}>
                <Sparkles size={22} color="#000" />
              </div>
              <h1 className="gradient-text nav-title" style={{ fontSize: '1.8rem' }}>RECCO</h1>
            </motion.div>
            
            <div className="mobile-links-container">
              {navLinks.map((link, i) => (
                <motion.div 
                  key={link.name} 
                  initial={{ opacity: 0, y: 50, rotateX: -90 }} 
                  animate={{ opacity: 1, y: 0, rotateX: 0 }} 
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200, damping: 20 }} 
                  style={{ perspective: 1000 }}
                >
                  <Link 
                    to={link.path} 
                    onClick={() => setMobileOpen(false)} 
                    className={`mobile-link ${location.pathname === link.path ? 'is-active-mobile' : ''}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.7 }} 
              className="mobile-auth-container"
            >
              <Link to="/login" onClick={() => setMobileOpen(false)} className="premium-btn-outline mobile-auth-btn">Login</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="premium-btn mobile-auth-btn">Get Started</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .recco-nav { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; transition: padding 0.4s ease; }
        .nav-bg-shell { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-bottom: 1px solid; z-index: -1; }
        .nav-logo { text-decoration: none; display: flex; align-items: center; gap: 0.6rem; z-index: 2; }
        .logo-icon-box { width: 38px; height: 38px; background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); }
        .nav-title { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.1em; margin: 0; font-family: 'Sora', sans-serif; }
        .desktop-nav-pill { position: absolute; left: 50%; transform: translateX(-50%); display: flex; gap: 0.2rem; background: rgba(15, 15, 15, 0.6); padding: 0.4rem; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); perspective: 1000px; }
        .nav-link-wrapper { text-decoration: none; position: relative; padding: 0.5rem 1.2rem; z-index: 1; display: block; }
        .nav-highlight { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.08); border-radius: 10px; z-index: -1; }
        .nav-highlight.is-current { background: linear-gradient(135deg, #FFD700, #FFA500); }
        .nav-link-text { color: #fff; font-weight: 500; transition: color 0.3s; font-size: 0.9rem; display: inline-block; }
        .nav-link-text.is-active-text { color: #000; font-weight: 600; }
        .desktop-auth-actions { display: flex; gap: 1rem; align-items: center; z-index: 2; }
        .nav-auth-btn { padding: 0.6rem 1.2rem !important; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem !important; }
        .nav-cta-btn { padding: 0.6rem 1.4rem !important; }
        .mobile-menu-btn { display: none; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; padding: 0.6rem; border-radius: 10px; }
        .mobile-menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,5,5,0.98); backdrop-filter: blur(20px); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 2rem; }
        .mobile-close-btn { position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; padding: 0.6rem; border-radius: 10px; }
        .mobile-logo { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 2rem; }
        .mobile-links-container { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .mobile-link { color: #fff; text-decoration: none; font-size: clamp(1.8rem, 6vw, 2.4rem); font-weight: 700; font-family: 'Sora', sans-serif; transition: color 0.3s; }
        .is-active-mobile { color: #FFD700; }
        .mobile-auth-container { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 240px; }
        .mobile-auth-btn { text-align: center; padding: 1rem !important; font-size: 1.1rem !important; text-decoration: none; }
        @media (max-width: 1024px) { .desktop-nav-pill { display: none !important; } .desktop-auth-actions > * { display: none !important; } .mobile-menu-btn { display: block !important; } }
        @media (max-width: 768px) { .recco-nav { padding: 1.2rem 1.5rem !important; } .nav-title { font-size: 1.3rem; } .logo-icon-box { width: 34px; height: 34px; } }
        @media (max-width: 480px) { .recco-nav { padding: 1rem 1.2rem !important; } .mobile-link { font-size: 1.6rem; } }
      `}</style>
    </>
  );
}