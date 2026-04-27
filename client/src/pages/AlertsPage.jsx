import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Trash2, Plus } from 'lucide-react';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoute, setNewRoute] = useState('');

  const fetchAlerts = () => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/alerts?userId=${user.id}`)
      .then(res => res.json())
      .then(data => { setAlerts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchAlerts(); }, [user]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newRoute.trim()) return;
    try {
      await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, route: newRoute })
      });
      setNewRoute('');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}`, { method: 'DELETE' });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Please Sign In</h2>
        <p className="text-muted">You must be logged in to manage alerts.</p>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Notifications & Alerts</h1>
      <p className="page-subtitle mb-3">Set up alerts to get notified when empty legs match your route.</p>

      <div className="panel mb-3">
        <h2 className="section-title">Setup New Alert</h2>
        <form onSubmit={handleCreateAlert} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Route or Destination (e.g. "Dubai" or "London to Paris")</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="Enter preferred routes..." 
              value={newRoute} 
              onChange={e => setNewRoute(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '40px' }}>
            <Plus size={16} /> Add Alert
          </button>
        </form>
      </div>

      <div className="panel">
        <h2 className="section-title mb-2">Your Active Alerts <span className="badge badge-blue">{alerts.length}</span></h2>
        
        {loading ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
            <p>No alerts configured yet.</p>
            <p className="text-sm mt-1">Add an alert above to get instantly notified.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {alerts.map(alert => (
              <div key={alert.id} className="alert-item">
                <div className="flex items-center gap-md">
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>{alert.route}</h3>
                    <p className="text-xs text-muted">Created {new Date(alert.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => handleDeleteAlert(alert.id)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
