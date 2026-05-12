import apiClient from './api';

// Video service
export const videoService = {
  // Get all videos with pagination
  getAllVideos: async (page = 1, limit = 12, query = '', sortBy = 'createdAt', sortType = 'desc', userId = '') => {
    return apiClient.get('/videos', {
      params: { page, limit, query, sortBy, sortType, ...(userId && { userId }) },
    });
  },

  // Publish new video
  publishVideo: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('videoFile', data.videoFile);
    formData.append('thumbnail', data.thumbnail);

    return apiClient.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get video by ID (increments views)
  getVideoById: async (videoId) => {
    return apiClient.get(`/videos/${videoId}`);
  },

  // Update video
  updateVideo: async (videoId, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);

    return apiClient.patch(`/videos/${videoId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete video
  deleteVideo: async (videoId) => {
    return apiClient.delete(`/videos/${videoId}`);
  },

  // Toggle publish status
  togglePublishStatus: async (videoId) => {
    return apiClient.patch(`/videos/toggle/publish/${videoId}`);
  },

  // Generate AI summary on demand
  summarizeVideo: async (videoId) => {
    return apiClient.post(`/videos/${videoId}/summarize`);
  },
};
