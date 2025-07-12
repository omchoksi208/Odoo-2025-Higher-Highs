// components/Header.jsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserCircle, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md rounded-b-lg">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
          Skill Swap Platform
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          {isLoggedIn && (
            <>
              <Link href="/swap-requests" className="text-gray-300 hover:text-white transition-colors">
                Swap Requests
              </Link>
              <Link href="/profile" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                <UserCircle size={20} /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
          {!isLoggedIn && (
            <Link href="/login" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;