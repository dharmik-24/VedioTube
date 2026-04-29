import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import { showErrorToast, showSuccessToast } from '../utils/toastNotification';
import VideoCard from '../components/video/VideoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { Trash2, Edit } from 'lucide-react';

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const response = await playlistService.getPlaylistById(playlistId);
      setPlaylist(response.data.data);
      setEditName(response.data.data.name);
      setEditDesc(response.data.data.description || '');
    } catch (error) {
      showErrorToast('Failed to load playlist');
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm('Remove this video from playlist?')) return;

    try {
      await playlistService.removeVideoFromPlaylist(videoId, playlistId);
      setPlaylist({
        ...playlist,
        videos: playlist.videos.filter((v) => v._id !== videoId),
      });
      showSuccessToast('Video removed from playlist');
    } catch (error) {
      showErrorToast('Failed to remove video');
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!editName.trim()) {
      showErrorToast('Playlist name cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const response = await playlistService.updatePlaylist(playlistId, editName, editDesc);
      setPlaylist({ ...playlist, name: editName, description: editDesc });
      setIsEditModalOpen(false);
      showSuccessToast('Playlist updated successfully');
    } catch (error) {
      showErrorToast('Failed to update playlist');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Are you sure you want to delete this playlist? This cannot be undone.')) {
      return;
    }

    try {
      await playlistService.deletePlaylist(playlistId);
      showSuccessToast('Playlist deleted successfully');
      navigate('/playlists');
    } catch (error) {
      showErrorToast('Failed to delete playlist');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!playlist)
    return <p className="text-center text-gray-400">Playlist not found</p>;

  return (
    <div className="space-y-6">
      {/* Playlist Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
            <p className="text-gray-400 mt-2">{playlist.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              {playlist.videos?.length || 0} videos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit size={18} className="mr-2" />
              Edit
            </Button>
            <Button variant="primary" onClick={handleDeletePlaylist} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal onClose={() => setIsEditModalOpen(false)}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Edit Playlist</h2>
            <Input
              label="Playlist Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter playlist name"
            />
            <textarea
              className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:border-accent"
              placeholder="Enter playlist description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePlaylist} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Videos */}
      {playlist.videos?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">This playlist is empty</p>
          <Button onClick={() => navigate('/')}>Find videos</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {playlist.videos.map((video) => (
            <div
              key={video._id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition flex gap-4 p-3"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-40 h-28 rounded overflow-hidden">
                <img
                  src={video.thumbnail?.url}
                  alt={video.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => navigate(`/video/${video._id}`)}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-white line-clamp-2 cursor-pointer hover:text-accent transition"
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  {video.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                  {video.owner?.fullName}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {video.views} views • {video.duration}s
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveVideo(video._id)}
                className="p-2 text-gray-400 hover:text-red-400 transition flex-shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailPage;
