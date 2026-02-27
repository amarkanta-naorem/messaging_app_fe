/**
 * Invite Slice
 * Handles invite code verification state for gated onboarding
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface InviteState {
  isVerified: boolean;
  code: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InviteState = {
  isVerified: false,
  code: null,
  isLoading: false,
  error: null,
};

// Async thunk for verifying invite code
export const verifyInviteCode = createAsyncThunk<
  { code: string },
  string,
  { rejectValue: string }
>("invite/verify", async (code: string, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/invites/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    // Handle explicit success: false from API
    if (data.success === false) {
      return rejectWithValue(data.message || "Invalid or expired invite code");
    }

    if (!response.ok) {
      return rejectWithValue(data.message || "Invalid or expired invite code");
    }

    if (data.success && data.data?.isActive === false) {
      return { code: data.data.code };
    }

    return rejectWithValue("Invalid or expired invite code");
  } catch (error) {
    return rejectWithValue("Failed to verify invite code. Please try again.");
  }
});

const inviteSlice = createSlice({
  name: "invite",
  initialState,
  reducers: {
    verifyInviteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    verifyInviteSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isVerified = true;
      state.code = action.payload;
      state.error = null;
    },
    verifyInviteFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isVerified = false;
      state.error = action.payload;
    },
    resetInvite: (state) => {
      state.isVerified = false;
      state.code = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyInviteCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyInviteCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isVerified = true;
        state.code = action.payload.code;
        state.error = null;
      })
      .addCase(verifyInviteCode.rejected, (state, action) => {
        state.isLoading = false;
        state.isVerified = false;
        state.error = action.payload || "Failed to verify invite code";
      });
  },
});

// Export actions
export const {
  verifyInviteStart,
  verifyInviteSuccess,
  verifyInviteFailure,
  resetInvite,
} = inviteSlice.actions;

// Selectors
export const selectInvite = (state: { invite: InviteState }) => state.invite;
export const selectIsVerified = (state: { invite: InviteState }) => state.invite.isVerified;
export const selectInviteCode = (state: { invite: InviteState }) => state.invite.code;
export const selectIsInviteLoading = (state: { invite: InviteState }) => state.invite.isLoading;
export const selectInviteError = (state: { invite: InviteState }) => state.invite.error;

// Export reducer
export default inviteSlice.reducer;
