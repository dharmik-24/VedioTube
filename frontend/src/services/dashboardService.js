import apiClient from './api';

// Dashboard service
export const dashboardService = {
  // Get channel statistics
  getChannelStats: async () => {
    return apiClient.get('/dashboard/stats');
  },

  // Get channel videos
  getChannelVideos: async () => {
    return apiClient.get('/dashboard/videos');
  },
};
