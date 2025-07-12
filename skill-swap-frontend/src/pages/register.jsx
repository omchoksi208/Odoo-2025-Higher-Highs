// pages/register.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthForm from '../components/AuthForm';
import { auth } from '../lib/api';

const RegisterPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auth.register(name, email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
      }
      router.push('/profile'); // Redirect to profile setup after registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-10">
      <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} error={error} />
    </div>
  );
};

export default RegisterPage;