import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EditProfileForm from '../components/user/EditProfileForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <EditProfileForm user={user} onSuccess={() => navigate(`/channel/${user.userName}`)} />
    </div>
  );
};

export default EditProfilePage;
