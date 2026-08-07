import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { operationsApi, AnalyticsSummary } from '../../../api/operations';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './AuthorityDashboard.module.css';

export const AuthorityDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    operationsApi.getAnalyticsSummary()
      .then(setData)
      .catch(() => {
        // Use fallback dummy data when backend is down
        setData({
          passengers_today: 14832,
          active_trips: 47,
          estimated_revenue: 285600,
          trend: [
            { date: 'Mon', passengers: 12400 },
            { date: 'Tue', passengers: 13200 },
            { date: 'Wed', passengers: 14100 },
            { date: 'Thu', passengers: 11800 },
            { date: 'Fri', passengers: 15600 },
            { date: 'Sat', passengers: 9800 },
            { date: 'Sun', passengers: 8200 },
          ]
        });
      })
      .finally(() => setLoading(false));
      
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load analytics data.</div>;

  const chartColor = isLight ? '#334155' : '#e2e8f0';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const tooltipBg = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(11,13,23,0.95)';
  const tooltipBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  // Dummy Fleet Feed
  const feed = [
    { id: 1, time: '10:42 AM', msg: 'ND-1234 departed Pettah (Route 138)', type: 'departure' },
    { id: 2, time: '10:38 AM', msg: 'WP-9999 arrived at Nugegoda', type: 'arrival' },
    { id: 3, time: '10:35 AM', msg: 'Driver Kamal logged in for shift', type: 'login' },
    { id: 4, time: '10:20 AM', msg: 'ND-5678 completed Route 120', type: 'complete' },
    { id: 5, time: '10:15 AM', msg: 'NW-3344 delay reported: 8 min late', type: 'delay' },
  ];

  // System Alerts
  const alerts = [
    { id: 1, severity: 'warning', title: 'Route 177 Delay', desc: 'Heavy traffic on Galle Road — avg delay 12 min', time: '9:45 AM' },
    { id: 2, severity: 'danger', title: 'Vehicle Breakdown', desc: 'NW-3344 engine failure near Moratuwa. Replacement dispatched.', time: '9:20 AM' },
    { id: 3, severity: 'info', title: 'Shift Change', desc: 'Afternoon shift drivers reporting — 23 of 25 checked in', time: '2:00 PM' },
    { id: 4, severity: 'success', title: 'Route 138 On-Time', desc: 'All Route 138 buses running within schedule ±2 min', time: '10:30 AM' },
  ];

  // Driver Status
  const drivers = [
    { name: 'Kamal Perera', status: 'Online', route: '138 - Kadawatha to Pettah', shift: '06:00 - 14:00' },
    { name: 'Nimal Silva', status: 'Online', route: '120 - Piliyandala to Pettah', shift: '06:00 - 14:00' },
    { name: 'Sunil Fernando', status: 'On Break', route: '177 - Panadura to Colombo', shift: '10:00 - 18:00' },
    { name: 'Arjuna De Silva', status: 'Offline', route: 'Unassigned', shift: '14:00 - 22:00' },
    { name: 'Ranjith Kumar', status: 'Online', route: '155 - Maharagama to Fort', shift: '06:00 - 14:00' },
  ];

  // Route Performance
  const routePerf = [
    { route: '138', onTime: 94, avgDelay: '2 min', load: '87%', revenue: 'Rs. 42,500' },
    { route: '120', onTime: 88, avgDelay: '4 min', load: '79%', revenue: 'Rs. 38,200' },
    { route: '177', onTime: 72, avgDelay: '8 min', load: '92%', revenue: 'Rs. 51,300' },
    { route: '155', onTime: 91, avgDelay: '3 min', load: '68%', revenue: 'Rs. 31,800' },
    { route: '101', onTime: 85, avgDelay: '5 min', load: '74%', revenue: 'Rs. 35,600' },
  ];

  // Revenue by Route (bar chart)
  const revenueData = [
    { route: 'R138', revenue: 42500 },
    { route: 'R120', revenue: 38200 },
    { route: 'R177', revenue: 51300 },
    { route: 'R155', revenue: 31800 },
    { route: 'R101', revenue: 35600 },
    { route: 'R240', revenue: 28400 },
  ];

  return (
    <motion.div 
      className={styles.dashboard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className={styles.header}>
        <h1>Operations Command Center</h1>
        <p>Real-time monitoring & analytics for your transit network</p>
      </header>

      {/* ─── Stats Grid (5 cards) ─── */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statIcon}>👥</span>
          <h3>Passengers (24h)</h3>
          <p className={styles.statNumber}>{data.passengers_today.toLocaleString()}</p>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statIcon}>🚌</span>
          <h3>Active Fleet</h3>
          <p className={styles.statNumber}>{data.active_trips}</p>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statIcon}>💰</span>
          <h3>Revenue Today</h3>
          <p className={`${styles.statNumber} ${styles.emerald}`}>Rs. {data.estimated_revenue.toLocaleString()}</p>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statIcon}>⏱️</span>
          <h3>On-Time Rate</h3>
          <p className={`${styles.statNumber} ${styles.emerald}`}>86.3%</p>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statIcon}>🧑‍✈️</span>
          <h3>Active Drivers</h3>
          <p className={styles.statNumber}>23</p>
        </div>
      </div>

      {/* ─── System Alerts ─── */}
      <div className={`${styles.alertsPanel} glass-panel`}>
        <h3>⚠️ System Alerts</h3>
        <div className={styles.alertsList}>
          {alerts.map(alert => (
            <div key={alert.id} className={`${styles.alertItem} ${styles[alert.severity]}`}>
              <div className={styles.alertContent}>
                <strong>{alert.title}</strong>
                <p>{alert.desc}</p>
              </div>
              <span className={styles.alertTime}>{alert.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Charts Row ─── */}
      <div className={styles.chartsGrid}>
        <div className={`${styles.chartCard} glass-panel`}>
          <h3>Passenger Volume (Last 7 Days)</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPassengers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" stroke={chartColor} fontSize={12} />
                <YAxis stroke={chartColor} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: chartColor }}
                />
                <Area type="monotone" dataKey="passengers" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorPassengers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.chartCard} glass-panel`}>
          <h3>Revenue by Route</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="route" stroke={chartColor} fontSize={12} />
                <YAxis stroke={chartColor} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: chartColor }}
                  formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Fleet Feed + Driver Status ─── */}
      <div className={styles.chartsGrid}>
        <div id="live-fleet-feed" className={`${styles.chartCard} glass-panel`}>
          <h3>📡 Live Fleet Feed</h3>
          <div className={styles.feedList}>
            {feed.map(item => (
              <div key={item.id} className={styles.feedItem}>
                <span className={styles.feedTime}>{item.time}</span>
                <span className={styles.feedMsg}>{item.msg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.chartCard} glass-panel`}>
          <h3>🧑‍✈️ Driver Status</h3>
          <div className={styles.driverTable}>
            <div className={styles.driverTableHeader}>
              <span>Driver</span>
              <span>Status</span>
              <span>Route</span>
              <span>Shift</span>
            </div>
            {drivers.map((d, i) => (
              <div key={i} className={styles.driverTableRow}>
                <span className={styles.driverName}>{d.name}</span>
                <span className={`badge-${d.status === 'Online' ? 'success' : d.status === 'On Break' ? 'warning' : 'danger'}`}>
                  {d.status}
                </span>
                <span className={styles.driverRoute}>{d.route}</span>
                <span className={styles.driverShift}>{d.shift}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Route Performance Table ─── */}
      <div className={`${styles.chartCard} glass-panel`}>
        <h3>📊 Route Performance</h3>
        <div className={styles.perfTable}>
          <div className={styles.perfTableHeader}>
            <span>Route</span>
            <span>On-Time %</span>
            <span>Avg Delay</span>
            <span>Load</span>
            <span>Revenue</span>
          </div>
          {routePerf.map((r, i) => (
            <div key={i} className={styles.perfTableRow}>
              <span className={styles.routeBadge}>Route {r.route}</span>
              <span style={{ color: r.onTime >= 90 ? 'var(--accent-emerald)' : r.onTime >= 80 ? 'var(--accent-amber)' : 'var(--accent-crimson)', fontWeight: 700 }}>
                {r.onTime}%
              </span>
              <span>{r.avgDelay}</span>
              <span>{r.load}</span>
              <span style={{ fontWeight: 600 }}>{r.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
