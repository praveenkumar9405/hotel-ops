import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from './hotelSlice';

export const store = configureStore({
  reducer: {
    hotels: hotelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
