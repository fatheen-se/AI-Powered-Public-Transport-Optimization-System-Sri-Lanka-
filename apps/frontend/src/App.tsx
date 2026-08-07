import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/pages/Login';
import { DashboardLayout } from './components/templates/DashboardLayout';
import { RequireAuth } from './components/templates/RequireAuth';
import { FleetDashboard } from './components/pages/admin/FleetDashboard';
import { RouteMap } from './components/pages/admin/RouteMap';
import { PassengerHome } from './components/pages/passenger/PassengerHome';
import { SearchRoutes } from './components/pages/passenger/SearchRoutes';
import { AuthorityDashboard } from './components/pages/admin/AuthorityDashboard';
import { RouteManagement } from './components/pages/admin/RouteManagement';
import { DriverDashboard } from './components/pages/driver/DriverDashboard';
import { ActiveTrip } from './components/pages/driver/ActiveTrip';
import { LiveTracking } from './components/pages/passenger/LiveTracking';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes - Admin */}
      <Route path="/authority" element={<RequireAuth allowedRoles={['Admin', 'Authority']}><DashboardLayout /></RequireAuth>}>
        <Route path="dashboard" element={<AuthorityDashboard />} />
        <Route path="fleet" element={<FleetDashboard />} />
        <Route path="route-management" element={<RouteManagement />} />
        <Route path="route-map" element={<RouteMap />} />
      </Route>

      {/* Protected Routes - Passenger */}
      <Route path="/home" element={<RequireAuth allowedRoles={['Passenger']}><DashboardLayout /></RequireAuth>}>
        <Route index element={<PassengerHome />} />
      </Route>
      <Route path="/passenger/search" element={<RequireAuth allowedRoles={['Passenger']}><DashboardLayout /></RequireAuth>}>
        <Route index element={<SearchRoutes />} />
      </Route>
      <Route path="/search" element={<Navigate to="/passenger/search" replace />} />
      <Route path="/passenger/track" element={<RequireAuth allowedRoles={['Passenger']}><DashboardLayout /></RequireAuth>}>
        <Route index element={<LiveTracking />} />
      </Route>
      <Route path="/track" element={<Navigate to="/passenger/track" replace />} />
      
      {/* Protected Routes - Driver */}
      <Route path="/driver/portal" element={<Navigate to="/driver/dashboard" replace />} />
      <Route path="/driver/dashboard" element={<RequireAuth allowedRoles={['Driver']}><DashboardLayout /></RequireAuth>}>
        <Route index element={<DriverDashboard />} />
      </Route>
      <Route path="/driver/active-trip" element={<RequireAuth allowedRoles={['Driver']}><ActiveTrip /></RequireAuth>} />

      {/* Unauth Catch */}
      <Route path="/unauthorized" element={<div>403 Unauthorized</div>} />
    </Routes>
  );
}

export default App;
