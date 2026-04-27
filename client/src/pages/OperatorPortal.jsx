import React, { useState, useEffect } from 'react';
import { PlusCircle, X, CheckCircle, TrendingUp, Users, DollarSign, Activity, Trash2, Edit2 } from 'lucide-react';
import FlightCard from '../components/FlightCard';

const AIRCRAFT_TYPES = ['Gulfstream G650', 'Citation X', 'Challenger 350', 'Global 7500', 'Phenom 300', 'Learjet 75'];
const AIRPORTS = [
  'Stockholm, Sweden (Bromma)', 'Gothenburg, Sweden (Landvetter)', 
  'London, UK (Farnborough)', 'London, UK (Biggin Hill)', 
  'Paris, France (Le Bourget)', 'Nice, France (Côte d\'Azur)', 
  'Geneva, Switzerland', 'Zurich, Switzerland', 
  'Berlin, Germany (BER)', 'Munich, Germany', 
  'Milan, Italy (Linate)', 'Ibiza, Spain', 'Vienna, Austria'
];

const OPERATOR_ID = '4474c431-b2cf-49a4-b174-a6ba10dac112';

function AddFlightModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    departureLocation: '', arrivalLocation: '', departureTime: '', arrivalTime: '',
    aircraftType: AIRCRAFT_TYPES[0], capacity: 8, price: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          operatorId: OPERATOR_ID,
          price: form.price ? parseFloat(form.price) : null,
          capacity: parseInt(form.capacity),
          status: 'AVAILABLE',
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { onAdded(); onClose(); }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={56} style={{ color: 'var(--success)', display: 'block', margin: '0 auto 1rem' }} />
            <h2>Flight Listed!</h2>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Your empty leg has been published.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '0.25rem' }}>Add Empty Leg Flight</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>List a new empty leg to attract passengers.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label>Departure Airport</label>
                <select className="input-control" required value={form.departureLocation} onChange={e => set('departureLocation', e.target.value)}>
                  <option value="">Select airport…</option>
                  {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Arrival Airport</label>
                <select className="input-control" required value={form.arrivalLocation} onChange={e => set('arrivalLocation', e.target.value)}>
                  <option value="">Select airport…</option>
                  {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Departure Date &amp; Time</label>
                <input type="datetime-local" className="input-control" required value={form.departureTime} onChange={e => set('departureTime', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Arrival Date &amp; Time</label>
                <input type="datetime-local" className="input-control" required value={form.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Aircraft Type</label>
                <select className="input-control" value={form.aircraftType} onChange={e => set('aircraftType', e.target.value)}>
                  {AIRCRAFT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Passenger Capacity</label>
                <input type="number" className="input-control" min={1} max={20} required value={form.capacity} onChange={e => set('capacity', e.target.value)} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Price (€) — leave blank for "Name Your Price"</label>
              <input type="number" className="input-control" min={500} step={500} placeholder="e.g. 15000 — or leave blank" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              {loading ? 'Publishing…' : 'Publish Empty Leg'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function EditFlightModal({ flight, onClose, onUpdated }) {
  const toLocalISO = (d) => {
    if(!d) return '';
    const dt = new Date(d);
    return dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)+'-'+('0'+dt.getDate()).slice(-2)+'T'+('0'+dt.getHours()).slice(-2)+':'+('0'+dt.getMinutes()).slice(-2);
  };

  const [form, setForm] = useState({
    price: flight.price || '',
    departureTime: toLocalISO(flight.departureTime),
    arrivalTime: toLocalISO(flight.arrivalTime)
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/flights/${flight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: form.price ? parseFloat(form.price) : null,
          departureTime: new Date(form.departureTime).toISOString(),
          arrivalTime: new Date(form.arrivalTime).toISOString()
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { onUpdated(); onClose(); }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shortLoc = (loc) => loc.split('(')[0].trim();

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={56} style={{ color: 'var(--success)', display: 'block', margin: '0 auto 1rem' }} />
            <h2>Flight Updated!</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1rem' }}>Edit Flight</h2>
            
            <div className="panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Route</div>
              <div style={{ fontWeight: 600 }}>{shortLoc(flight.departureLocation)} → {shortLoc(flight.arrivalLocation)}</div>
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label>Departure Time</label>
              <input type="datetime-local" className="input-control" required value={form.departureTime} onChange={e => set('departureTime', e.target.value)} />
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label>Arrival Time</label>
              <input type="datetime-local" className="input-control" required value={form.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} />
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Price (€) — leave blank for "Name Your Price"</label>
              <input type="number" className="input-control" min={500} step={500} placeholder="e.g. 15000" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OperatorPortal() {
  const [flights, setFlights] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flightsRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/flights'),  // MVP: just fetch all, in prod filter by operatorId
        fetch(`http://localhost:5000/api/analytics/operator/${OPERATOR_ID}`)
      ]);
      const flightsData = await flightsRes.json();
      const analyticsData = await analyticsRes.json();
      setFlights(flightsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (flightId) => {
    if (!window.confirm("Are you sure you want to delete this flight?")) return;
    try {
      await fetch(`http://localhost:5000/api/flights/${flightId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const wrapCard = (flight, idx) => (
    <FlightCard 
      key={flight.id} 
      flight={flight} 
      index={idx} 
      isOperator={true} 
      onDelete={() => handleDelete(flight.id)}
      onEdit={() => setEditingFlight(flight)}
    />
  );

  return (
    <div className="animate-in" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Operator Dashboard</h1>
          <p className="page-subtitle">Manage your empty leg listings and analyze demand.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={18} /> Add New Flight
        </button>
      </div>

      {analytics && (
        <div className="stats-row">
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
              <TrendingUp size={16} /> <span className="stat-label">Total Revenue</span>
            </div>
            <div className="stat-value text-success">€{analytics.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--warning)' }}>
              <Users size={16} /> <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-value">{analytics.totalBookings}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              <Activity size={16} /> <span className="stat-label">Active Listings</span>
            </div>
            <div className="stat-value">{analytics.totalFlights}</div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title" style={{ margin: 0 }}>Active Fleet Map</h2>
          <span className="badge badge-blue">{flights.length} Live Routes</span>
        </div>

        {loading ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '3rem' }}>Loading flights…</p>
        ) : flights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <PlusCircle size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
            <p>No flights listed yet. Add your first empty leg above.</p>
          </div>
        ) : (
          <div className="operator-grid">
            {flights.map(wrapCard)}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddFlightModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}

      {editingFlight && (
        <EditFlightModal
          flight={editingFlight}
          onClose={() => setEditingFlight(null)}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
}
