import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { userService } from '../../services/userService';
import { loginSuccess } from '../../store/slices/authSlice';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import { isValidEmail, isValidPassword } from '../../utils/helpers';
import Button from '../common/Button';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import Alert from '../common/Alert';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    userName: '',
    password: '',
    avatar: null,
    coverImage: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleAvatarChange = (file) => {
    setFormData({ ...formData, avatar: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageChange = (file) => {
    setFormData({ ...formData, coverImage: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.fullName) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.userName) {
      errors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      errors.userName = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.avatar) {
      errors.avatar = 'Avatar is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await userService.register(formData);
      // Auto-login after registration
      const loginResponse = await userService.login(formData.email, formData.password);
      dispatch(
        loginSuccess({
          user: loginResponse.data.data.user,
          accessToken: loginResponse.data.data.accessToken,
          refreshToken: loginResponse.data.data.refreshToken,
        })
      );
      showSuccessToast('Registration successful!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Join VideoTube</h1>
        <p className="text-gray-400">Create your account to get started</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          error={fieldErrors.fullName}
        />

        {/* Username */}
        <Input
          label="Username"
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="johndoe"
          error={fieldErrors.userName}
        />

        {/* Password */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={fieldErrors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Avatar Upload */}
        <FileUpload
          label="Avatar (Required)"
          accept="image/*"
          onChange={handleAvatarChange}
          preview={avatarPreview}
          error={fieldErrors.avatar}
        />

        {/* Cover Image Upload */}
        <FileUpload
          label="Cover Image (Optional)"
          accept="image/*"
          onChange={handleCoverImageChange}
          preview={coverImagePreview}
        />

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-red-600 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
