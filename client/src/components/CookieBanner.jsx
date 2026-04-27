import React, { useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>We Value Your Privacy</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies according to GDPR regulations.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-outline btn-sm" onClick={() => setVisible(false)}>Decline</button>
        <button className="btn btn-primary btn-sm" onClick={() => setVisible(false)}>Accept All</button>
      </div>
    </div>
  );
}
