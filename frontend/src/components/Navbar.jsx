import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          Store<span>Rate</span>
        </NavLink>

        <div className="navbar-links">
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Users
              </NavLink>
              <NavLink to="/admin/stores" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Stores
              </NavLink>
            </>
          )}

          {user?.role === 'user' && (
            <NavLink to="/stores" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Browse Stores
            </NavLink>
          )}

          {user?.role === 'store_owner' && (
            <NavLink to="/owner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Store
            </NavLink>
          )}
        </div>

        <div className="navbar-right">
          <span className="navbar-user">{user?.name}</span>
          <NavLink
            to="/change-password"
            className={({ isActive }) => `nav-link btn-ghost btn-sm ${isActive ? 'active' : ''}`}
          >
            Password
          </NavLink>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
