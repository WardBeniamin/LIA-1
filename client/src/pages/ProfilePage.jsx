import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar, Edit2, Save, X, Heart } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/bookings/user/${user.id}`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/saved-searches/user/${user.id}`).then(res => res.json())
    ])
      .then(([bookingsData, searchesData]) => {
        setBookings(bookingsData);
        setSavedSearches(searchesData);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone })
      });
      if (res.ok) {
        setUser({ ...user, name: editName, phone: editPhone });
        setEditingProfile(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSavedSearch = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/saved-searches/${id}`, { method: 'DELETE' });
      setSavedSearches(savedSearches.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Please Sign In</h2>
        <p className="text-muted">You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {editingProfile ? (
                <>
                  <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label>Full Name</label>
                    <input className="input-control" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label>Phone</label>
                    <input className="input-control" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleUpdateProfile}><Save size={14} /> Save</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditingProfile(false)}><X size={14} /> Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>{user.name}</h1>
                  <p className="page-subtitle">{user.email}</p>
                  {editPhone && <p className="text-muted text-sm">{editPhone}</p>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingProfile(true)} style={{ marginTop: '1rem' }}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title mb-3">Saved Searches <span className="badge badge-gold">{savedSearches.length}</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {savedSearches.map(search => (
              <div key={search.id} className="panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>{search.name}</h3>
                    <p className="text-xs text-muted">{new Date(search.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteSavedSearch(search.id)} style={{ color: 'var(--danger)' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flight Bookings */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title" style={{ margin: 0 }}>Your Flight Requests</h2>
          <span className="badge badge-blue">{bookings.length} Bookings</span>
        </div>

        {loading ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>You have no recent flight requests.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {bookings.map(booking => (
              <div key={booking.id} className="alert-item" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-sm mb-2">
                    <span className="badge badge-blue">{booking.status}</span>
                    <span className="text-xs text-muted">
                      Requested {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    {booking.flight.departureLocation.split('(')[0].trim()} → {booking.flight.arrivalLocation.split('(')[0].trim()}
                  </h3>
                  <div className="flex gap-lg text-sm text-muted mt-2">
                    <span className="flex items-center gap-xs"><Calendar size={14} /> {new Date(booking.flight.departureTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-xs"><Plane size={14} /> {booking.flight.aircraftType}</span>
                    {booking.priceOffered && <span className="text-success font-semibold">Offer: ${booking.priceOffered.toLocaleString()}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-xs text-muted block mb-1">Operator</span>
                  <strong>{booking.flight.operator.companyName}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
