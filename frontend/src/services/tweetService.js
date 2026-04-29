import apiClient from './api';

// Tweet service
export const tweetService = {
  // Create tweet
  createTweet: async (content) => {
    return apiClient.post('/tweets', { content });
  },

  // Get user's tweets
  getUserTweets: async (userId, page = 1, limit = 10) => {
    return apiClient.get(`/tweets/user/${userId}`, {
      params: { page, limit },
    });
  },

  // Get all tweets globally
  getAllTweets: async (page = 1, limit = 10) => {
    return apiClient.get('/tweets', {
      params: { page, limit },
    });
  },

  // Update tweet
  updateTweet: async (tweetId, content) => {
    return apiClient.patch(`/tweets/${tweetId}`, { content });
  },

  // Delete tweet
  deleteTweet: async (tweetId) => {
    return apiClient.delete(`/tweets/${tweetId}`);
  },
};
