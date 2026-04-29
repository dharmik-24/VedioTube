import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-primary px-4 py-8">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
