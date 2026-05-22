import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { api, Assignment, CreateAssignmentInput } from '../../../lib/api';

interface AssignmentsState {
  items: Assignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAssignments = createAsyncThunk('assignments/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.getAssignments();
    return res.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch assignments';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (data: CreateAssignmentInput, { rejectWithValue }) => {
    try {
      const res = await api.createAssignment(data);
      toast.success('Assignment created successfully!');
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create assignment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAssignmentById = createAsyncThunk(
  'assignments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteAssignment(id);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete assignment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch';
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteAssignmentById.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default assignmentsSlice.reducer;
