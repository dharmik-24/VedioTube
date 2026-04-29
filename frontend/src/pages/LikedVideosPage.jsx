import React, { useState, useEffect } from 'react';
import { likeService } from '../services/likeService';
import VideoCard from '../components/video/VideoCard';
import TweetCard from '../components/tweet/TweetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { showErrorToast } from '../utils/toastNotification';

const LikedVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (activeTab === 'videos') {
      fetchLikedVideos();
    } else {
      fetchLikedTweets();
    }
  }, [activeTab]);

  const fetchLikedVideos = async () => {
    setLoading(true);
    try {
      const response = await likeService.getLikedVideos();
      const videoList = response.data.data?.map((item) => item.video) || [];
      setVideos(videoList);
    } catch (error) {
      showErrorToast('Failed to load liked videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedTweets = async () => {
    setLoading(true);
    try {
      const response = await likeService.getLikedTweets();
      const tweetList = response.data.data?.map((item) => item.tweet) || [];
      setTweets(tweetList);
    } catch (error) {
      showErrorToast('Failed to load liked tweets');
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTweetDeleted = (tweetId) => {
    setTweets(tweets.filter((t) => t._id !== tweetId));
  };

  const handleTweetUpdated = (updatedTweet) => {
    setTweets(tweets.map((t) => (t._id === updatedTweet._id ? { ...t, content: updatedTweet.content } : t)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white">Liked Content</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`pb-3 px-6 font-medium text-lg border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
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

      {loading ? (
        activeTab === 'videos' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <LoadingSkeleton count={12} type="video" />
          </div>
        ) : (
          <div className="py-8"><LoadingSpinner /></div>
        )
      ) : activeTab === 'videos' ? (
        videos.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No liked videos yet. Like some videos to see them here!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )
      ) : (
        tweets.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No liked tweets yet. Like some tweets to see them here!
          </p>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {tweets.map((tweet) => (
              <TweetCard 
                key={tweet._id} 
                tweet={tweet} 
                onTweetDeleted={handleTweetDeleted}
                onTweetUpdated={handleTweetUpdated}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default LikedVideosPage;
