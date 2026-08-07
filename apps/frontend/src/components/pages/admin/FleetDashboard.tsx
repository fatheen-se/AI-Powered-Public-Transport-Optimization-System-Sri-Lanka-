import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fleetApi, Vehicle } from '../../../api/fleet';
import { DataTable } from '../../molecules/DataTable';
import { Button } from '../../atoms/Button';
import styles from './FleetDashboard.module.css';

export const FleetDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [newCap, setNewCap] = useState(40);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await fleetApi.getVehicles();
      // Use dummy data if backend is empty or fails
      if (!data || data.length === 0) {
        throw new Error("No data");
      }
      setVehicles(data);
    } catch (error) {
      console.warn("Backend unreachable or empty, using dummy fleet data");
      setVehicles([
        { id: 'v1', registration_number: 'WP ND-1234', capacity: 54, status: 'ACTIVE' },
        { id: 'v2', registration_number: 'WP NB-5678', capacity: 42, status: 'ACTIVE' },
        { id: 'v3', registration_number: 'WP NC-9012', capacity: 54, status: 'MAINTENANCE' },
        { id: 'v4', registration_number: 'WP NA-3456', capacity: 30, status: 'OUT_OF_SERVICE' },
        { id: 'v5', registration_number: 'WP NE-7890', capacity: 54, status: 'ACTIVE' },
        { id: 'v6', registration_number: 'WP ND-4321', capacity: 42, status: 'ACTIVE' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newVehicle = await fleetApi.createVehicle({
        registration_number: newReg,
        capacity: newCap,
        status: 'OUT_OF_SERVICE',
      });
      setVehicles([...vehicles, newVehicle]);
      setIsAdding(false);
      setNewReg('');
    } catch (error) {
      console.error("Failed to create vehicle", error);
    }
  };

  const columns = [
    { header: 'Registration', accessor: 'registration_number' as keyof Vehicle },
    { header: 'Capacity', accessor: 'capacity' as keyof Vehicle },
    { 
      header: 'Status', 
      accessor: (row: Vehicle) => (
        <span className={`${styles.badge} ${styles[row.status.toLowerCase()]}`}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
  ];

  return (
    <motion.div 
      className={styles.dashboard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.header}>
        <div>
          <h1>Fleet Management</h1>
          <p>Monitor and manage transit vehicles.</p>
        </div>
        <div style={{ width: '200px' }}>
            <Button onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? 'Cancel' : '+ Add Vehicle'}
            </Button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddVehicle} className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Registration (e.g. NA-1234)" 
            value={newReg} 
            onChange={(e) => setNewReg(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333' }}
          />
          <input 
            type="number" 
            placeholder="Capacity" 
            value={newCap} 
            onChange={(e) => setNewCap(parseInt(e.target.value))} 
            required 
            min="10"
            max="150"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333' }}
          />
          <Button type="submit">Save Vehicle</Button>
        </form>
      )}

      <div className={styles.stats}>
        <div className={`${styles.statCard} glass-panel`}>
          <h3>Total Vehicles</h3>
          <p className={styles.statValue}>{vehicles.length}</p>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <h3>Active</h3>
          <p className={styles.statValue}>{vehicles.filter(v => v.status === 'ACTIVE').length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>Loading fleet data...</div>
      ) : (
        <DataTable data={vehicles} columns={columns} keyExtractor={(v) => v.id} />
      )}
    </motion.div>
  );
};
