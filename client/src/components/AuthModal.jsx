import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      setUser(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}><X size={16} /></button>
        <h2 style={{ marginBottom: '0.25rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          {isLogin ? 'Sign in to manage your private flights.' : 'Join AeroEmpty today.'}
        </p>

        {error && <div className="badge badge-red mb-3" style={{ display: 'block', padding: '0.75rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" className="input-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" className="input-control" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-control" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span className="text-muted">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
          <button className="btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
