import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Driver.module.css';

export const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();

  const assignedRoute = {
    id: 1,
    name: '138 - Kadawatha to Pettah',
    busNumber: 'WP ND-1234',
  };

  const startTrip = () => {
    navigate('/driver/active-trip');
  };

  // Dummy data
  const tripHistory = [
    { id: 1, route: '138 - Kadawatha → Pettah', time: '06:15 AM - 07:30 AM', passengers: 42 },
    { id: 2, route: '138 - Pettah → Kadawatha', time: '08:00 AM - 09:10 AM', passengers: 38 },
    { id: 3, route: '120 - Piliyandala → Pettah', time: 'Yesterday 14:00', passengers: 51 },
    { id: 4, route: '138 - Kadawatha → Pettah', time: 'Yesterday 06:20', passengers: 45 },
    { id: 5, route: '120 - Pettah → Piliyandala', time: 'Jul 22, 16:15', passengers: 33 },
  ];

  const upcomingSchedule = [
    { id: 1, time: '14:00', route: '138 - Kadawatha → Pettah' },
    { id: 2, time: '16:00', route: '138 - Pettah → Kadawatha' },
    { id: 3, time: '18:00', route: '120 - Piliyandala → Pettah' },
  ];

  const messages = [
    { id: 1, sender: 'Control Center', time: '10:15 AM', body: 'Speed limit advisory: 40km/h on Baseline Rd due to construction.', type: 'urgent' },
    { id: 2, sender: 'Operations', time: '09:30 AM', body: 'Route 138 schedule adjusted. Next departure pushed to 14:00.', type: 'info' },
    { id: 3, sender: 'Admin', time: 'Yesterday', body: 'Monthly performance report available. Check driver portal.', type: 'info' },
  ];

  return (
    <motion.div 
      className={styles.driverContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.header}>
        <h1>Driver Portal 🚌</h1>
        <div className={styles.statusIndicator}>✅ Available for Duty</div>
      </div>

      {/* ─── Row 1: Assignment + Diagnostics ─── */}
      <div className={styles.grid}>
        <div className={`${styles.card} glass-panel`}>
          <h2>📋 Current Assignment</h2>
          <div className={styles.assignmentDetails}>
            <p><strong>Route:</strong> {assignedRoute.name}</p>
            <p><strong>Vehicle:</strong> {assignedRoute.busNumber}</p>
            <p><strong>Shift:</strong> 06:00 AM - 14:00 PM</p>
            <p><strong>Next Stop:</strong> Borella Junction (ETA 12 min)</p>
          </div>
          <button className={styles.bigButton} onClick={startTrip}>
            ▶ START TRIP
          </button>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <h2>🔧 Vehicle Diagnostics</h2>
          <ul className={styles.diagList}>
            <li><span>Fuel Level:</span> <strong style={{color: 'var(--accent-emerald)'}}>84% (Good)</strong></li>
            <li><span>Engine Temp:</span> <strong>Normal (82°C)</strong></li>
            <li><span>Next Service:</span> <strong>In 1,200 km</strong></li>
            <li><span>Tire Pressure:</span> <strong style={{color: 'var(--accent-emerald)'}}>32 PSI (OK)</strong></li>
            <li><span>Battery:</span> <strong>12.4V (Good)</strong></li>
          </ul>
        </div>
      </div>

      {/* ─── Row 2: Earnings + Performance ─── */}
      <div className={styles.grid}>
        <div className={`${styles.card} glass-panel`}>
          <h2>💰 Today's Earnings</h2>
          <p className={styles.earningsAmount}>Rs. 4,850</p>
          <div className={styles.earningsBreakdown}>
            <div className={styles.earningsRow}>
              <span>Route 138 (Morning)</span>
              <span>Rs. 2,100</span>
            </div>
            <div className={styles.earningsRow}>
              <span>Route 138 (Return)</span>
              <span>Rs. 1,900</span>
            </div>
            <div className={styles.earningsRow}>
              <span>Route 120 (Extra)</span>
              <span>Rs. 850</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <h2>📊 Performance</h2>
          <div className={styles.performanceGrid}>
            <div className={styles.perfStat}>
              <span className={styles.perfValue} style={{color: 'var(--accent-emerald)'}}>94%</span>
              <span className={styles.perfLabel}>On-Time Rate</span>
            </div>
            <div className={styles.perfStat}>
              <span className={styles.perfValue} style={{color: 'var(--accent-blue)'}}>4.7</span>
              <span className={styles.perfLabel}>Passenger Rating</span>
            </div>
            <div className={styles.perfStat}>
              <span className={styles.perfValue} style={{color: 'var(--accent-purple)'}}>238</span>
              <span className={styles.perfLabel}>Trips This Month</span>
            </div>
            <div className={styles.perfStat}>
              <span className={styles.perfValue} style={{color: 'var(--accent-amber)'}}>2</span>
              <span className={styles.perfLabel}>Incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Trip History + Schedule ─── */}
      <div className={styles.grid}>
        <div className={`${styles.card} glass-panel`}>
          <h2>🕐 Trip History</h2>
          <div className={styles.tripHistoryList}>
            {tripHistory.map(trip => (
              <div key={trip.id} className={styles.tripHistoryItem}>
                <div className={styles.tripInfo}>
                  <span className={styles.tripRoute}>{trip.route}</span>
                  <span className={styles.tripMeta}>{trip.time}</span>
                </div>
                <span className={styles.tripPassengers}>{trip.passengers} pax</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <h2>📅 Upcoming Schedule</h2>
          <div className={styles.scheduleList}>
            {upcomingSchedule.map(s => (
              <div key={s.id} className={styles.scheduleItem}>
                <span className={styles.scheduleTime}>{s.time}</span>
                <span className={styles.scheduleRoute}>{s.route}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Row 4: Messages ─── */}
      <div className={`${styles.card} glass-panel`}>
        <h2>📨 Messages from Control Center</h2>
        <div className={styles.messagesList}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.messageItem} ${styles[msg.type]}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageSender}>{msg.sender}</span>
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
              <p className={styles.messageBody}>{msg.body}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
