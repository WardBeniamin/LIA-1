import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function FlightMap({ flights }) {
  // Center of world roughly
  const defaultCenter = [40, -40]; 

  return (
    <MapContainer center={defaultCenter} zoom={3} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {flights.map((flight) => {
        if (!flight.latitude || !flight.longitude || !flight.destLatitude || !flight.destLongitude) return null;
        
        const start = [flight.latitude, flight.longitude];
        const end = [flight.destLatitude, flight.destLongitude];

        return (
          <React.Fragment key={flight.id}>
            <Marker position={start}>
              <Popup>
                <strong>Departure:</strong> {flight.departureLocation}
              </Popup>
            </Marker>
            <Marker position={end}>
              <Popup>
                <strong>Arrival:</strong> {flight.arrivalLocation}
              </Popup>
            </Marker>
            <Polyline 
              positions={[start, end]} 
              color="#3b82f6" 
              weight={3} 
              dashArray="5, 10" 
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
