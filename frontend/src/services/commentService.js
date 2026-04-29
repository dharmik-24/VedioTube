import apiClient from './api';

// Comment service
export const commentService = {
  // Get comments for a video
  getVideoComments: async (videoId, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'desc') => {
    return apiClient.get(`/comments/${videoId}`, {
      params: { page, limit, sortBy, sortType },
    });
  },

  // Add comment to video
  addComment: async (videoId, content) => {
    return apiClient.post(`/comments/${videoId}`, { comment: content });
  },

  // Update comment
  updateComment: async (commentId, content) => {
    return apiClient.patch(`/comments/c/${commentId}`, { comment: content });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return apiClient.delete(`/comments/c/${commentId}`);
  },
};
