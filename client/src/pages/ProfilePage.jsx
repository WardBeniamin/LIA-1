import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE_URL}/api/bookings/user/${user.id}`)
      .then(res => res.json())
      .then(data => { setBookings(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

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
      <div className="profile-header">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{user.name}</h1>
          <p className="page-subtitle">{user.email}</p>
        </div>
      </div>

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
