import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { routingApi, Route, Stop } from '../../../api/routing';
import { DataTable } from '../../molecules/DataTable';
import { Button } from '../../atoms/Button';
import { MapWidget } from '../../organisms/MapWidget';
import styles from './FleetDashboard.module.css'; // Reusing layout styles

export const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddingStop, setIsAddingStop] = useState(false);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [newStopName, setNewStopName] = useState('');
  const [newStopLat, setNewStopLat] = useState<string>('6.9271');
  const [newStopLng, setNewStopLng] = useState<string>('79.8612');

  const [isEditingRouteId, setIsEditingRouteId] = useState<string | null>(null);
  const [editRouteNumber, setEditRouteNumber] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rData, sData] = await Promise.all([
        routingApi.getRoutes(),
        routingApi.getStops()
      ]);
      setRoutes(rData);
      setStops(sData);
    } catch (error) {
      console.error("Failed to load routing data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (loc: {lat: number, lng: number}) => {
    setNewStopLat(loc.lat.toString());
    setNewStopLng(loc.lng.toString());
    setIsAddingStop(true);
  };

  const handleRouteMapClick = (id: string) => {
    const route = routes.find(r => r.id === id);
    if (route) {
      handleEditRoute(route);
    }
  };

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newStopLat);
    const lng = parseFloat(newStopLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Invalid latitude or longitude");
      return;
    }

    try {
      if (editingStopId) {
        const updated = await routingApi.updateStop(editingStopId, {
          name: newStopName,
          latitude: lat,
          longitude: lng,
        });
        setStops(stops.map(s => s.id === editingStopId ? updated : s));
      } else {
        const newStop = await routingApi.createStop({
          name: newStopName,
          latitude: lat,
          longitude: lng,
        });
        setStops([...stops, newStop]);
      }
      setIsAddingStop(false);
      setEditingStopId(null);
      setNewStopName('');
    } catch (error) {
      console.error("Failed to save stop", error);
    }
  };

  const handleEditStop = (stop: Stop) => {
    setEditingStopId(stop.id);
    setNewStopName(stop.name);
    setNewStopLat(stop.latitude.toString());
    setNewStopLng(stop.longitude.toString());
    setIsAddingStop(true);
  };

  const handleDeleteStop = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) return;
    try {
      await routingApi.deleteStop(id);
      setStops(stops.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete stop", err);
    }
  };

  const handleEditRoute = (route: Route) => {
    setIsEditingRouteId(route.id);
    setEditRouteNumber(route.route_number);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingRouteId) return;
    try {
      const updated = await routingApi.updateRoute(isEditingRouteId, {
        route_number: editRouteNumber
      });
      setRoutes(routes.map(r => r.id === isEditingRouteId ? updated : r));
      setIsEditingRouteId(null);
      setEditRouteNumber('');
    } catch (error) {
      console.error("Failed to save route", error);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await routingApi.deleteRoute(id);
      setRoutes(routes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete route", err);
    }
  };

  const routeColumns = [
    { header: 'Route Number', accessor: 'route_number' as keyof Route },
    { header: 'ID', accessor: 'id' as keyof Route },
    {
      header: 'Actions',
      accessor: (r: Route) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={() => handleEditRoute(r)}>Edit</Button>
          <Button onClick={() => handleDeleteRoute(r.id)}>Delete</Button>
        </div>
      )
    }
  ];

  const stopColumns = [
    { header: 'Stop Name', accessor: 'name' as keyof Stop },
    { header: 'Latitude', accessor: 'latitude' as keyof Stop },
    { header: 'Longitude', accessor: 'longitude' as keyof Stop },
    {
      header: 'Actions',
      accessor: (s: Stop) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={() => handleEditStop(s)}>Edit</Button>
          <Button onClick={() => handleDeleteStop(s.id)}>Delete</Button>
        </div>
      )
    }
  ];

  const stopMarkers = stops.map(s => ({
    id: s.id,
    name: s.name,
    position: { lat: s.latitude, lng: s.longitude }
  }));
  const routeLines = routes.map(r => ({
    id: r.id,
    name: r.route_number,
    path: r.polyline
  }));

  return (
    <motion.div 
      className={styles.dashboard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ paddingBottom: '50px' }}
    >
      <div className={styles.header}>
        <div>
          <h1>Route Management</h1>
          <p>Click on the map to add a new stop or edit a route, or use the tables below to manage existing ones.</p>
        </div>
        <div style={{ width: '200px', display: 'flex', gap: '10px' }}>
            <Button onClick={() => {
              setIsAddingStop(!isAddingStop);
              setEditingStopId(null);
              setNewStopName('');
            }}>
              {isAddingStop ? 'Cancel' : '+ Add Stop Manually'}
            </Button>
        </div>
      </div>

      <div style={{ height: '500px', marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
        <MapWidget 
          stops={stopMarkers} 
          routeLines={routeLines} 
          onMapClick={handleMapClick}
          onRouteClick={handleRouteMapClick}
        />
      </div>

      {isAddingStop && (
        <form onSubmit={handleSaveStop} className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Stop Name (e.g. Fort Station)" 
            value={newStopName} 
            onChange={(e) => setNewStopName(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333' }}
          />
          <input 
            type="number" 
            placeholder="Latitude" 
            value={newStopLat} 
            onChange={(e) => setNewStopLat(e.target.value)} 
            required 
            step="any"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333' }}
          />
          <input 
            type="number" 
            placeholder="Longitude" 
            value={newStopLng} 
            onChange={(e) => setNewStopLng(e.target.value)} 
            required 
            step="any"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333' }}
          />
          <Button type="submit">{editingStopId ? 'Update Stop' : 'Save Stop'}</Button>
        </form>
      )}

      {isEditingRouteId && (
        <form onSubmit={handleSaveRoute} className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Route Number (e.g. 138)" 
            value={editRouteNumber} 
            onChange={(e) => setEditRouteNumber(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333' }}
          />
          <Button type="submit">Update Route</Button>
          <Button type="button" onClick={() => setIsEditingRouteId(null)}>Cancel</Button>
        </form>
      )}

      {isLoading ? (
        <div className={styles.loader}>Loading...</div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{marginBottom: '10px'}}>Network Stops</h3>
          <DataTable data={stops} columns={stopColumns} keyExtractor={(s) => s.id} />
          
          <h3 style={{marginTop: '40px', marginBottom: '10px'}}>Network Routes</h3>
          <DataTable data={routes} columns={routeColumns} keyExtractor={(r) => r.id} />
        </div>
      )}
    </motion.div>
  );
};
