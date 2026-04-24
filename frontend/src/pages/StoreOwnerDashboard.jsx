import { useState, useEffect } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/users/me/store').then((res) => {
      if (res.error) setError(res.error);
      else setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page"><div className="loading">Loading…</div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const { store, ratings } = data;
  const avg = parseFloat(store.avg_rating);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Store</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
              {store.name}
            </div>
            <div className="text-muted text-sm" style={{ marginBottom: 12 }}>
              {store.address || 'No address listed'} · {store.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StarRating value={Math.round(avg)} readonly size={22} />
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
                {avg.toFixed(1)}
              </span>
              <span className="text-muted" style={{ fontSize: 14 }}>
                / 5.0
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 36, color: 'var(--accent)', lineHeight: 1 }}>
              {store.total_ratings}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {store.total_ratings === '1' ? 'rating' : 'ratings'} received
            </div>
          </div>
        </div>

        {store.total_ratings > 0 && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <RatingBreakdown ratings={ratings} />
          </div>
        )}
      </div>

      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
        Customer Ratings
      </h2>

      {ratings.length === 0 ? (
        <div className="empty-state">No ratings yet — share your store!</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td className="text-muted">{r.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StarRating value={r.value} readonly size={14} />
                      <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}>{r.value}</span>
                    </div>
                  </td>
                  <td className="text-muted text-sm">
                    {new Date(r.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RatingBreakdown({ ratings }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.value === star).length,
  }));
  const total = ratings.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
      {counts.map(({ star, count }) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, width: 8, textAlign: 'right', color: 'var(--text-muted)' }}>
              {star}
            </span>
            <span style={{ color: 'var(--star)', fontSize: 13 }}>★</span>
            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--star)',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
