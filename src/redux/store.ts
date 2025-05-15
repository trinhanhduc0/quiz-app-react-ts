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
import storage from 'redux-persist/lib/storage';

// 👉 Persist chỉ cho `questions` slice
const questionPersistConfig = {
  key: 'questions',
  storage,
};

const persistedQuestionReducer = persistReducer(questionPersistConfig, questionReducer);

// ✅ Tạo Redux store
export const store = configureStore({
  reducer: {
    classes: classReducer,
    tests: testReducer,
    questions: persistedQuestionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// ✅ Persistor cho redux-persist
export const persistor = persistStore(store);

// ✅ Type cho toàn bộ state & dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
