/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import contactReducer from './contactSlice';

export const store = configureStore({
  reducer: {
    contacts: contactReducer
  }
});

export default store;
