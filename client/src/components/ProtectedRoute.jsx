import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ element: Element, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loader">Loading RECCO...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role.toLowerCase()}-dashboard`} replace />;
  if (user.role === 'Washerman' && user.approvalStatus === 'Pending Approval') return <Navigate to="/pending-approval" replace />;

  return <Element />;
};

export default ProtectedRoute;