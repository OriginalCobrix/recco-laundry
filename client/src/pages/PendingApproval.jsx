import { motion } from 'framer-motion';

export default function PendingApproval() {
  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      >
        <h1 className="auth-title">RECCO</h1>
        <h3>Account Pending Approval</h3>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>
          Your Washerman account is currently under review by our Admin team. 
          You will receive an email notification once your account is approved.
        </p>
      </motion.div>
    </div>
  );
}