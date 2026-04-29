import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../../services/userService';
import { logoutSuccess } from '../../store/slices/authSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastNotification';

const Header = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      dispatch(logoutSuccess());
      showSuccessToast('Logged out successfully');
      navigate('/login');
    } catch (error) {
      showErrorToast('Logout failed');
    }
  };

  return (
    <header className="bg-primary border-b border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
          <div className="w-8 h-8 bg-accent rounded-full" />
          <span>VideoTube</span>
        </Link>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 mx-8 max-w-md"
        >
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-l-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-r-full bg-accent text-white hover:bg-red-600 transition"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <button className="p-2 hover:bg-gray-800 rounded-full transition">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 hover:bg-gray-800 px-2 py-1 rounded transition"
                >
                  <img
                    src={user.avatar?.url || 'https://via.placeholder.com/32'}
                    alt={user.userName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">{user.userName}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
                    <Link
                      to={`/channel/${user.userName}`}
                      className="block px-4 py-2 hover:bg-gray-800 first:rounded-t-lg flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} />
                      My Channel
                    </Link>
                    <Link
                      to="/upload"
                      className="block px-4 py-2 hover:bg-gray-800 flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span>📹</span>
                      Upload Video
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 hover:bg-gray-800 flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span>📊</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 last:rounded-b-lg text-red-400 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-accent text-white hover:bg-red-600 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-800 rounded transition"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-700 p-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-accent text-sm"
            />
            <button type="submit" className="p-2 bg-accent rounded-full text-white">
              <Search size={16} />
            </button>
          </form>

          {user ? (
            <>
              <Link
                to={`/channel/${user.userName}`}
                className="block px-3 py-2 hover:bg-gray-800 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Channel
              </Link>
              <Link
                to="/upload"
                className="block px-3 py-2 hover:bg-gray-800 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Upload Video
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 hover:bg-gray-800 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded border border-accent text-accent text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded bg-accent text-white text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
