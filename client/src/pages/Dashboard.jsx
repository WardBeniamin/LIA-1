import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FlightCard from '../components/FlightCard';
import FlightMap from '../components/FlightMap';
import { API_BASE_URL } from '../api';

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_BASE_URL}/api/flights?${query}`);
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        setFlights(data);
      } catch (err) {
        setError('Could not load flights. Make sure the server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [filters]);

  return (
    <div className="dashboard-page">
      {/* Premium Hero Section */}
      <div className="hero-premium">
        <div className="hero-content">
          <h1>Find Your Private Empty Leg</h1>
          <p>Secure exclusive last-minute private jet charts at a fraction of the cost.<br />
             Experience seamless booking, zero crowds, and ultimate luxury.</p>
        </div>
      </div>

      {/* Overlapping Search Container */}
      <div className="search-container-wrapper">
        <SearchBar onSearch={setFilters} />
      </div>

      <div className="dashboard-content">
        {/* Left Column: Flight List */}
        <div>
          {/* Results count & Error */}
          {!loading && !error && (
            <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '0.5rem' }}>
              {flights.length === 0
                ? 'No flights match your exact criteria.'
                : `Discovered ${flights.length} available empty leg${flights.length !== 1 ? 's' : ''}`}
            </div>
          )}
          {error && (
            <div style={{
              background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', color: 'var(--danger)'
            }}>
              {error}
            </div>
          )}

          <div className="flight-list-premium">
            {loading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                <p style={{ fontSize: '1.25rem' }}>Fetching private routes...</p>
              </div>
            ) : flights.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '5rem' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>✈</p>
                <h3 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Routes Found</h3>
                <p className="text-muted">Try adjusting your dates or relaxing your search criteria.</p>
              </div>
            ) : (
              flights.map((flight, idx) => (
                <FlightCard key={flight.id} flight={flight} index={idx} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map */}
        <div style={{ position: 'relative' }}>
          <div className="map-container">
            <FlightMap flights={flights} />
          </div>
        </div>
      </div>
    </div>
  );
}
