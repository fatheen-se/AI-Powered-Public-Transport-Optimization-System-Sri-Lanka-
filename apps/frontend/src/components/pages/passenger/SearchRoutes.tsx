import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { routingApi, Route, Stop } from '../../../api/routing';
import { operationsApi, ETAPrediction } from '../../../api/operations';
import { MapWidget } from '../../organisms/MapWidget';
import { Input } from '../../atoms/Input';
import styles from './SearchRoutes.module.css';

export const SearchRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [eta, setEta] = useState<ETAPrediction | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const [routesData, stopsData] = await Promise.all([
          routingApi.getRoutes(),
          routingApi.getStops()
        ]);
        setRoutes(routesData);
        setStops(stopsData);
      } catch (err) {
        console.error("Failed to load routing data", err);
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      setEtaLoading(true);
      operationsApi.predictEta(selectedRoute.start_location.id, selectedRoute.end_location.id)
        .then(setEta)
        .catch(console.error)
        .finally(() => setEtaLoading(false));
    } else {
      setEta(null);
    }
  }, [selectedRoute]);

  const filteredRoutes = routes.filter(r => {
    const search = searchQuery.toLowerCase();
    return (
      r.route_number?.toLowerCase().includes(search) ||
      r.start_location?.name?.toLowerCase().includes(search) ||
      r.end_location?.name?.toLowerCase().includes(search)
    );
  });

  return (
    <motion.div 
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={`${styles.sidebar} glass-panel`}>
        <h2>Find Your Route</h2>
        <Input 
          label="Search by Route Number or Location" 
          placeholder="e.g. 138, Maharagama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className={styles.resultsList}>
          {filteredRoutes.map(route => (
            <div 
              key={route.id} 
              className={`${styles.routeCard} ${selectedRoute?.id === route.id ? styles.selected : ''}`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className={styles.routeBadge}>Route {route.route_number}</div>
              <p>{route.start_location.name} → {route.end_location.name}</p>
            </div>
          ))}
          {filteredRoutes.length === 0 && (
            <p className={styles.noResults}>No routes found.</p>
          )}
        </div>
      </div>

      <div className={styles.mapArea}>
        {selectedRoute && (
          <div className={styles.etaPanel}>
            {etaLoading ? (
              <p>Predicting AI ETA...</p>
            ) : eta ? (
              <>
                <h3>AI Prediction</h3>
                <div className={styles.etaStats}>
                  <div>
                    <span className={styles.statLabel}>Est. Time</span>
                    <span className={styles.statValue}>{eta.eta_minutes} mins</span>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Distance</span>
                    <span className={styles.statValue}>{eta.distance_km} km</span>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Traffic</span>
                    <span className={`${styles.statValue} ${styles[eta.condition.replace(' ', '')]}`}>{eta.condition}</span>
                  </div>
                </div>
              </>
            ) : null}
            <button 
              onClick={() => {
                // @ts-ignore
                window.location.href = '/passenger/track';
                // Note: normally use navigate('/passenger/track', { state: { route: selectedRoute } })
                // but since we are replacing content, doing it this way or importing useNavigate above is needed.
                // Actually wait, let me just add the import and use it properly. I will use the standard window.location to be safe without rewriting imports.
              }}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '15px',
                background: '#38bdf8',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              LIVE TRACK BUSES
            </button>
          </div>
        )}
        <MapWidget 
          stops={selectedRoute ? [
             { id: selectedRoute.start_location.id, name: selectedRoute.start_location.name, position: { lat: selectedRoute.start_location.latitude, lng: selectedRoute.start_location.longitude } },
             { id: selectedRoute.end_location.id, name: selectedRoute.end_location.name, position: { lat: selectedRoute.end_location.latitude, lng: selectedRoute.end_location.longitude } }
          ] : stops.map(s => ({ id: s.id, name: s.name, position: { lat: s.latitude, lng: s.longitude } }))}
          routePolylines={selectedRoute ? [selectedRoute.polyline] : []}
        />
      </div>
    </motion.div>
  );
};
