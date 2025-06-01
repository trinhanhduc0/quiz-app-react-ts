import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_ENDPOINTS from '~/config';
import { apiCallDelete, apiCallGet, apiCallPatch, apiCallPost } from '~/services/apiCallService';
import { NavigateFunction } from 'react-router-dom';
import { TestFormData } from '~/pages/ManageTest/ManageTestModal';

const LINK = API_ENDPOINTS.TESTS;

// --------- Type Definitions ---------
export interface Test {
  _id: string;
  [key: string]: any;
}

interface TestState {
  allTests: TestFormData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface FetchTestsParams {
  navigate: NavigateFunction;
}

interface DeleteTestParams {
  _id: string;
  navigate: NavigateFunction;
}

interface ResetTestData{
  class_id: string;
  test_id:string;
}

interface ResetTestParams{
  values: ResetTestData,
  navigate: NavigateFunction
}

interface SaveTestParams {
  values: TestFormData;
  navigate: NavigateFunction;
}

interface CreateTestParams {
  values: TestFormData;
  navigate: NavigateFunction;
}

// --------- Async Thunks ---------
export const fetchTests = createAsyncThunk<TestFormData[], FetchTestsParams>(
  'tests/fetchTests',
  async ({ navigate }) => {
    const response = await apiCallGet(LINK, navigate);
    return Array.isArray(response) ? response : [];
  },
);

export const deleteTest = createAsyncThunk<{ success: boolean }, DeleteTestParams>(
  'tests/deleteTest',
  async ({ _id, navigate }) => {
    return apiCallDelete(LINK, { _id }, navigate);
  },
);

export const saveTest = createAsyncThunk<TestFormData, SaveTestParams>(
  'tests/saveTest',
  async ({ values, navigate }) => {
    return apiCallPatch(LINK, values, navigate);
  },
);

export const createTest = createAsyncThunk<TestFormData, CreateTestParams>(
  'tests/createTest',
  async ({ values, navigate }) => {
    return apiCallPost(LINK, values, navigate);
  },
);

export const resetTest = createAsyncThunk<ResetTestData, ResetTestParams >(
  'tests/resetTest',
  async ({ values, navigate }) => {
    return apiCallPost(API_ENDPOINTS.RESET_TEST, values, navigate);
  },
);

// --------- Slice ---------
const initialState: TestState = {
  allTests: [],
  status: 'idle',
  error: null,
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTests
      .addCase(fetchTests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTests.fulfilled, (state, action: PayloadAction<TestFormData[]>) => {
        state.status = 'succeeded';
        state.allTests = action.payload || [];
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      })
      // createTest
      .addCase(createTest.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        state.allTests.push(action.payload);
      })

      // saveTest
      .addCase(saveTest.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        const { _id } = action.payload;
        state.allTests = state.allTests.map((test) => (test._id === _id ? action.payload : test));
      })

      // deleteTest
      .addCase(deleteTest.fulfilled, (state, action) => {
        const { _id } = action.meta.arg;
        state.allTests = state.allTests.filter((test) => test._id !== _id);
      });
  },
});

export default testSlice.reducer;
