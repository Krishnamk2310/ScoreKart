import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  admin: '/admin',
  user: '/stores',
  store_owner: '/owner',
};

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
}
