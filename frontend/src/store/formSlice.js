import { createSlice } from '@reduxjs/toolkit';

const formSlice = createSlice({
  name: 'form',
  initialState: {
    hcp_id: '',
    hcp_name: '',
    method: 'Meeting',
    date: '',
    time: '',
    attendees: '',
    summary: '',
    next_steps: '',
  },
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    updateFormBulk: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetForm: () => ({
      hcp_id: '',
      hcp_name: '',
      method: 'Meeting',
      date: '',
      time: '',
      attendees: '',
      summary: '',
      next_steps: '',
    }),
  },
});

export const { updateFormField, updateFormBulk, resetForm } = formSlice.actions;
export default formSlice.reducer;
