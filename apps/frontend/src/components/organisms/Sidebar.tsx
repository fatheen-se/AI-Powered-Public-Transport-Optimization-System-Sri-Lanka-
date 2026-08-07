import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Button } from '../atoms/Button';
import { ThemeToggle } from '../atoms/ThemeToggle';
import styles from './Sidebar.module.css';

interface SidebarProps {
  role?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <aside className={`${styles.sidebar} glass-panel`}>
      <div className={styles.logo}>
        <h2>OptiTransit</h2>
      </div>
      
      <nav className={styles.nav}>
        {(role === 'Admin' || role === 'Authority') && (
          <>
            <NavLink to="/authority/dashboard" className={({isActive}) => isActive ? styles.active : styles.link}>Dashboard</NavLink>
            <NavLink to="/authority/fleet" className={({isActive}) => isActive ? styles.active : styles.link}>Fleet</NavLink>
            <NavLink to="/authority/route-management" className={({isActive}) => isActive ? styles.active : styles.link}>Manage Routes</NavLink>
            <NavLink to="/authority/route-map" className={({isActive}) => isActive ? styles.active : styles.link}>Live Map</NavLink>
          </>
        )}
        {role === 'Passenger' && (
          <>
            <NavLink to="/home" className={({isActive}) => isActive ? styles.active : styles.link}>Home</NavLink>
            <NavLink to="/passenger/search" className={({isActive}) => isActive ? styles.active : styles.link}>Search Routes</NavLink>
            <NavLink to="/passenger/track" className={({isActive}) => isActive ? styles.active : styles.link}>Live Tracking</NavLink>
          </>
        )}
        {role === 'Driver' && (
          <>
            <NavLink to="/driver/dashboard" className={({isActive}) => isActive ? styles.active : styles.link}>Dashboard</NavLink>
            <NavLink to="/driver/active-trip" className={({isActive}) => isActive ? styles.active : styles.link}>Active Trip</NavLink>
          </>
        )}
      </nav>

      <div className={styles.footer}>
        <ThemeToggle />
        <Button variant="secondary" onClick={handleLogout}>Logout</Button>
      </div>
    </aside>
  );
};
