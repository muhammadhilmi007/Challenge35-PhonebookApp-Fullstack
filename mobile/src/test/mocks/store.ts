import configureMockStore from 'redux-mock-store';
import { Middleware } from 'redux';

export interface RootState {
  contacts: {
    contacts: any[];
    loading: boolean;
    error: string | null;
  };
}

const thunkMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
};

const middlewares = [thunkMiddleware];
const mockStoreCreator = configureMockStore();

export const createMockStore = (initialState: Partial<RootState> = {}) => {
  const defaultState: RootState = {
    contacts: {
      contacts: [],
      loading: false,
      error: null,
    },
  };

  return mockStoreCreator({
    ...defaultState,
    ...initialState,
  });
};
