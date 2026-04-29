import apiClient from './api';

// Like service
export const likeService = {
  // Toggle like on video
  toggleVideoLike: async (videoId) => {
    return apiClient.post(`/likes/toggle/v/${videoId}`);
  },

  // Toggle like on comment
  toggleCommentLike: async (commentId) => {
    return apiClient.post(`/likes/toggle/c/${commentId}`);
  },

  // Toggle like on tweet
  toggleTweetLike: async (tweetId) => {
    return apiClient.post(`/likes/toggle/t/${tweetId}`);
  },

  // Get all liked videos
  getLikedVideos: async () => {
    return apiClient.get('/likes/videos');
  },

  // Get all liked tweets
  getLikedTweets: async () => {
    return apiClient.get('/likes/tweets');
  },
};
