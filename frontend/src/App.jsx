import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStores from './pages/AdminStores';
import AdminUserDetail from './pages/AdminUserDetail';
import StoreList from './pages/StoreList';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import ChangePassword from './pages/ChangePassword';

const roleHome = { admin: '/admin', user: '/stores', store_owner: '/owner' };

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || '/login'} replace />;
}

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUserDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminStores />
                </ProtectedRoute>
              }
            />

            <Route
              path="/stores"
              element={
                <ProtectedRoute roles={['user']}>
                  <StoreList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/owner"
              element={
                <ProtectedRoute roles={['store_owner']}>
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
