import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { updateFormBulk } from './formSlice';

const API_URL = 'http://localhost:8000/api';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, { message });
      const { response: aiText, form_data } = response.data;

      // If the AI extracted form data, push it into the form slice
      if (form_data) {
        dispatch(updateFormBulk(form_data));
      }

      return { sender: 'ai', text: aiText };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      {
        sender: 'ai',
        text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.',
      },
    ],
    isLoading: false,
    error: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ sender: 'user', text: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        const detail = action.payload?.detail || '';
        const isRateLimit = detail.includes('RESOURCE_EXHAUSTED') || detail.includes('429');
        state.messages.push({
          sender: 'ai',
          text: isRateLimit
            ? 'API rate limit reached. Please wait a minute and try again.'
            : 'Sorry, I encountered an error processing your request.',
        });
      });
  },
});

export const { addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
