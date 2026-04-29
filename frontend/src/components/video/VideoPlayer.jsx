import React, { useState, useEffect } from 'react';
import { ThumbsUp, Share2, MoreVertical, Trash2, FolderPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { likeService } from '../../services/likeService';
import { videoService } from '../../services/videoService';
import { subscriptionService } from '../../services/subscriptionService';
import { playlistService } from '../../services/playlistService';
import { formatNumber } from '../../utils/helpers';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import toast from 'react-hot-toast';

const VideoPlayer = ({ video, onVideoDeleted }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [likes, setLikes] = useState({
    isLiked: false,
    count: 0,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  useEffect(() => {
    // Initialize likes and subscription state
    setLikes({
      isLiked: video?.isLiked || false,
      count: video?.likes || 0,
    });
    setIsSubscribed(video?.isSubscribed || false);
  }, [video]);

  const handleLike = async () => {
    if (likesLoading) return;
    setLikesLoading(true);
    try {
      await likeService.toggleVideoLike(video._id);
      // Optimistic update
      setLikes({
        isLiked: !likes.isLiked,
        count: likes.isLiked ? likes.count - 1 : likes.count + 1,
      });
      showSuccessToast(likes.isLiked ? 'Like removed' : 'Video liked');
    } catch (error) {
      showErrorToast('Failed to like video');
    } finally {
      setLikesLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      await subscriptionService.toggleSubscription(video.owner._id);
      setIsSubscribed(!isSubscribed);
      showSuccessToast(isSubscribed ? 'Unsubscribed' : 'Subscribed');
    } catch (error) {
      showErrorToast('Failed to update subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await videoService.deleteVideo(video._id);
      showSuccessToast('Video deleted successfully');
      onVideoDeleted?.();
      navigate('/');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to delete video');
    } finally {
      setDeleting(false);
      setShowMoreMenu(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(url);
    toast("Link Copied Successfully")
  };

  const handleOpenPlaylistModal = async () => {
    if (!user) {
      showErrorToast("Please login to save to playlist");
      return;
    }
    setShowPlaylistModal(true);
    setLoadingPlaylists(true);
    try {
      const response = await playlistService.getUserPlaylists(user._id);
      setPlaylists(response.data.data);
    } catch (error) {
      showErrorToast("Failed to load your playlists");
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const toggleVideoInPlaylist = async (playlist) => {
    const isVideoInPlaylist = playlist.videos.some(v => v._id === video._id);
    try {
      if (isVideoInPlaylist) {
        await playlistService.removeVideoFromPlaylist(video._id, playlist._id);
        setPlaylists(playlists.map(p => p._id === playlist._id ? { ...p, videos: p.videos.filter(v => v._id !== video._id) } : p));
        toast.success("Removed from playlist");
      } else {
        await playlistService.addVideoToPlaylist(video._id, playlist._id);
        setPlaylists(playlists.map(p => p._id === playlist._id ? { ...p, videos: [...p.videos, { _id: video._id }] } : p));
        toast.success("Added to playlist");
      }
    } catch (error) {
      showErrorToast("Failed to update playlist");
    }
  };

  const isVideoOwner = user?._id === video?.owner?._id;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          src={video.videoFile?.url}
          controls
          className="w-full aspect-video"
          controlsList="nodownload"
        />
      </div>

      {/* Video Title */}
      <h1 className="text-2xl font-bold text-white">{video.title}</h1>

      {/* Stats and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Channel Info */}
          <div className="flex items-center gap-4">
            <img
              src={video.owner?.avatar?.url || 'https://via.placeholder.com/48'}
              alt={video.owner?.fullName}
              className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate(`/channel/${video.owner?.userName}`)}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/channel/${video.owner?.userName}`)}
                  className="font-semibold text-white hover:text-accent transition text-left"
                >
                  {video.owner?.fullName}
                </button>
                {/* Subscribe Button Beside Username */}
                {!isVideoOwner && (
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className={`px-3 py-1 text-sm rounded-full font-medium transition ${isSubscribed
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-black hover:bg-gray-200'
                      }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>
              <div 
                className="flex items-center gap-2 text-sm text-gray-400 mt-0.5 cursor-pointer hover:text-white transition"
                onClick={() => navigate(`/channel/${video.owner?.userName}`)}
              >
                <span>@{video.owner?.userName}</span>
                <span>•</span>
                <span>{formatNumber(video?.subscribers || 0)} subscribers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 bg-gray-900 rounded-full p-1 relative">
          <button
            onClick={handleLike}
            disabled={likesLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${likes.isLiked
                ? 'bg-gray-800 text-accent'
                : 'hover:bg-gray-800 text-gray-300'
              }`}
          >
            <ThumbsUp size={20} />
            <span className="text-sm">{formatNumber(likes.count)}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-full text-gray-300 transition"
          >
            <Share2 size={20} />
            <span className="text-sm">Share</span>
          </button>

          <button
            onClick={handleOpenPlaylistModal}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-full text-gray-300 transition"
          >
            <FolderPlus size={20} />
            <span className="text-sm hidden sm:inline">Save</span>
          </button>

          <div className="relative">
            {isVideoOwner && (
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-300 transition"
              >
                <MoreVertical size={20} />
              </button>
            )}

            {/* More Menu */}
            {showMoreMenu && isVideoOwner && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
                <button
                  onClick={handleDeleteVideo}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-gray-700 transition text-left rounded-lg"
                >
                  <Trash2 size={18} />
                  <span>{deleting ? 'Deleting...' : 'Delete Video'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <p className="text-sm text-gray-300 line-clamp-3">{video.description}</p>
        <button className="text-accent text-sm mt-2 font-medium hover:text-red-600 transition">
          Show more
        </button>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-sm w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Save to playlist</h3>
              <button 
                onClick={() => setShowPlaylistModal(false)}
                className="p-1 hover:bg-gray-800 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {loadingPlaylists ? (
                <p className="text-gray-400 text-center py-4">Loading playlists...</p>
              ) : playlists.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">You don't have any playlists yet.</p>
              ) : (
                playlists.map(playlist => {
                  const isAdded = playlist.videos.some(v => v._id === video._id);
                  return (
                    <label key={playlist._id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={isAdded}
                        readOnly
                        onClick={() => toggleVideoInPlaylist(playlist)}
                        className="w-4 h-4 rounded text-accent bg-gray-800 border-gray-600 focus:ring-accent"
                      />
                      <span className="text-white text-sm line-clamp-1">{playlist.name}</span>
                    </label>
                  )
                })
              )}
            </div>
            
            <div className="mt-6">
              <button 
                onClick={() => { setShowPlaylistModal(false); navigate('/playlists'); }}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
              >
                Manage Playlists
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
