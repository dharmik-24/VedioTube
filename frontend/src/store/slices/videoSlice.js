import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    totalVideos: 0,
    totalPages: 0,
  },
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    // Fetch videos
    fetchVideosStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVideosSuccess: (state, action) => {
      state.loading = false;
      state.videos = action.payload.videos;
      state.pagination = {
        page: action.payload.currentPage,
        limit: action.payload.limit || 12,
        totalVideos: action.payload.totalVideos,
        totalPages: action.payload.totalPages,
      };
    },
    fetchVideosFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single video
    fetchVideoStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVideoSuccess: (state, action) => {
      state.loading = false;
      state.currentVideo = action.payload;
    },
    fetchVideoFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Upload video
    uploadVideoStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    uploadVideoSuccess: (state, action) => {
      state.loading = false;
      state.videos.unshift(action.payload);
    },
    uploadVideoFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete video
    deleteVideoStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVideoSuccess: (state, action) => {
      state.loading = false;
      state.videos = state.videos.filter((v) => v._id !== action.payload);
    },
    deleteVideoFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update video
    updateVideoStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVideoSuccess: (state, action) => {
      state.loading = false;
      const index = state.videos.findIndex((v) => v._id === action.payload._id);
      if (index !== -1) {
        state.videos[index] = action.payload;
      }
      if (state.currentVideo?._id === action.payload._id) {
        state.currentVideo = action.payload;
      }
    },
    updateVideoFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current video
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
  },
});

export const {
  fetchVideosStart,
  fetchVideosSuccess,
  fetchVideosFail,
  fetchVideoStart,
  fetchVideoSuccess,
  fetchVideoFail,
  uploadVideoStart,
  uploadVideoSuccess,
  uploadVideoFail,
  deleteVideoStart,
  deleteVideoSuccess,
  deleteVideoFail,
  updateVideoStart,
  updateVideoSuccess,
  updateVideoFail,
  clearError,
  clearCurrentVideo,
} = videoSlice.actions;

export default videoSlice.reducer;
