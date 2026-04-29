// App.jsx has 4 major things
// 1. Layout (Header + Sidebar)
// 2. Routing (public + protected)
// 3. Authentication persistence (auto login)
// 4. Global UI (Toaster)

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { setCurrentUser } from './store/slices/authSlice';
import { userService } from './services/userService';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VideoPage from './pages/VideoPage';
import UploadPage from './pages/UploadPage';
import ChannelPage from './pages/ChannelPage';
import SearchPage from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import MyChannelPage from './pages/MyChannelPage';
import LikedVideosPage from './pages/LikedVideosPage';
import EditProfilePage from './pages/EditProfilePage';
import HistoryPage from './pages/HistoryPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import ExplorePage from './pages/ExplorePage';
import NotFoundPage from './pages/NotFoundPage';
import TweetsPage from './pages/TweetsPage';

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication on app load...
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !user) {     //Token exists but redux doesnt have user the  fetch user again...
        try {
          const response = await userService.getCurrentUser();
          dispatch(setCurrentUser(response.data.data));
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setAuthChecked(true);   //User refreshes page but still stays logged in
    };

    checkAuth();
  }, [dispatch, user]);

  if (!authChecked) {
    return <div className="flex items-center justify-center h-screen bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
    </div>;
  }

  return (
    <div className="bg-secondary text-white min-h-screen">
      {/* Header */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/channel/:userName" element={<ChannelPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/explore" element={<ExplorePage />} />

            {/* Protected Routes */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-channel"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <MyChannelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/liked-videos"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <LikedVideosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <PlaylistsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlist/:playlistId"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <PlaylistDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tweets"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={false}>
                  <TweetsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 - Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;
