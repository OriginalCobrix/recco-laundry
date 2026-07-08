import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, PlusCircle } from 'lucide-react';

export default function Navbar({ role }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        background: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <motion.h1 
        className="gradient-text"
        style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.1em' }}
        whileHover={{ scale: 1.05 }}
      >
        RECCO
      </motion.h1>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {role === 'Customer' && (
          <Link to="/place-order" className="premium-btn-outline" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Place Order
          </Link>
        )}
        <motion.button 
          onClick={handleLogout}
          className="premium-btn"
          style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={18} /> Logout
        </motion.button>
      </div>
    </motion.nav>
  );
}