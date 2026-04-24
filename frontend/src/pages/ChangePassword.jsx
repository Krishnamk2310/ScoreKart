import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const pwRe = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{8,16}$/;

const roleHome = { admin: '/admin', user: '/stores', store_owner: '/owner' };

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pwRe.test(form.new_password)) {
      setError('New password must be 8–16 chars with at least 1 uppercase and 1 special character');
      return;
    }

    if (form.new_password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await api('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: form.current_password,
        new_password: form.new_password,
      }),
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess('Password updated successfully');
    setForm({ current_password: '', new_password: '', confirm: '' });
  }

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <div className="page-narrow">
      <div style={{ marginBottom: 24 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(roleHome[user?.role] || '/')}
          style={{ marginBottom: 8 }}
        >
          ← Back
        </button>
        <h1 className="page-title">Change Password</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current password</label>
            <input
              type="password"
              value={form.current_password}
              onChange={set('current_password')}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>New password</label>
            <input
              type="password"
              value={form.new_password}
              onChange={set('new_password')}
              placeholder="8–16 chars, 1 uppercase, 1 special"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
          </div>

          <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Password must be 8–16 characters and include at least one uppercase letter and one special character (!@#$%^&* etc.)
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
