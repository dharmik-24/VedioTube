import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { subscriptionService } from '../../services/subscriptionService';
import { formatNumber } from '../../utils/helpers';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ChannelProfile = ({ userName, isOwner, onChannelLoaded }) => {
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchChannelProfile();
  }, [userName]);

  const fetchChannelProfile = async () => {
    try {
      const response = await userService.getChannelProfile(userName);
      const data = response.data.data;
      setChannel(data);
      setIsSubscribed(data.isSubscribed);
      if (onChannelLoaded) onChannelLoaded(data);
    } catch (error) {
      showErrorToast('Failed to load channel');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      await subscriptionService.toggleSubscription(channel._id);
      setIsSubscribed(!isSubscribed);
      setChannel({
        ...channel,
        subscribersCount: isSubscribed ? channel.subscribersCount - 1 : channel.subscribersCount + 1
      });
      showSuccessToast(isSubscribed ? 'Unsubscribed' : 'Subscribed');
    } catch (error) {
      showErrorToast('Failed to update subscription');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!channel)
    return <p className="text-center text-gray-400">Channel not found</p>;

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative">
        <img
          src={channel.coverImage?.url || 'https://via.placeholder.com/1200x300'}
          alt={channel.fullName}
          className="w-full h-48 md:h-64 object-cover rounded-lg"
        />
      </div>

      {/* Channel Info */}
      <div className="flex items-end gap-4 md:gap-6">
        <img
          src={channel.avatar?.url || 'https://via.placeholder.com/120'}
          alt={channel.fullName}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary -mt-12"
        />

        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {channel.fullName}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            @{channel.userName}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {formatNumber(channel.subscribersCount || 0)} subscribers
          </p>
        </div>

        {isOwner ? (
          <Button
            onClick={() => navigate('/edit-profile')}
            variant="secondary"
            className="mb-2"
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            onClick={handleSubscribe}
            disabled={subscribing}
            variant={isSubscribed ? 'secondary' : 'primary'}
            className="mb-2"
          >
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        )}
      </div>

      {/* Channel Description */}
      {channel.email && (
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-gray-300 text-sm">{channel.email}</p>
        </div>
      )}
    </div>
  );
};

export default ChannelProfile;
