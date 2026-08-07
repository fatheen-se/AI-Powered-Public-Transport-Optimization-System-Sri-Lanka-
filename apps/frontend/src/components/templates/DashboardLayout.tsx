import React from 'react';
import { Sidebar } from '../organisms/Sidebar';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { RootState } from '../../store';
import styles from './DashboardLayout.module.css';

export const DashboardLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className={styles.layout}>
      <Sidebar role={user?.role} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
