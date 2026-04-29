import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { userService } from '../services/userService';
import { setCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !user) {
        try {
          const response = await userService.getCurrentUser();
          dispatch(setCurrentUser(response.data.data));
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    checkAuth();
  }, [dispatch, user]);

  return { user, isAuthenticated, loading };
};

export default useAuth;
