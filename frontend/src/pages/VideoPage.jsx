import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { videoService } from '../services/videoService';
import {
  fetchVideoStart,
  fetchVideoSuccess,
  fetchVideoFail,
} from '../store/slices/videoSlice';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentSection from '../components/video/CommentSection';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { showErrorToast } from '../utils/toastNotification';

const VideoPage = () => {
  const { videoId } = useParams();
  const dispatch = useDispatch();
  const { currentVideo, loading } = useSelector((state) => state.video);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (currentVideo) {
      fetchRelatedVideos();
    }
  }, [currentVideo]);

  const fetchVideo = async () => {
    dispatch(fetchVideoStart());
    try {
      const response = await videoService.getVideoById(videoId);
      dispatch(fetchVideoSuccess(response.data.data));
    } catch (error) {
      dispatch(fetchVideoFail('Failed to load video'));
      showErrorToast('Failed to load video');
    }
  };

  const fetchRelatedVideos = async () => {
    setRelatedLoading(true);
    try {
      const response = await videoService.getAllVideos(1, 9, currentVideo.title.split(' ')[0]);
      setRelatedVideos(
        response.data.data.videos.filter((v) => v._id !== videoId).slice(0, 8)
      );
    } catch (error) {
      try {
        // Fallback to general videos if the specific query throws a 404 (no videos found)
        const fallback = await videoService.getAllVideos(1, 9);
        setRelatedVideos(
          fallback.data.data.videos.filter((v) => v._id !== videoId).slice(0, 8)
        );
      } catch (fallbackError) {
        showErrorToast('Failed to load related videos');
      }
    } finally {
      setRelatedLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!currentVideo)
    return <p className="text-center text-gray-400">Video not found</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <VideoPlayer video={currentVideo} />
        <CommentSection videoId={videoId} />
      </div>

      {/* Sidebar - Related Videos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Related Videos</h3>
        {relatedLoading ? (
          <LoadingSpinner />
        ) : relatedVideos.length === 0 ? (
          <p className="text-gray-400 text-sm">No related videos</p>
        ) : (
          <div className="space-y-4">
            {relatedVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
