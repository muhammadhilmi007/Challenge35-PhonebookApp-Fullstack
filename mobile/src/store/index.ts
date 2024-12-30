import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { ThunkMiddleware, thunk } from 'redux-thunk';
import { contactsReducer } from './contacts/reducer';
import { ContactsState, ContactsActionTypes } from './contacts/types';
import { AnyAction } from 'redux';

// Define the root state type
export interface RootState {
  contacts: ContactsState;
}

// Create the root reducer
const rootReducer = combineReducers({
  contacts: contactsReducer,
});

// Configure middlewares
const middlewares = [thunk as ThunkMiddleware<RootState, AnyAction>];

// Create the store enhancer
const composeEnhancers = (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const enhancer = composeEnhancers(applyMiddleware(...middlewares));

// Create store with middleware
const store = createStore(rootReducer, enhancer);

// Export types
export type AppDispatch = typeof store.dispatch;
export default store;
