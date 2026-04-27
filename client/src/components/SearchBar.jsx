import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const AIRCRAFT_TYPES = ['All Types', 'Gulfstream G650', 'Citation X', 'Challenger 350', 'Global 7500', 'Phenom 300', 'Learjet 75'];

export default function SearchBar({ onSearch }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (date) filters.date = date;
    if (aircraft && aircraft !== 'All Types') filters.aircraft = aircraft;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    onSearch(filters);
  };

  const handleClear = () => {
    setFrom(''); setTo(''); setDate('');
    setAircraft(''); setMinPrice(''); setMaxPrice('');
    onSearch({});
  };

  return (
    <form className="search-bar-premium" onSubmit={handleSearch}>
      <div className="input-group" style={{ flex: '1 1 200px' }}>
        <label>Departure</label>
        <input type="text" placeholder="City or region..." className="input-control" value={from} onChange={e => setFrom(e.target.value)} />
      </div>
      <div className="input-group" style={{ flex: '1 1 200px' }}>
        <label>Destination</label>
        <input type="text" placeholder="City or region..." className="input-control" value={to} onChange={e => setTo(e.target.value)} />
      </div>
      <div className="input-group" style={{ flex: '0 1 180px' }}>
        <label>Date</label>
        <input type="date" className="input-control" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {showAdvanced && (
        <>
          <div className="input-group" style={{ flex: '1 1 180px' }}>
            <label>Aircraft Class</label>
            <select className="input-control" value={aircraft} onChange={e => setAircraft(e.target.value)}>
              {AIRCRAFT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ flex: '0 1 140px' }}>
            <label>Min Price (€)</label>
            <input type="number" placeholder="0" className="input-control" min={0} step={1000} value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          </div>
          <div className="input-group" style={{ flex: '0 1 140px' }}>
            <label>Max Price (€)</label>
            <input type="number" placeholder="Any" className="input-control" min={0} step={1000} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-end', flex: '1 1 100%', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setShowAdvanced(!showAdvanced)} title="Advanced Filters">
          <SlidersHorizontal size={18} /> {showAdvanced ? 'Less' : 'More'}
        </button>
        <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
          <Search size={16} /> Search Flights
        </button>
        <button type="button" className="btn btn-outline" onClick={handleClear} title="Clear Filters" style={{ padding: '0.75rem' }}>
          <X size={16} />
        </button>
      </div>
    </form>
  );
}
