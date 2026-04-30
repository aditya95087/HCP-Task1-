import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchHCPs = createAsyncThunk(
  'hcps/fetchHCPs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hcps`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch HCPs');
    }
  }
);

const hcpSlice = createSlice({
  name: 'hcps',
  initialState: {
    list: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default hcpSlice.reducer;
