import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const pwRe = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{8,16}$/;

const EMPTY_FORM = { name: '', email: '', password: '', address: '', role: 'user' };

function validate(form) {
  if (!form.name || form.name.trim().length < 20 || form.name.trim().length > 60)
    return 'Name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return 'Enter a valid email';
  if (!pwRe.test(form.password))
    return 'Password must be 8–16 chars with at least 1 uppercase and 1 special character';
  if (form.address && form.address.length > 400)
    return 'Address must be under 400 characters';
  if (!['admin', 'user', 'store_owner'].includes(form.role))
    return 'Select a valid role';
  return null;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ col: 'name', order: 'asc' });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...filters,
      sort: sort.col,
      order: sort.order,
    });
    const res = await api(`/api/admin/users?${params}`);
    if (!res.error) setUsers(res.data);
    setLoading(false);
  }, [filters, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function toggleSort(col) {
    setSort((prev) =>
      prev.col === col
        ? { col, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { col, order: 'asc' }
    );
  }

  function sortIcon(col) {
    if (sort.col !== col) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon">{sort.order === 'asc' ? '↑' : '↓'}</span>;
  }

  async function handleAddUser(e) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setFormError(err); return; }

    setFormError('');
    setSaving(true);
    const res = await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (res.error) { setFormError(res.error); return; }

    setShowModal(false);
    setForm(EMPTY_FORM);
    fetchUsers();
  }

  function setFilter(key) {
    return (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function setField(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setForm(EMPTY_FORM); }}>
          + Add User
        </button>
      </div>

      <div className="filter-row">
        <input
          className="filter-input"
          type="text"
          placeholder="Filter by name"
          value={filters.name}
          onChange={setFilter('name')}
        />
        <input
          className="filter-input"
          type="text"
          placeholder="Filter by email"
          value={filters.email}
          onChange={setFilter('email')}
        />
        <input
          className="filter-input"
          type="text"
          placeholder="Filter by address"
          value={filters.address}
          onChange={setFilter('address')}
        />
        <select className="filter-select" value={filters.role} onChange={setFilter('role')}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className={`sortable ${sort.col === 'name' ? 'sorted' : ''}`} onClick={() => toggleSort('name')}>
                  Name {sortIcon('name')}
                </th>
                <th className={`sortable ${sort.col === 'email' ? 'sorted' : ''}`} onClick={() => toggleSort('email')}>
                  Email {sortIcon('email')}
                </th>
                <th>Address</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="clickable"
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td className="text-muted text-sm">{u.address || '—'}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Add User</div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full name</label>
                <input type="text" value={form.name} onChange={setField('name')} placeholder="20–60 characters" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={setField('email')} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={setField('password')} placeholder="8–16 chars, 1 uppercase, 1 special" required />
              </div>
              <div className="form-group">
                <label>Address <span className="text-muted">(optional)</span></label>
                <input type="text" value={form.address} onChange={setField('address')} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={setField('role')}>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding…' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
