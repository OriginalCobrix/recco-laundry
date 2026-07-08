import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (result) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success': return { icon: CheckCircle, color: '#10b981', border: 'rgba(16, 185, 129, 0.4)' };
      case 'error': return { icon: XCircle, color: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
      case 'warning': return { icon: AlertTriangle, color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
      default: return { icon: Info, color: '#FFD700', border: 'rgba(255, 215, 0, 0.4)' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            const Icon = styles.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  background: 'rgba(15, 15, 15, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${styles.border}`, color: '#f5f5f5', padding: '1rem 1.5rem', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: '280px', maxWidth: '400px',
                  boxShadow: `0 10px 25px rgba(0,0,0,0.3), 0 0 15px ${styles.border}`, pointerEvents: 'auto'
                }}
              >
                <Icon size={22} color={styles.color} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.95rem', flex: 1 }}>{toast.message}</span>
                <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '0', display: 'flex' }}>
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmState && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => handleConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', textAlign: 'center' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <AlertTriangle size={28} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Are you sure?</h3>
              <p style={{ color: '#888', margin: '0 0 2rem 0', fontSize: '0.95rem' }}>{confirmState.message}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => handleConfirm(false)} className="premium-btn-outline" style={{ flex: 1, padding: '0.9rem', fontSize: '0.9rem' }}>Cancel</button>
                <button onClick={() => handleConfirm(true)} className="premium-btn" style={{ flex: 1, padding: '0.9rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}>Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};