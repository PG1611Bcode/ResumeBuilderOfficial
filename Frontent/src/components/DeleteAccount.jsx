import React, { useState } from 'react';
import api from '../services/api';
import { auth } from '../config/firebase';
import { deleteUser } from 'firebase/auth';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = ({ onBack }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (confirmationText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Delete user from backend (MongoDB)
      await api.delete('/auth/delete-account', {
        data: { confirmationText }
      });

      // 2. Delete user from Firebase Auth
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // Logout and redirect
      await logout();
      navigate('/');
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Account deletion error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete account. You may need to log in again to perform this action.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4 dark:from-gray-900 dark:to-red-900">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 dark:border-gray-700">
          {/* Warning Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Delete Your Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              This action cannot be undone
            </p>
          </div>

          {/* Warning Content */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">⚠️ Warning</h3>
            <p className="text-red-700 dark:text-red-300 text-sm mb-3">
              Deleting your account will permanently remove:
            </p>
            <ul className="text-red-700 dark:text-red-300 text-sm space-y-1 mb-3">
              <li>• Your profile and personal information</li>
              <li>• All saved resumes and templates</li>
              <li>• Account preferences and settings</li>
              <li>• All project history</li>
            </ul>
            <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
              This action cannot be reversed!
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-200"
            >
              I Understand, Continue
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4 dark:from-gray-900 dark:to-red-900">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Confirm Account Deletion
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please confirm your identity to proceed
          </p>
        </div>

        <form onSubmit={handleDeleteAccount} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account to be deleted:</p>
            <p className="font-semibold text-gray-800 dark:text-white">{user?.email}</p>
          </div>

          {/* Confirmation Text */}
          <div>
            <label htmlFor="confirmationText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              id="confirmationText"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Type DELETE"
            />
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || confirmationText !== 'DELETE'}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-orange-600 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting Account...
                </>
              ) : (
                'Permanently Delete Account'
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccount;
