import apiClient from './api';

// Playlist service
export const playlistService = {
  // Create playlist
  createPlaylist: async (name, description) => {
    return apiClient.post('/playlist', { name, description });
  },

  // Get playlist by ID
  getPlaylistById: async (playlistId) => {
    return apiClient.get(`/playlist/${playlistId}`);
  },

  // Update playlist
  updatePlaylist: async (playlistId, name, description) => {
    return apiClient.patch(`/playlist/${playlistId}`, { name, description });
  },

  // Delete playlist
  deletePlaylist: async (playlistId) => {
    return apiClient.delete(`/playlist/${playlistId}`);
  },

  // Add video to playlist
  addVideoToPlaylist: async (videoId, playlistId) => {
    return apiClient.patch(`/playlist/add/${videoId}/${playlistId}`);
  },

  // Remove video from playlist
  removeVideoFromPlaylist: async (videoId, playlistId) => {
    return apiClient.patch(`/playlist/remove/${videoId}/${playlistId}`);
  },

  // Get user's playlists
  getUserPlaylists: async (userId, page = 1, limit = 10) => {
    return apiClient.get(`/playlist/user/${userId}`, {
      params: { page, limit },
    });
  },
};
