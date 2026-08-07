import { Middleware } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

export const actionLogger: Middleware = (store) => (next) => (action: any) => {
  // Let the action pass to the reducers first
  const result = next(action);

  // We filter to log only critical actions, not every UI hover/change to prevent network flood
  const criticalActions = ['auth/setAuth', 'auth/logout', 'map/routeSelected', 'booking/submit'];
  
  if (action && action.type && criticalActions.includes(action.type)) {
    // Fire and forget logic - don't block the UI
    const logData = {
      actionType: action.type,
      payload: action.payload,
      timestamp: new Date().toISOString(),
    };
    
    // Attempt to log to backend observability endpoint (we will build this backend later)
    apiClient.post('/observability/logs/', logData).catch(e => {
        // Silently fail logging in production to avoid crashing the app
        console.warn('Frontend action log failed to sync:', e);
    });
  }

  return result;
};
