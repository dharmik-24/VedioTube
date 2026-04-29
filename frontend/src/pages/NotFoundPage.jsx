import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="text-center space-y-6">
        <div className="text-9xl font-bold text-accent">404</div>
        <h1 className="text-4xl font-bold text-white">Page Not Found</h1>
        <p className="text-gray-400 text-lg max-w-md">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button onClick={() => navigate('/')}>Go to Home</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
