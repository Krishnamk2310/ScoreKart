import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/admin/stats').then((res) => {
      if (!res.error) setStats(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats?.total_users ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Stores</div>
              <div className="stat-value">{stats?.total_stores ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Ratings</div>
              <div className="stat-value">{stats?.total_ratings ?? '—'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  Manage Users
                </div>
                <div className="text-muted text-sm">
                  View, filter, and add users. Assign roles.
                </div>
              </div>
            </Link>
            <Link to="/admin/stores" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏪</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  Manage Stores
                </div>
                <div className="text-muted text-sm">
                  View, filter, and add stores. Assign owners.
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
