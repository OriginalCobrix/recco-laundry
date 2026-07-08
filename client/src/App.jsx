import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import PublicLayout from './components/PublicLayout';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

const Login = lazy(() => import('./pages/Login'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const WashermanDashboard = lazy(() => import('./pages/WashermanDashboard'));
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminServices = lazy(() => import('./pages/admin/Services'));

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505' }}>
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid rgba(255,215,0,0.2)', borderTopColor: '#FFD700' }} />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route element={<ProtectedRoute element={CustomerDashboard} roles={['Customer']} />} path="/customer-dashboard" />
        <Route element={<ProtectedRoute element={PlaceOrder} roles={['Customer']} />} path="/place-order" />
        <Route element={<ProtectedRoute element={WashermanDashboard} roles={['Washerman']} />} path="/washerman-dashboard" />
        <Route path="/admin" element={<ProtectedRoute element={AdminLayout} roles={['Admin']} />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="services" element={<AdminServices />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Loader />}>
            <AnimatedRoutes />
          </Suspense>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;