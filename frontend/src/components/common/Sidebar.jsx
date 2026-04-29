import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Tv,
  Clock,
  Heart,
  History,
  DownloadCloud,
  MessageSquare,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: MessageSquare, label: 'Tweets Feed', path: '/tweets', auth: true },
    { icon: Tv, label: 'Subscriptions', path: '/subscriptions', auth: true },
  ];

  const libraryItems = [
    { icon: History, label: 'History', path: '/history', auth: true },
    { icon: Tv, label: 'My Channel', path: '/my-channel', auth: true },
    { icon: Heart, label: 'Liked videos', path: '/liked-videos', auth: true },
    { icon: DownloadCloud, label: 'Playlists', path: '/playlists', auth: true },
  ];

  const MenuItem = ({ icon: Icon, label, path, auth }) => {
    if (auth && !user) return null;

    return (
      <Link
        to={path}
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white"
      >
        <Icon size={20} />
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-16 left-0 h-[calc(100vh-64px)] md:h-auto w-64 bg-primary border-r border-gray-700 overflow-y-auto transition-transform md:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-4">
          {/* Main Menu */}
          <div className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-3">
              Menu
            </p>
            {menuItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </div>

          {user && (
            <>
              <div className="border-t border-gray-700 my-4" />

              {/* Library Menu */}
              <div>
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-3">
                  Your Library
                </p>
                {libraryItems.map((item, index) => (
                  <MenuItem key={index} {...item} />
                ))}
              </div>
            </>
          )}

          {!user && (
            <>
              <div className="border-t border-gray-700 my-4" />
              <div className="px-4 space-y-3">
                <p className="text-sm text-gray-400">
                  Sign in to like videos, comment, and subscribe.
                </p>
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 rounded-full border-2 border-gray-600 text-center text-sm font-medium hover:border-accent transition"
                >
                  SIGN IN
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
