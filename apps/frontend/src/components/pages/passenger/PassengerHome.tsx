import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { routingApi, Stop } from '../../../api/routing';
import { MapWidget } from '../../organisms/MapWidget';
import styles from './PassengerHome.module.css';
import { Button } from '../../atoms/Button';

// Fallback dummy stops (real Sri Lankan bus stops)
const DUMMY_STOPS: Stop[] = [
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
  { id: 's15', name: 'Dehiwala Zoo', latitude: 6.8536, longitude: 79.8644 },
] as any;

export const PassengerHome: React.FC = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [calculatedFare, setCalculatedFare] = useState<string | null>(null);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const data = await routingApi.getStops();
        setStops(data.length > 0 ? data : DUMMY_STOPS);
      } catch (err) {
        console.warn('Backend unreachable, using dummy stops');
        setStops(DUMMY_STOPS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStops();
  }, []);

  const stopMarkers = stops.map(s => ({
    id: s.id,
    name: s.name,
    position: { lat: s.latitude, lng: s.longitude }
  }));

  // Dummy data
  const recentTrips = [
    { id: 1, route: '138 - Pettah to Homagama', date: 'Today, 08:30 AM', fare: 'Rs. 150' },
    { id: 2, route: '120 - Piliyandala to Pettah', date: 'Yesterday, 17:15 PM', fare: 'Rs. 120' },
    { id: 3, route: '177 - Panadura to Colombo', date: 'Jul 22, 07:45 AM', fare: 'Rs. 180' },
    { id: 4, route: '155 - Maharagama to Fort', date: 'Jul 21, 16:00 PM', fare: 'Rs. 90' },
    { id: 5, route: '101 - Kaduwela to Pettah', date: 'Jul 20, 09:10 AM', fare: 'Rs. 110' },
  ];

  const notifications = [
    { id: 1, type: 'delay', title: 'Route 177 Delayed', desc: 'Heavy traffic on Galle Road. Expect 10-15 min delays.', time: '15 min ago' },
    { id: 2, type: 'info', title: 'New Route Available', desc: 'Route 240: Kottawa → Colombo Fort via expressway.', time: '2 hours ago' },
    { id: 3, type: 'promo', title: 'Weekend Pass', desc: 'Get unlimited rides this weekend for Rs. 500!', time: '5 hours ago' },
    { id: 4, type: 'diversion', title: 'Route 138 Diverted', desc: 'Due to road work near Borella, buses using alternate route.', time: '1 day ago' },
  ];

  const favoriteRoutes = [
    { id: 1, number: '138', from: 'Kadawatha', to: 'Pettah', nextBus: '5 min' },
    { id: 2, number: '120', from: 'Piliyandala', to: 'Pettah', nextBus: '12 min' },
    { id: 3, number: '155', from: 'Maharagama', to: 'Fort', nextBus: '8 min' },
  ];

  const upcomingSchedule = [
    { id: 1, route: '138', time: '11:15 AM', from: 'Kadawatha', status: 'On Time' },
    { id: 2, route: '120', time: '11:25 AM', from: 'Piliyandala', status: 'Delayed 3m' },
    { id: 3, route: '177', time: '11:30 AM', from: 'Panadura', status: 'On Time' },
    { id: 4, route: '155', time: '11:40 AM', from: 'Maharagama', status: 'On Time' },
    { id: 5, route: '101', time: '11:50 AM', from: 'Kaduwela', status: 'Delayed 5m' },
  ];

  const handleCalculateFare = () => {
    if (selectedFrom && selectedTo && selectedFrom !== selectedTo) {
      const fares: Record<string, number> = { 's1': 0, 's2': 15, 's3': 30, 's4': 50, 's5': 70, 's6': 90, 's7': 120, 's8': 110, 's9': 100, 's10': 80, 's11': 75, 's12': 85, 's13': 60, 's14': 45, 's15': 55 };
      const diff = Math.abs((fares[selectedFrom] || 50) - (fares[selectedTo] || 80));
      setCalculatedFare(`Rs. ${diff + 30}`);
    }
  };

  return (
    <motion.div 
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.header}>
        <h1>Welcome Back 👋</h1>
        <p>Explore your local public transport network</p>
      </div>

      {/* ─── Top Row: Wallet + Notifications ─── */}
      <div className={styles.topWidgets}>
        <div className={`${styles.walletCard} glass-panel`}>
          <div className={styles.walletInfo}>
            <h3>💳 Transit Wallet</h3>
            <p className={styles.balance}>Rs. 2,450.00</p>
            <span className={styles.walletSubtext}>Last top-up: Rs. 500 on Jul 22</span>
          </div>
          <Button variant="primary">Top Up Wallet</Button>
        </div>

        <div className={`${styles.notificationsCard} glass-panel`}>
          <h3>🔔 Service Alerts</h3>
          <div className={styles.notificationsList}>
            {notifications.map(n => (
              <div key={n.id} className={`${styles.notifItem} ${styles[n.type]}`}>
                <div className={styles.notifContent}>
                  <strong>{n.title}</strong>
                  <p>{n.desc}</p>
                </div>
                <span className={styles.notifTime}>{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Middle Row: Favorites + Fare Calculator ─── */}
      <div className={styles.topWidgets}>
        <div className={`${styles.favoritesCard} glass-panel`}>
          <h3>⭐ Favorite Routes</h3>
          <div className={styles.favoritesList}>
            {favoriteRoutes.map(r => (
              <div key={r.id} className={styles.favoriteItem}>
                <div className={styles.favBadge}>R{r.number}</div>
                <div className={styles.favInfo}>
                  <span className={styles.favRoute}>{r.from} → {r.to}</span>
                  <span className={styles.favNext}>Next bus: {r.nextBus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.fareCalcCard} glass-panel`}>
          <h3>🧮 Fare Calculator</h3>
          <div className={styles.fareForm}>
            <select className={styles.fareSelect} value={selectedFrom} onChange={e => setSelectedFrom(e.target.value)}>
              <option value="">From...</option>
              {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className={styles.fareSelect} value={selectedTo} onChange={e => setSelectedTo(e.target.value)}>
              <option value="">To...</option>
              {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Button variant="primary" onClick={handleCalculateFare}>Calculate</Button>
            {calculatedFare && (
              <div className={styles.fareResult}>
                Estimated Fare: <strong>{calculatedFare}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Recent Trips + Upcoming Schedule ─── */}
      <div className={styles.topWidgets}>
        <div className={`${styles.tripsCard} glass-panel`}>
          <h3>🕐 Recent Trips</h3>
          <ul className={styles.tripList}>
            {recentTrips.map(trip => (
              <li key={trip.id}>
                <div>
                  <strong>{trip.route}</strong>
                  <span className={styles.tripDate}>{trip.date}</span>
                </div>
                <span className={styles.tripFare}>{trip.fare}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.scheduleCard} glass-panel`}>
          <h3>📅 Upcoming Departures</h3>
          <div className={styles.scheduleList}>
            {upcomingSchedule.map(s => (
              <div key={s.id} className={styles.scheduleItem}>
                <div className={styles.schedBadge}>R{s.route}</div>
                <div className={styles.schedInfo}>
                  <span className={styles.schedTime}>{s.time}</span>
                  <span className={styles.schedFrom}>from {s.from}</span>
                </div>
                <span className={`${styles.schedStatus} ${s.status === 'On Time' ? styles.onTime : styles.delayed}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Map ─── */}
      <div className={styles.mapWrapper}>
        <h3 className={styles.mapTitle}>🗺️ Live Network Map</h3>
        {isLoading ? (
          <div className={styles.loader}>Locating nearest stops...</div>
        ) : (
          <MapWidget stops={stopMarkers} />
        )}
      </div>
    </motion.div>
  );
};
