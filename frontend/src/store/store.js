import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import hcpReducer from './hcpSlice';
import interactionReducer from './interactionSlice';
import formReducer from './formSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    hcps: hcpReducer,
    interactions: interactionReducer,
    form: formReducer,
  },
});
