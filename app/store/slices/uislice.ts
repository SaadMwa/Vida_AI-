import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  isMobile: boolean;
  currentPage: string;
}

const initialState: UIState = {
  sidebarOpen: true,
  isMobile: false,
  currentPage: 'assignments',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      // Auto-close sidebar on mobile
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setIsMobile, setCurrentPage } = uiSlice.actions;
export default uiSlice.reducer;