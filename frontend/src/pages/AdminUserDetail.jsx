import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import StarRating from '../components/StarRating';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/admin/users/${id}`).then((res) => {
      if (res.error) setError(res.error);
      else setData(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="page"><div className="loading">Loading…</div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const { user, store } = data;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">User Detail</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: store ? '1fr 1fr' : '1fr', gap: 16 }}>
        <div className="card">
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 18,
              flexShrink: 0,
            }}>
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17 }}>{user.name}</div>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </div>
          </div>

          <hr className="divider" />

          <Field label="Email" value={user.email} />
          <Field label="Address" value={user.address || '—'} />
          <Field
            label="Member since"
            value={new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          />
        </div>

        {store && (
          <div className="card">
            <div style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>
              Owned Store
            </div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{store.name}</div>
            <div className="text-muted text-sm" style={{ marginBottom: 16 }}>{store.address || 'No address'}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <StarRating value={Math.round(parseFloat(store.avg_rating))} readonly size={20} />
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20 }}>
                {parseFloat(store.avg_rating).toFixed(1)}
              </span>
              <span className="text-muted text-sm">
                from {store.total_ratings} {store.total_ratings === '1' ? 'rating' : 'ratings'}
              </span>
            </div>

            <Field label="Store Email" value={store.email} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}
