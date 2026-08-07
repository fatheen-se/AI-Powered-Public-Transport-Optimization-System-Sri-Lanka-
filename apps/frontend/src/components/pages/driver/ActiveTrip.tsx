import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Driver.module.css';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useSelector } from 'react-redux';

export const ActiveTrip: React.FC = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [capacity, setCapacity] = useState<'Empty' | 'Half' | 'Full'>('Empty');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Connect to the same websocket channel the fleet simulation uses
  const { isConnected, sendMessage } = useWebSocket('ws://localhost:8001/ws/fleet/');
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    // Start watching physical GPS location
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const currentPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setPosition(currentPos);
          
          // Send live coordinates to the backend via WebSocket
          if (isConnected) {
            sendMessage({
              vehicle_id: user?.email || 'real-driver-1',
              lat: currentPos.lat,
              lng: currentPos.lng,
              capacity: capacity,
              timestamp: new Date().toISOString()
            });
          }
        },
        (err) => {
          console.error("Error getting location:", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      setWatchId(id);
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isConnected, sendMessage, capacity, user]);

  const stopTrip = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    navigate('/driver/dashboard');
  };

  return (
    <div className={styles.driverContainer}>
      <div className={styles.header}>
        <h1>Trip Active</h1>
        <div className={`${styles.statusIndicator} ${styles.live}`}>● LIVE TRACKING</div>
      </div>

      <div className={styles.card}>
        <h2>GPS Status</h2>
        <p>{isConnected ? 'Connected to Network' : 'Reconnecting...'}</p>
        <div className={styles.coordinates}>
          {position ? `Lat: ${position.lat.toFixed(5)} | Lng: ${position.lng.toFixed(5)}` : 'Waiting for GPS...'}
        </div>
      </div>

      <div className={styles.card}>
        <h2>Passenger Capacity</h2>
        <div className={styles.capacitySelector}>
          <button 
            className={`${styles.capacityBtn} ${capacity === 'Empty' ? styles.active : ''}`}
            onClick={() => setCapacity('Empty')}
          >
            Empty
          </button>
          <button 
            className={`${styles.capacityBtn} ${capacity === 'Half' ? styles.active : ''}`}
            onClick={() => setCapacity('Half')}
          >
            Half
          </button>
          <button 
            className={`${styles.capacityBtn} ${capacity === 'Full' ? styles.active : ''}`}
            onClick={() => setCapacity('Full')}
          >
            Full
          </button>
        </div>
      </div>

      <button className={`${styles.bigButton} ${styles.stopBtn}`} onClick={stopTrip}>
        END TRIP
      </button>
    </div>
  );
};
