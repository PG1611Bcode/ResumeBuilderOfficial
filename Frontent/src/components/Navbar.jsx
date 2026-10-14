import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold text-white">Resume Builder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-resume" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
                >
                  Create Resume
                </Link>
                <Link 
                  to="/cover-letter" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
                >
                  Cover Letter
                </Link>
                <Link 
                  to="/history" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
                >
                  History
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
                >
                  Profile
                </Link>
                <ThemeToggle />
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    Welcome, {user.fullname?.firstname || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-700/50"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-resume" 
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Create Resume
                </Link>
                <Link 
                  to="/cover-letter" 
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Cover Letter
                </Link>
                <Link 
                  to="/history" 
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  History
                </Link>
                <Link 
                  to="/profile" 
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
