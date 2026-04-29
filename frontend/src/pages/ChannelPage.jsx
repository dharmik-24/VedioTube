import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoService } from '../services/videoService';
import ChannelProfile from '../components/user/ChannelProfile';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { showErrorToast } from '../utils/toastNotification';
import TweetList from '../components/tweet/TweetList';

const ChannelPage = () => {
  const { userName } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (userId) {
      fetchChannelVideos();
    }
  }, [userId, page]);

  const fetchChannelVideos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await videoService.getAllVideos(page, 12, '', 'createdAt', 'desc', userId);
      if (page === 1) {
        setVideos(response.data.data.videos);
      } else {
        setVideos((prev) => [...prev, ...response.data.data.videos]);
      }
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      showErrorToast('Failed to load channel videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Channel Profile Header */}
      <ChannelProfile userName={userName} onChannelLoaded={(channel) => setUserId(channel._id)} />

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

      {/* Content Section */}
      <div>
        {activeTab === 'videos' ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>

            {loading && page === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <LoadingSkeleton count={12} type="video" />
              </div>
            ) : videos.length === 0 ? (
              <p className="text-gray-400 text-center py-12">
                This channel hasn't uploaded any videos yet
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>

                {page < totalPages && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={loading}
                      className="px-8 py-3 bg-accent text-white rounded-full font-medium hover:bg-red-600 disabled:opacity-50 transition"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <TweetList userId={userId} isOwner={false} />
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
