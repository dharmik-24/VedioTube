import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import { videoService } from '../services/videoService';
import { showErrorToast, showSuccessToast } from '../utils/toastNotification';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import FileUpload from '../components/common/FileUpload';
import Alert from '../components/common/Alert';

const UploadPage = () => {
  const navigate = useNavigate();
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [error, setError] = useState('');
  const { formData, handleChange, handleSubmit, loading, setFieldValue } = useForm(
    {
      title: '',
      description: '',
      videoFile: null,
      thumbnail: null,
    },
    submitForm
  );

  async function submitForm(data) {
    if (!data.title.trim() || !data.videoFile || !data.thumbnail) {
      showErrorToast('Please fill all required fields');
      return;
    }

    try {
      setError('');
      await videoService.publishVideo(data);
      showSuccessToast('Video uploaded successfully!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to upload video';
      setError(errorMsg);
      showErrorToast(errorMsg);
    }
  }

  const handleVideoChange = (file) => {
    setFieldValue('videoFile', file);
    setVideoPreview(file.name);
  };

  const handleThumbnailChange = (file) => {
    setFieldValue('thumbnail', file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Upload Video</h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Input
          label="Video Title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter video title..."
          required
        />

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell viewers about your video..."
          rows={5}
        />

        {/* Video File */}
        <FileUpload
          label="Video File (Required)"
          accept="video/*"
          onChange={handleVideoChange}
          preview={videoPreview}
        />

        {/* Thumbnail */}
        <FileUpload
          label="Thumbnail (Required)"
          accept="image/*"
          onChange={handleThumbnailChange}
          preview={thumbnailPreview}
        />

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" loading={loading} size="lg">
            Publish Video
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
