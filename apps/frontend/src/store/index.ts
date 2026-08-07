import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { actionLogger } from './middleware/actionLogger';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(actionLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
