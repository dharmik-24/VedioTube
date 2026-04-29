import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { videoService } from '../services/videoService';
import { formatNumber } from '../utils/helpers';
import { showErrorToast } from '../utils/toastNotification';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart3, Eye, Users, Heart, MessageSquare } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, videosResponse] = await Promise.all([
        dashboardService.getChannelStats(),
        dashboardService.getChannelVideos(),
      ]);
      setStats(statsResponse.data.data);
      setVideos(videosResponse.data.data);
    } catch (error) {
      showErrorToast('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Channel Dashboard</h1>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BarChart3}
            label="Total Videos"
            value={stats.totalVideos}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={formatNumber(stats.totalViews)}
          />
          <StatCard
            icon={Users}
            label="Subscribers"
            value={formatNumber(stats.totalSubscribers)}
          />
          <StatCard
            icon={Heart}
            label="Video Likes"
            value={formatNumber(stats.totalVideoLikes)}
          />
          <StatCard
            icon={MessageSquare}
            label="Total Tweets"
            value={formatNumber(stats.totalTweets)}
          />
          <StatCard
            icon={Heart}
            label="Tweet Likes"
            value={formatNumber(stats.totalTweetLikes)}
          />
        </div>
      )}

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Videos</h2>
        {videos.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            You haven't uploaded any videos yet
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className="text-accent opacity-50" size={40} />
      </div>
    </div>
  );
};

export default DashboardPage;
