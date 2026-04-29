import apiClient from './api';

// User service
export const userService = {
  // Auth endpoints
  register: async (data) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('fullName', data.fullName);
    formData.append('userName', data.userName);
    formData.append('password', data.password);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.coverImage) formData.append('coverImage', data.coverImage);

    return apiClient.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },   //Why ?? => BCS JSON can not handle binary files...
    });
  },

  login: async (email, password) => {
    return apiClient.post('/users/login', { email, password });
  },

  logout: async () => {
    return apiClient.post('/users/logout');
  },

  refreshToken: async (refreshToken) => {
    return apiClient.post('/users/refresh-token', { refreshToken });
  },

  // User profile endpoints
  getCurrentUser: async () => {
    return apiClient.get('/users/current-user');
  },

  getChannelProfile: async (userName) => {
    return apiClient.get(`/users/channel/${userName}`);
  },

  updateProfile: async (data) => {
    return apiClient.patch('/users/update-account', data);
  },

  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    return apiClient.patch('/users/update-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateCoverImage: async (coverImageFile) => {
    const formData = new FormData();
    formData.append('coverImage', coverImageFile);
    return apiClient.patch('/users/update-coverimage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: async (oldPassword, newPassword) => {
    return apiClient.post('/users/change-password', {
      oldPassword,
      newPassword,
    });
  },

  getWatchHistory: async () => {
    return apiClient.get('/users/watch-history');
  },
};
