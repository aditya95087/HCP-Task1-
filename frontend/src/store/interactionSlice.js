import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchInteractions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/interactions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch interactions');
    }
  }
);

export const logInteraction = createAsyncThunk(
  'interactions/logInteraction',
  async (interactionData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/interactions`, interactionData);
      dispatch(fetchInteractions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to log interaction');
    }
  }
);

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    list: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default interactionSlice.reducer;
