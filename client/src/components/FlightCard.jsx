import React, { useState } from 'react';
import { Plane, Calendar, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import BookingModal from './BookingModal';

export default function FlightCard({ flight, index = 0, isOperator = false, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  const fmtDate = (d) => d.toLocaleDateString('sv-SE', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d) => d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fmtPrice = (p) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
  
  // Clean airport names e.g. "Dubai, UAE (Al Maktoum)" -> "Dubai" and "DXB" (mock)
  const cityBlock = (fullStr) => {
    const city = fullStr.split(',')[0].trim();
    const airportCode = fullStr.includes('(') ? fullStr.match(/\(([^)]+)\)/)[1].substring(0,3).toUpperCase() : city.substring(0,3).toUpperCase();
    return (
      <div className="fc-city">
        <span className="fc-city-code">{airportCode}</span>
        <span className="fc-city-name">{city}</span>
      </div>
    );
  };

  return (
    <>
      <div className="flight-card-premium" style={{ animationDelay: `${index * 40}ms` }}>
        {/* Top: Route and Price */}
        <div className="fc-header">
          <div className="fc-route">
            {cityBlock(flight.departureLocation)}
            <ArrowRight className="fc-arrow" size={24} strokeWidth={1.5} />
            {cityBlock(flight.arrivalLocation)}
          </div>
          
          <div className="fc-price-col">
            <div className="fc-price-label">{flight.price ? 'Starting fixed price' : 'Bidding Open'}</div>
            <div className="fc-price">{flight.price ? fmtPrice(flight.price) : 'Make Offer'}</div>
          </div>
        </div>

        {/* Middle: Flight Specs Grid */}
        <div className="fc-details">
          <div className="fc-detail-item">
            <span className="fc-detail-label">Departure</span>
            <span className="fc-detail-value"><Calendar size={14} color="var(--accent-primary)" /> {fmtDate(depTime)}</span>
          </div>
          <div className="fc-detail-item">
            <span className="fc-detail-label">Schedule</span>
            <span className="fc-detail-value"><Clock size={14} color="var(--accent-primary)" /> {fmtTime(depTime)} – {fmtTime(arrTime)}</span>
          </div>
          <div className="fc-detail-item">
            <span className="fc-detail-label">Aircraft</span>
            <span className="fc-detail-value"><Plane size={14} color="var(--accent-primary)" /> {flight.aircraftType}</span>
          </div>
        </div>

        {/* Bottom: Operator & Actions */}
        <div className="fc-footer">
          <div className="flex items-center gap-md">
            <span className="brand-font" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {flight.operator?.companyName || 'Private Operator'}
            </span>
            {flight.operator?.verified && (
              <span className="badge badge-gold flex items-center gap-sm">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
            <span className="badge badge-blue flex items-center gap-sm">
              <Users size={12} /> {flight.capacity} Seats
            </span>
          </div>
          
          {isOperator ? (
            <div className="flex gap-sm">
              <button className="btn btn-outline btn-sm" onClick={onEdit}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              {flight.price ? 'Book Flight' : 'Place Bid'}
            </button>
          )}
        </div>
      </div>

      {showModal && <BookingModal flight={flight} onClose={() => setShowModal(false)} />}
    </>
  );
}
