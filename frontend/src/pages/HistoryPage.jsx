import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { showErrorToast } from '../utils/toastNotification';

const HistoryPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    setLoading(true);
    try {
      const response = await userService.getWatchHistory();
      setVideos(response.data.data);
    } catch (error) {
      showErrorToast('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Watch History</h1>

      {loading ? (
        <LoadingSpinner />
      ) : videos.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          Your watch history is empty. Start watching videos!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
