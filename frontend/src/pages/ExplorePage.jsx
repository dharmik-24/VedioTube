import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import VideoCard from '../components/video/VideoCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { showErrorToast } from '../utils/toastNotification';

const ExplorePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVideos();
  }, [sortBy, sortType, page]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await videoService.getAllVideos(page, 12, '', sortBy, sortType);
      if (page === 1) {
        setVideos(response.data.data.videos);
      } else {
        setVideos((prev) => [...prev, ...response.data.data.videos]);
      }
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      showErrorToast('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
        <p className="text-gray-400">Discover new videos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-gray-300">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="createdAt">Newest</option>
            <option value="views">Most Views</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-gray-300">
          <span>Order:</span>
          <select
            value={sortType}
            onChange={(e) => {
              setSortType(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {/* Videos Grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <LoadingSkeleton count={12} type="video" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No videos found</p>
        </div>
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
  );
};

export default ExplorePage;
