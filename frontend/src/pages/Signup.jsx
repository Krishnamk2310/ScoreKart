import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const pwRe = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{8,16}$/;

function validate({ name, email, password, address }) {
  if (!name || name.trim().length < 20 || name.trim().length > 60)
    return 'Name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Enter a valid email address';
  if (!pwRe.test(password))
    return 'Password must be 8–16 chars with at least 1 uppercase and 1 special character';
  if (address && address.length > 400)
    return 'Address must be under 400 characters';
  return null;
}

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }

    setError('');
    setLoading(true);
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.error) { setError(res.error); return; }

    login(res.data.token, res.data.user);
    navigate('/stores');
  }

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join to discover and rate local stores</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="At least 20 characters"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="8–16 chars, 1 uppercase, 1 special"
              required
            />
          </div>
          <div className="form-group">
            <label>Address <span className="text-muted">(optional)</span></label>
            <input
              type="text"
              value={form.address}
              onChange={set('address')}
              placeholder="Your address"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
