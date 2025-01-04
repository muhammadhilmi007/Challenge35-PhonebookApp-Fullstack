import React from 'react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';

// Create mock store
const mockStore = configureStore({
  reducer: {
    contacts: (state = { contacts: [], loading: false, error: null }, action: { type: string; payload?: any }) => state,
  },
});

interface WrapperProps {
  children: ReactNode;
}

export const TestWrapper = ({ children }: WrapperProps) => (
  <Provider store={mockStore}>
    <NavigationContainer>{children}</NavigationContainer>
  </Provider>
);
