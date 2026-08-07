import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { routingApi, Route, Stop } from '../../../api/routing';
import { MapWidget } from '../../organisms/MapWidget';
import styles from './RouteMap.module.css';

// Fallback dummy stops when backend is down
const DUMMY_STOPS = [
  { id: 's1', name: 'Fort Railway Station', latitude: 6.9344, longitude: 79.8428 },
  { id: 's2', name: 'Pettah Bus Stand', latitude: 6.9372, longitude: 79.8489 },
  { id: 's3', name: 'Maradana', latitude: 6.9297, longitude: 79.8625 },
  { id: 's4', name: 'Borella Junction', latitude: 6.9147, longitude: 79.8777 },
  { id: 's5', name: 'Nugegoda', latitude: 6.8720, longitude: 79.8895 },
  { id: 's6', name: 'Maharagama', latitude: 6.8487, longitude: 79.9267 },
  { id: 's7', name: 'Kottawa', latitude: 6.8416, longitude: 79.9614 },
  { id: 's8', name: 'Piliyandala', latitude: 6.8006, longitude: 79.9227 },
  { id: 's9', name: 'Moratuwa Station', latitude: 6.7737, longitude: 79.8817 },
  { id: 's10', name: 'Kaduwela', latitude: 6.9309, longitude: 79.9847 },
  { id: 's11', name: 'Kadawatha', latitude: 7.0014, longitude: 79.9529 },
  { id: 's12', name: 'Kiribathgoda', latitude: 7.0286, longitude: 79.9275 },
  { id: 's13', name: 'Kelaniya Temple', latitude: 6.9556, longitude: 79.9189 },
  { id: 's14', name: 'Bambalapitiya', latitude: 6.8889, longitude: 79.8567 },
  { id: 's15', name: 'Dehiwala', latitude: 6.8536, longitude: 79.8644 },
  { id: 's16', name: 'Mount Lavinia', latitude: 6.8271, longitude: 79.8638 },
  { id: 's17', name: 'Panadura', latitude: 6.7137, longitude: 79.9038 },
  { id: 's18', name: 'Homagama', latitude: 6.8410, longitude: 80.0002 },
];

export const RouteMap: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, stopsData] = await Promise.all([
          routingApi.getRoutes(),
          routingApi.getStops()
        ]);
        setRoutes(routesData);
        setStops(stopsData.length > 0 ? stopsData : DUMMY_STOPS as any);
      } catch (err) {
        console.warn('Backend unreachable, using dummy map data');
        setStops(DUMMY_STOPS as any);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stopMarkers = stops.map(s => ({
    id: s.id,
    name: s.name,
    position: { lat: s.latitude, lng: s.longitude }
  }));

  const polylines = routes.map(r => r.polyline);

  return (
    <motion.div 
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.header}>
        <h1>Live Transit Map</h1>
        <p>Monitor routes and stops across the network — {stopMarkers.length} stops loaded.</p>
      </div>

      <div className={styles.mapWrapper}>
        {isLoading ? (
          <div className={styles.loader}>Loading geospatial data...</div>
        ) : (
          <MapWidget stops={stopMarkers} routePolylines={polylines} />
        )}
      </div>
    </motion.div>
  );
};
