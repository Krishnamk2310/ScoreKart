import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // store id being submitted

  const fetchStores = useCallback(async () => {
    const params = new URLSearchParams({ search });
    const res = await api(`/api/stores?${params}`);
    if (!res.error) setStores(res.data);
    setLoading(false);
  }, [search]);

  // Debounce search
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => fetchStores(), 300);
    return () => clearTimeout(t);
  }, [fetchStores]);

  async function submitRating(storeId, value) {
    setSubmitting(storeId);
    const res = await api('/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId, value }),
    });
    setSubmitting(null);

    if (!res.error) {
      // Update store in list without full refetch
      setStores((prev) =>
        prev.map((s) => {
          if (s.id !== storeId) return s;
          return { ...s, user_rating: value };
        })
      );
      // Refetch to get updated avg
      fetchStores();
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          {search ? `No stores found for "${search}"` : 'No stores available yet'}
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              submitting={submitting === store.id}
              onRate={(val) => submitRating(store.id, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreCard({ store, onRate, submitting }) {
  const [pendingRating, setPendingRating] = useState(store.user_rating || 0);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    await onRate(pendingRating);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasChanged = pendingRating !== (store.user_rating || 0) && pendingRating > 0;
  const avgRating = parseFloat(store.avg_rating);

  return (
    <div className="store-card">
      <div className="store-card-name">{store.name}</div>
      <div className="store-card-address">{store.address || 'No address listed'}</div>

      <div className="store-card-stats">
        <div className="avg-rating">
          <StarRating value={Math.round(avgRating)} readonly size={15} />
          <span className="num" style={{ fontSize: 15 }}>{avgRating.toFixed(1)}</span>
        </div>
        <span className="text-muted text-sm">
          {store.total_ratings} {store.total_ratings === '1' ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="store-card-your-rating">
        <span className="label">Your rating</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StarRating value={pendingRating} onChange={setPendingRating} size={22} />
          {hasChanged && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '…' : store.user_rating ? 'Update' : 'Submit'}
            </button>
          )}
          {saved && !hasChanged && (
            <span style={{ fontSize: 12, color: 'var(--success)', fontFamily: 'Syne', fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
          {!pendingRating && !store.user_rating && (
            <span className="text-muted text-sm">Click to rate</span>
          )}
        </div>
      </div>
    </div>
  );
}
