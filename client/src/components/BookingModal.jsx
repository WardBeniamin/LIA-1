import React, { useState } from 'react';
import { X, CheckCircle, Lock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ flight, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [priceOffer, setPriceOffer] = useState(flight.price || '');
  const [costShare, setCostShare] = useState(false);
  const [passengers, setPassengers] = useState(1);

  const formatPrice = (p) =>
    new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);

  const shortLoc = (loc) => loc.split('(')[0].trim();

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in first to book a flight.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.id,
          userId: user.id || 'mock-user-123',
          priceOffered: parseFloat(priceOffer),
          costShare,
          passengers: parseInt(passengers)
        })
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '480px' }}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={56} style={{ color: 'var(--success)', margin: '0 auto 1.25rem', display: 'block' }} />
            <h2 style={{ marginBottom: '0.75rem' }}>Payment Successful!</h2>
            <p className="text-muted">
              Your booking inquiry has been securely processed and sent to <strong style={{ color: 'var(--text-main)' }}>
                {flight.operator?.companyName}
              </strong>.
            </p>
            <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }} onClick={onClose}>
              Close &amp; Check Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook}>
            <h2 style={{ marginBottom: '0.25rem' }}>
              {flight.price ? 'Secure Checkout' : 'Submit Bid Request'}
            </h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {shortLoc(flight.departureLocation)} → {shortLoc(flight.arrivalLocation)}
            </p>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label>{flight.price ? 'Fixed Price (€)' : 'Your Offer (€)'}</label>
              <input
                type="number" required min={1000} step={500}
                className="input-control"
                value={priceOffer} onChange={e => setPriceOffer(e.target.value)}
                readOnly={!!flight.price}
                style={{ fontSize: '1.75rem', padding: '0.75rem 1rem', height: 'auto', textAlign: 'center', fontWeight: 'bold' }}
              />
              {!flight.price && (
                <span className="text-muted text-center" style={{ fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>
                  Operator may accept or counter your offer.
                </span>
              )}
            </div>

            <div className="panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={costShare} 
                  onChange={e => setCostShare(e.target.checked)} 
                  style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={16} /> Enable Cost-Sharing
                  </div>
                  <p className="text-muted text-xs mt-1">Split the cost of this jet by allowing other users to book empty seats.</p>
                </div>
              </label>
            </div>

            {/* Mock Stripe Gateway UI */}
            {flight.price && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>CARD DETAILS</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <div style={{ width: 32, height: 20, background: '#eab308', borderRadius: 4 }} />
                    <div style={{ width: 32, height: 20, background: '#ef4444', borderRadius: 4 }} />
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                  <input type="text" className="input-control" placeholder="Card number" value="4242 4242 4242 4242" readOnly />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="input-group" style={{ flex: 1 }}><input type="text" className="input-control" placeholder="MM / YY" value="12 / 27" readOnly /></div>
                  <div className="input-group" style={{ flex: 1 }}><input type="text" className="input-control" placeholder="CVC" value="123" readOnly /></div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Processing Protocol...' : flight.price ? `Pay ${formatPrice(flight.price)} Setup` : 'Submit Protected Bid'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Lock size={12} /> Payments are secure and encrypted via Stripe
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
