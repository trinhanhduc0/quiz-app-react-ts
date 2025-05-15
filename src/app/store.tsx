import { configureStore } from '@reduxjs/toolkit';
import classReducer from '~/redux/class/classSlice';
import testReducer from '~/redux/test/testSlice';
import questionReducer from '~/redux/question/questionSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage

import { combineReducers } from 'redux';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['questions'], // only persist questionReducer
};

// Combine reducers
const rootReducer = combineReducers({
  classes: classReducer,
  tests: testReducer,
  questions: questionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

// Type helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
