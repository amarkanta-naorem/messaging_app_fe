/**
 * Global Error Slice
 * Manages application-wide error state for user-friendly error display
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ErrorState {
  globalError: {
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    timestamp: number;
  } | null;
  isVisible: boolean;
}

const initialState: ErrorState = {
  globalError: null,
  isVisible: false,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    /**
     * Set a global error message to be displayed to the user
     */
    setGlobalError: (
      state, 
      action: PayloadAction<{
        message: string;
        type?: 'error' | 'warning' | 'info' | 'success';
      }>
    ) => {
      state.globalError = {
        message: action.payload.message,
        type: action.payload.type || 'error',
        timestamp: Date.now(),
      };
      state.isVisible = true;
    },
    
    /**
     * Clear the global error
     */
    clearGlobalError: (state) => {
      state.globalError = null;
      state.isVisible = false;
    },
    
    /**
     * Dismiss the error (user clicked close button)
     */
    dismissError: (state) => {
      state.isVisible = false;
    },
  },
});

// Export actions
export const { setGlobalError, clearGlobalError, dismissError } = errorSlice.actions;

// Export selectors
export const selectGlobalError = (state: { error: ErrorState }) => state.error.globalError;
export const selectIsErrorVisible = (state: { error: ErrorState }) => state.error.isVisible;

export default errorSlice.reducer;