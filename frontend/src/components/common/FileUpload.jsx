import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({
  label = '',
  accept = 'image/*',
  onChange,
  error = '',
  preview = null,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-accent bg-red-900 bg-opacity-20'
            : 'border-gray-600 hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="space-y-2">
            {accept.includes('image') ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded"
              />
            ) : (
              <div className="flex justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <p className="text-sm text-gray-400">Click or drag to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-300">
              Drag and drop your file here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              {accept === 'image/*' ? 'PNG, JPG or GIF' : 'Any video format'}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FileUpload;
