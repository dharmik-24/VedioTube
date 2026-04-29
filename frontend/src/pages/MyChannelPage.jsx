import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { videoService } from '../services/videoService';
import { subscriptionService } from '../services/subscriptionService';
import { showErrorToast } from '../utils/toastNotification';
import ChannelProfile from '../components/user/ChannelProfile';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Button from '../components/common/Button';
import TweetList from '../components/tweet/TweetList';

const MyChannelPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [myVideos, setMyVideos] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchChannelData();
  }, [user]);

  const fetchChannelData = async () => {
    setLoading(true);
    try {
      if (user?._id) {
        // Fetch user's videos
        await fetchMyVideos();
        
        // Fetch subscribers
        const response = await subscriptionService.getChannelSubscribers(user._id);
        setSubscribers(response.data.data);
      }
    } catch (error) {
      showErrorToast('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVideos = async () => {
    setVideosLoading(true);
    try {
      // Fetch all videos and filter by current user
      const response = await videoService.getAllVideos(1, 100);
      const userVideos = response.data.data.videos.filter(
        (video) => video.owner?._id === user?._id
      );
      setMyVideos(userVideos);
    } catch (error) {
      showErrorToast('Failed to load your videos');
    } finally {
      setVideosLoading(false);
    }
  };

  if (!user) return null;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Channel Profile */}
      <div className="mb-6">
        <ChannelProfile userName={user.userName} isOwner={true} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={() => navigate('/upload')} className="w-full">
          📹 Upload Video
        </Button>
        <Button onClick={() => navigate('/dashboard')} variant="secondary" className="w-full">
          📊 View Dashboard
        </Button>
        <Button onClick={() => navigate('/playlists')} variant="secondary" className="w-full">
          📂 My Playlists
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mt-8 mb-6">
        <button
          className={`pb-3 px-6 font-medium text-lg border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          Videos & Subscribers
        </button>
        <button
          className={`pb-3 px-6 font-medium text-lg border-b-2 transition-colors ${
            activeTab === 'tweets'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('tweets')}
        >
          Tweets
        </button>
      </div>

      {/* Content Section */}
      <div>
        {activeTab === 'videos' ? (
          <div className="space-y-8">
            {/* My Videos */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">My Videos</h2>
              {videosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <LoadingSkeleton count={8} type="video" />
                </div>
              ) : myVideos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">You haven't uploaded any videos yet</p>
                  <Button onClick={() => navigate('/upload')}>Upload Your First Video</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myVideos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}
            </div>

            {/* Subscribers */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Recent Subscribers</h2>
              {subscribers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No subscribers yet. Keep creating great content!
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {subscribers.slice(0, 8).map((subscriber) => (
                    <div key={subscriber._id} className="text-center">
                      <img
                        src={subscriber.avatar?.url || 'https://via.placeholder.com/80'}
                        alt={subscriber.fullName}
                        className="w-16 h-16 rounded-full mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-white line-clamp-2">
                        {subscriber.fullName}
                      </p>
                      <p className="text-xs text-gray-400">@{subscriber.userName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <TweetList userId={user._id} isOwner={true} />
        )}
      </div>
    </div>
  );
};

export default MyChannelPage;
