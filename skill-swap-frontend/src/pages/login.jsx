// pages/login.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthForm from '../components/AuthForm';
import { auth } from '../lib/api';

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auth.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
      }
      router.push('/'); // Redirect to home on successful login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-10">
      <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} error={error} />
    </div>
  );
};

export default LoginPage;