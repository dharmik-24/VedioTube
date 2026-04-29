import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useSelector } from 'react-redux';
import { showErrorToast } from '../utils/toastNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const SubscriptionsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await subscriptionService.getSubscribedChannels(user._id);
      // Handle the response structure
      const subscribedChannels = response.data.data || [];
      setChannels(Array.isArray(subscribedChannels) ? subscribedChannels : []);
    } catch (error) {
      showErrorToast('Failed to load subscriptions');
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>

      {channels.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          You're not subscribed to any channels yet
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <Link
              key={channel._id}
              to={`/channel/${channel.userName}`}
              className="group cursor-pointer"
            >
              <div className="bg-gray-900 rounded-lg p-4 text-center hover:bg-gray-800 transition">
                <img
                  src={channel.avatar?.url || 'https://via.placeholder.com/100'}
                  alt={channel.fullName}
                  className="w-20 h-20 rounded-full mx-auto mb-3 group-hover:scale-105 transition"
                />
                <h3 className="font-semibold text-white line-clamp-2">
                  {channel.fullName}
                </h3>
                <p className="text-xs text-gray-400">@{channel.userName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
