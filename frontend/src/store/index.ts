import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import trainingGroupSlice from './slices/trainingGroupSlice';
import exerciseSlice from './slices/exerciseSlice';
import exerciseSessionSlice from './slices/exerciseSessionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    trainingGroups: trainingGroupSlice,
    exercises: exerciseSlice,
    exerciseSessions: exerciseSessionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
