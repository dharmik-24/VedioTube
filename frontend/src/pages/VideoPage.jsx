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
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const mapSummaryErrorMessage = (reason, fallbackMessage) => {
    const reasonMap = {
      API_LIMIT_REACHED: 'AI service limit has been reached. Please try again later.',
      NO_AUDIO_DETECTED: 'No speech/audio was detected in this video.',
      INSUFFICIENT_CONTENT: 'Not enough spoken content is available to generate a summary.',
      INVALID_VIDEO_URL: 'Video source could not be processed.',
      UNSUPPORTED_AUDIO_FORMAT: 'Audio format is not supported for transcription.',
      AI_SERVICE_ERROR: 'AI summary service is currently unavailable.',
      EMPTY_TRANSCRIPT: 'Transcript could not be generated from the video.',
      INTERNAL_SERVER_ERROR: 'Something went wrong while generating the summary.',
    };

    return reasonMap[reason] || fallbackMessage || 'Summary could not be generated. Please try again.';
  };

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (currentVideo) {
      setAiSummary(currentVideo.summary || '');
      setSummaryError('');
      fetchRelatedVideos();
    }
  }, [currentVideo]);

  useEffect(() => {
    setSummaryLoading(false);
    setSummaryError('');
  }, [videoId]);

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

  const handleGenerateSummary = async () => {
    if (summaryLoading) return;

    setSummaryLoading(true);
    setSummaryError('');

    try {
      const response = await videoService.summarizeVideo(videoId);
      const summary = response?.data?.summary || '';

      if (!summary.trim()) {
        throw new Error('Empty summary');
      }

      setAiSummary(summary);
      dispatch(
        fetchVideoSuccess({
          ...currentVideo,
          summary,
          transcript: currentVideo?.transcript || '',
          summaryStatus: 'completed',
        })
      );
    } catch (error) {
      const reason = error?.response?.data?.reason;
      const message = mapSummaryErrorMessage(reason, error?.response?.data?.message);
      setSummaryError(message);
      showErrorToast(message);
    } finally {
      setSummaryLoading(false);
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
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">AI Video Summary</h3>
            <button
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {summaryLoading ? 'Generating...' : 'Generate AI Summary'}
            </button>
          </div>

          {summaryError && <p className="text-sm text-red-400">{summaryError}</p>}
          {aiSummary ? (
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">{aiSummary}</pre>
          ) : (
            <p className="text-sm text-gray-400">
              Click the button to generate a concise AI summary for this video.
            </p>
          )}
        </div>
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
