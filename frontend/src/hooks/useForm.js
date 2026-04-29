import { useState } from 'react';

// Custom hook for form handling
export const useForm = (initialState, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const setFieldValue = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const setFieldError = (name, error) => {
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
  };
};

export default useForm;
