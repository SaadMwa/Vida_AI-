import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uislice';
import assignmentsReducer from './slices/assignmentSlics';

// We'll add slices here
export const store = configureStore({
  reducer: {
     ui: uiReducer,
    assignments: assignmentsReducer,
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;