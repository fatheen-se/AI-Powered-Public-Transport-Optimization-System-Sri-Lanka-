import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useWebSocket } from '../../../hooks/useWebSocket';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const LiveTracking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const routeState = location.state?.route || { name: 'All Active Routes', id: null };
  const { lastMessage } = useWebSocket('ws://localhost:8001/ws/fleet/');
  const [buses, setBuses] = React.useState<Record<string, any>>({});
  
  React.useEffect(() => {
    if (lastMessage && lastMessage.vehicle_id) {
      setBuses(prev => ({ ...prev, [lastMessage.vehicle_id]: lastMessage }));
    }
  }, [lastMessage]);

  const defaultCenter: [number, number] = [6.9271, 79.8612];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ 
        padding: '15px 20px', 
        background: 'var(--glass-bg)', 
        color: 'var(--text-primary)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(16px)',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Live Tracking</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-blue)' }}>{routeState.name}</p>
        </div>
        <button 
          onClick={() => navigate('/passenger/search')}
          style={{ 
            padding: '8px 16px', 
            background: 'transparent', 
            border: '1px solid var(--accent-blue)', 
            color: 'var(--accent-blue)', 
            borderRadius: 'var(--radius-md)', 
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {(Object.keys(buses).length > 0 ? Object.values(buses) : [
            { vehicle_id: 'WP ND-1234', lat: 6.9271, lng: 79.8612, capacity: 54 },
            { vehicle_id: 'WP NB-5678', lat: 6.9344, lng: 79.8428, capacity: 42 },
            { vehicle_id: 'WP NE-7890', lat: 6.9147, lng: 79.8777, capacity: 54 },
          ]).map((bus: any) => (
            <Marker key={bus.vehicle_id} position={[bus.lat, bus.lng]} icon={busIcon}>
              <Popup>
                <strong>Bus {bus.vehicle_id}</strong><br />
                Capacity: {bus.capacity || 'Unknown'} <br/>
                <em>ETA: Calculating...</em>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Floating ETA Card */}
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1000, 
          background: 'var(--glass-bg)', 
          padding: '16px 20px', 
          borderRadius: 'var(--radius-lg)', 
          color: 'var(--text-primary)', 
          width: '90%', 
          maxWidth: '400px', 
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>Next Bus Arrival</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Towards Destination</p>
            </div>
            <div style={{ 
              background: 'var(--gradient-accent)', 
              color: 'white', 
              padding: '10px 15px', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 700, 
              fontSize: '1.1rem' 
            }}>
              ~8 Min
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
