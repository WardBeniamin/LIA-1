import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OperatorPortal from './pages/OperatorPortal';
import ProfilePage from './pages/ProfilePage';
import AlertsPage from './pages/AlertsPage';
import AuthModal from './components/AuthModal';
import CookieBanner from './components/CookieBanner';
import { AuthContext } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, logout: () => setUser(null) }}>
      <BrowserRouter>
        <div className="app-container">

          {/* ── Navbar ── */}
          <nav className="navbar">
            <Link to="/" className="navbar-brand">✈ AeroEmpty</Link>
            <div className="navbar-links">
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Flights
              </NavLink>
              <NavLink to="/operator" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Operators
              </NavLink>
              {user && (
                <>
                  <NavLink to="/alerts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    🔔 Alerts
                  </NavLink>
                  <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    Profile
                  </NavLink>
                </>
              )}
              {user ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setUser(null)}>
                  Log Out
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>
                  Sign In
                </button>
              )}
            </div>
          </nav>

          {/* ── Pages ── */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/operator" element={<OperatorPortal />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          {/* ── Footer ── */}
          <footer style={{
            textAlign: 'center', padding: '2rem 1rem',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-dim)', fontSize: '0.8rem'
          }}>
            <p>© 2026 AeroEmpty — Private Empty Leg Flights. All rights reserved.</p>
            <p style={{ marginTop: '0.3rem' }}>
              GDPR Compliant &nbsp;·&nbsp; SSL Secured &nbsp;·&nbsp; Powered by React &amp; Node.js
            </p>
          </footer>
        </div>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        <CookieBanner />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
