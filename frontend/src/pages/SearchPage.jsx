import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoService } from '../services/videoService';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { showErrorToast } from '../utils/toastNotification';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
    setVideos([]);
  }, [query]);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, page]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const response = await videoService.getAllVideos(page, 12, query);
      if (page === 1) {
        setVideos(response.data.data.videos);
      } else {
        setVideos((prev) => [...prev, ...response.data.data.videos]);
      }
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      showErrorToast('Failed to search videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">
        Search results for "<span className="text-accent">{query}</span>"
      </h1>

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <LoadingSkeleton count={12} type="video" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No videos found for "{query}"</p>
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

export default SearchPage;
