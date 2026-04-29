import apiClient from './api';

// Subscription service
export const subscriptionService = {
  // Toggle subscription to channel
  toggleSubscription: async (channelId) => {
    return apiClient.post(`/subscriptions/c/${channelId}`);
  },

  // Get channel subscribers
  getChannelSubscribers: async (channelId) => {
    return apiClient.get(`/subscriptions/u/${channelId}`);
  },

  // Get subscribed channels
  getSubscribedChannels: async (subscriberId) => {
    return apiClient.get(`/subscriptions/c/${subscriberId}`);
  },
};
