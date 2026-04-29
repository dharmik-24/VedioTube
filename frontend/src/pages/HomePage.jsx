import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { videoService } from '../services/videoService';
import {
  fetchVideosStart,
  fetchVideosSuccess,
  fetchVideosFail,
} from '../store/slices/videoSlice';
import VideoCard from '../components/video/VideoCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { showErrorToast } from '../utils/toastNotification';

const HomePage = () => {
  const dispatch = useDispatch();
  const { videos, loading, pagination } = useSelector((state) => state.video);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  const fetchVideos = async (pageNum) => {
    dispatch(fetchVideosStart());
    try {
      const response = await videoService.getAllVideos(pageNum, 12, '', 'createdAt', 'desc');
      dispatch(
        fetchVideosSuccess({
          videos: pageNum === 1 ? response.data.data.videos : [...videos, ...response.data.data.videos],
          currentPage: pageNum,
          totalVideos: response.data.data.totalVideos,
          totalPages: response.data.data.totalPages,
        })
      );
    } catch (error) {
      dispatch(fetchVideosFail('Failed to load videos'));
      showErrorToast('Failed to load videos');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Recommended</h1>
        <p className="text-gray-400">Fresh videos for you</p>
      </div>

      {/* Videos Grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <LoadingSkeleton count={12} type="video" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No videos available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Load More Button */}
          {page < pagination.totalPages && (
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
  );
};

export default HomePage;
