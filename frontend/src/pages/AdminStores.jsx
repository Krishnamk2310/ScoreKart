import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';

const EMPTY_FORM = { name: '', email: '', address: '', owner_id: '' };

function validate(form) {
  if (!form.name || form.name.trim().length < 20 || form.name.trim().length > 60)
    return 'Store name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return 'Enter a valid email';
  if (form.address && form.address.length > 400)
    return 'Address must be under 400 characters';
  return null;
}

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ col: 'name', order: 'asc' });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // For owner dropdown in add store form
  const [owners, setOwners] = useState([]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ ...filters, sort: sort.col, order: sort.order });
    const res = await api(`/api/admin/stores?${params}`);
    if (!res.error) setStores(res.data);
    setLoading(false);
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  async function openModal() {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
    const res = await api('/api/admin/users?role=store_owner&sort=name&order=asc');
    if (!res.error) setOwners(res.data);
  }

  function toggleSort(col) {
    setSort((prev) =>
      prev.col === col ? { col, order: prev.order === 'asc' ? 'desc' : 'asc' } : { col, order: 'asc' }
    );
  }

  function sortIcon(col) {
    if (sort.col !== col) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon">{sort.order === 'asc' ? '↑' : '↓'}</span>;
  }

  async function handleAddStore(e) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setFormError(err); return; }

    setFormError('');
    setSaving(true);
    const payload = { ...form, owner_id: form.owner_id ? parseInt(form.owner_id) : null };
    const res = await api('/api/admin/stores', { method: 'POST', body: JSON.stringify(payload) });
    setSaving(false);

    if (res.error) { setFormError(res.error); return; }

    setShowModal(false);
    fetchStores();
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
        <h1 className="page-title">Stores</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Add Store</button>
      </div>

      <div className="filter-row">
        <input className="filter-input" type="text" placeholder="Filter by name" value={filters.name} onChange={setFilter('name')} />
        <input className="filter-input" type="text" placeholder="Filter by email" value={filters.email} onChange={setFilter('email')} />
        <input className="filter-input" type="text" placeholder="Filter by address" value={filters.address} onChange={setFilter('address')} />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : stores.length === 0 ? (
          <div className="empty-state">No stores found</div>
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
                <th className={`sortable ${sort.col === 'address' ? 'sorted' : ''}`} onClick={() => toggleSort('address')}>
                  Address {sortIcon('address')}
                </th>
                <th>Owner</th>
                <th className={`sortable ${sort.col === 'avg_rating' ? 'sorted' : ''}`} onClick={() => toggleSort('avg_rating')}>
                  Avg Rating {sortIcon('avg_rating')}
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td className="text-muted">{s.email}</td>
                  <td className="text-muted text-sm">{s.address || '—'}</td>
                  <td className="text-sm">{s.owner_name || <span className="text-muted">—</span>}</td>
                  <td>
                    <div className="avg-rating">
                      <StarRating value={Math.round(parseFloat(s.avg_rating))} readonly size={14} />
                      <span className="num">{parseFloat(s.avg_rating).toFixed(1)}</span>
                      <span className="text-muted text-sm">({s.total_ratings})</span>
                    </div>
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
            <div className="modal-title">Add Store</div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label>Store name</label>
                <input type="text" value={form.name} onChange={setField('name')} placeholder="20–60 characters" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={setField('email')} required />
              </div>
              <div className="form-group">
                <label>Address <span className="text-muted">(optional)</span></label>
                <input type="text" value={form.address} onChange={setField('address')} />
              </div>
              <div className="form-group">
                <label>Owner <span className="text-muted">(optional)</span></label>
                <select value={form.owner_id} onChange={setField('owner_id')}>
                  <option value="">No owner assigned</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} — {o.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding…' : 'Add Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
