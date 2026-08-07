import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './MapWidget.module.css';
import { useWebSocket } from '../../hooks/useWebSocket';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Location {
  lat: number;
  lng: number;
}

interface StopMarker {
  id: string;
  name: string;
  position: Location;
}

interface RouteLine {
  id: string;
  name: string;
  path: Location[];
}

interface MapProps {
  stops?: StopMarker[];
  routeLines?: RouteLine[];
  center?: Location;
  zoom?: number;
  onMapClick?: (loc: Location) => void;
  onRouteClick?: (id: string) => void;
}

const ChangeView = ({ center, zoom, stops }: { center: Location, zoom: number, stops: StopMarker[] }) => {
  const map = useMap();
  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.position.lat, s.position.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, stops, map]);
  return null;
};

const MapEvents = ({ onClick }: { onClick?: (loc: Location) => void }) => {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

export const MapWidget: React.FC<MapProps> = ({ 
  stops = [], 
  routeLines = [], 
  center = { lat: 6.9271, lng: 79.8612 }, 
  zoom = 13,
  onMapClick,
  onRouteClick
}) => {
  
  const { lastMessage, isConnected } = useWebSocket('ws://localhost:8000/ws/fleet/');
  const [liveBuses, setLiveBuses] = useState<Record<string, Location>>({});
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    if (lastMessage && lastMessage.vehicle_id) {
      setLiveBuses(prev => ({
        ...prev,
        [lastMessage.vehicle_id]: { lat: lastMessage.lat, lng: lastMessage.lng }
      }));
    }
  }, [lastMessage]);

  return (
    <div className={`${styles.mapContainer} glass-panel`} style={{ position: 'relative', height: '100%', zIndex: 0 }}>
      <button 
        onClick={() => setIsSatellite(!isSatellite)}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '8px 12px', background: 'rgba(255,255,255,0.9)', color: '#000', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
      >
        {isSatellite ? 'Standard Map' : 'Satellite'}
      </button>

      {isConnected && <div className={styles.liveIndicator}>Live Tracking Active</div>}
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
      >
        <ChangeView center={center} zoom={zoom} stops={stops} />
        <MapEvents onClick={onMapClick} />
        
        <TileLayer
          url={isSatellite 
            ? "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={isSatellite 
            ? "Imagery © Google" 
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />

        {stops.map(stop => (
          <Marker key={stop.id} position={[stop.position.lat, stop.position.lng]} icon={customIcon}>
            <Popup>
              <strong>{stop.name}</strong>
            </Popup>
          </Marker>
        ))}

        {routeLines.map((route) => (
          <Polyline 
            key={route.id} 
            positions={route.path.map(p => [p.lat, p.lng])} 
            color="var(--accent-blue)" 
            weight={8} 
            opacity={0.8}
            eventHandlers={{
              click: () => {
                if (onRouteClick) onRouteClick(route.id);
              }
            }}
          >
            <Popup>
              <strong>Route: {route.name}</strong><br/>
              <em>Click to edit</em>
            </Popup>
          </Polyline>
        ))}

        {/* Live Buses Layer */}
        {Object.entries(liveBuses).map(([vid, loc]) => (
          <Marker key={vid} position={[loc.lat, loc.lng]} icon={busIcon}>
            <Popup>
              <strong>Bus ID: {vid}</strong><br/>
              Status: In Transit
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
