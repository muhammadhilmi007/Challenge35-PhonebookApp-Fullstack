import React from 'react';
import { render } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';
import { TestWrapper } from './TestWrapper';

interface RenderOptions {
  preloadedState?: any;
  store?: ReturnType<typeof configureStore>;
  [key: string]: any;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {
      contacts: {
        contacts: [],
        loading: false,
        error: null,
      },
    },
    store = configureStore({
      reducer: {
        contacts: (state = preloadedState.contacts, action: { type: string; payload?: any }) => state,
      },
    }),
    ...renderOptions
  }: RenderOptions = {}
) => {
  return {
    store,
    ...render(ui, { wrapper: TestWrapper, ...renderOptions }),
  };
};
