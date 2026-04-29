import React from 'react';

const Textarea = ({
  placeholder = '',
  value = '',
  onChange,
  error = '',
  label = '',
  rows = 4,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:border-accent focus:outline-none transition resize-none ${
          error ? 'border-red-500' : ''
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Textarea;
