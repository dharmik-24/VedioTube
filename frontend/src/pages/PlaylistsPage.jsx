import React, { useState, useEffect } from 'react';
import { playlistService } from '../services/playlistService';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '../utils/toastNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { Plus, Trash2 } from 'lucide-react';

const PlaylistsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await playlistService.getUserPlaylists(user._id);
      setPlaylists(response.data.data);
    } catch (error) {
      showErrorToast('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      showErrorToast('Playlist name is required');
      return;
    }

    setCreating(true);
    try {
      const response = await playlistService.createPlaylist(
        newPlaylistName,
        newPlaylistDesc
      );
      setPlaylists([...playlists, response.data.data]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsCreateModalOpen(false);
      showSuccessToast('Playlist created');
    } catch (error) {
      showErrorToast('Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await playlistService.deletePlaylist(playlistId);
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
      showSuccessToast('Playlist deleted');
    } catch (error) {
      showErrorToast('Failed to delete playlist');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Playlists</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Create Playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No playlists yet</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Your First Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition cursor-pointer group"
            >
              {/* Thumbnail */}
              <div
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="relative h-40 bg-gray-800 overflow-hidden"
              >
                {playlist.videos?.length > 0 ? (
                  <>
                    <img
                      src={playlist.videos[0].thumbnail?.url}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-xs rounded">
                      {playlist.videos.length} videos
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    📂 Empty
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-white line-clamp-2">
                  {playlist.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {playlist.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="text-accent text-sm hover:text-red-600 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(playlist._id)}
                    className="text-gray-400 hover:text-red-400 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Playlist"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Playlist Name"
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="My Playlist"
          />
          <textarea
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
            placeholder="Playlist description (optional)"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-accent focus:outline-none transition resize-none"
            rows={3}
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreatePlaylist}
              loading={creating}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlaylistsPage;
