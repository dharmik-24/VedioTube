import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { userService } from '../../services/userService';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import Button from '../common/Button';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';

const EditProfileForm = ({ user, onSuccess }) => {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = React.useState(user?.avatar?.url || null);
  const { formData, handleChange, handleSubmit, loading, setFieldValue } = useForm(
    {
      email: user?.email || '',
      fullName: user?.fullName || '',
      userName: user?.userName || '',
      avatar: null,
    },
    submitForm
  );

  async function submitForm(data) {
    try {
      // Update profile
      if (data.email || data.fullName || data.userName) {
        await userService.updateProfile({
          email: data.email,
          fullName: data.fullName,
          userName: data.userName,
        });
      }

      // Update avatar if provided
      if (data.avatar) {
        await userService.updateAvatar(data.avatar);
      }

      showSuccessToast('Profile updated successfully');
      onSuccess?.();
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update profile');
    }
  }

  const handleAvatarChange = (file) => {
    setFieldValue('avatar', file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-white">Edit Profile</h2>

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <Input
        label="Full Name"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
      />

      <Input
        label="Username"
        type="text"
        name="userName"
        value={formData.userName}
        onChange={handleChange}
        disabled
      />

      <FileUpload
        label="Change Avatar"
        accept="image/*"
        onChange={handleAvatarChange}
        preview={avatarPreview}
      />

      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
