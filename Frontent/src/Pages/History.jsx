import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import api from '../services/api';

const History = () => {
  const { user } = useAuth();
  const [activeHistoryTab, setActiveHistoryTab] = useState('cv-history');
  const [cvHistory, setCvHistory] = useState([]);
  const [coverLetterHistory, setCoverLetterHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch CV History
  useEffect(() => {
    if (activeHistoryTab === 'cv-history') {
      fetchCVHistory();
    }
  }, [activeHistoryTab]);

  // Fetch Cover Letter History
  useEffect(() => {
    if (activeHistoryTab === 'cover-letter-history') {
      fetchCoverLetterHistory();
    }
  }, [activeHistoryTab]);

  const fetchCVHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/cv-history');
      if (response.data.success) {
        setCvHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching CV history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoverLetterHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/cover-letter/history');
      if (response.data.success) {
        setCoverLetterHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cover letter history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCoverLetter = async (id) => {
    try {
      const response = await api.get(`/api/cover-letter/download/${id}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CoverLetter_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading cover letter:', error);
      alert('Failed to download cover letter');
    }
  };

  const handleDelete = async (type, id, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const endpoint = type === 'cv' ? `/api/cv-history/${id}` : `/api/cover-letter/${id}`;
      await api.delete(endpoint);

      if (type === 'cv') {
        setCvHistory(cvHistory.filter(item => item._id !== id));
      } else {
        setCoverLetterHistory(coverLetterHistory.filter(item => item._id !== id));
      }

      alert(`${type === 'cv' ? 'CV' : 'Cover Letter'} deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 pb-16 transition-colors">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-10 shadow-lg text-white">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-3">
            <span>📚 Saved Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            History & Tailored Versions
          </h1>
          <p className="mt-2 text-blue-100 text-base sm:text-lg max-w-2xl">
            Access and manage your generated resumes, ATS scores, and tailored cover letters in one place.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4">
          <button
            onClick={() => setActiveHistoryTab('cv-history')}
            className={`py-4 px-6 text-sm sm:text-base font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeHistoryTab === 'cv-history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-lg">📄</span>
            <span>CV History</span>
            {cvHistory.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {cvHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveHistoryTab('cover-letter-history')}
            className={`py-4 px-6 text-sm sm:text-base font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeHistoryTab === 'cover-letter-history'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-lg">💼</span>
            <span>Cover Letter History</span>
            {coverLetterHistory.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                {coverLetterHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* CV History Tab */}
        {activeHistoryTab === 'cv-history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📄</span> Your Analyzed CVs
              </h2>
              <Link
                to="/create-resume"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>➕ Analyze New CV</span>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading CV records...</p>
              </div>
            ) : cvHistory.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm max-w-xl mx-auto">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  📭
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No CV History Yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Analyze your first resume to see ATS match ratings, tailored suggestions, and history logs here!
                </p>
                <Link
                  to="/create-resume"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-md transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>🚀 Create / Analyze Resume</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cvHistory.map((cv) => (
                  <Link
                    key={cv._id}
                    to={`/cv-history/${cv._id}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {cv.companyName || 'Unknown Company'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {cv.roleName || 'Target Role'}
                          </p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {cv.template || 'ATS Classic'}
                        </span>
                      </div>

                      <div className="mb-5 p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Created:</span>{' '}
                          {new Date(cv.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {cv.analysisResults?.score !== undefined && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">ATS Match Score:</span>
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              {cv.analysisResults.score}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 mt-auto">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>View Details</span>
                        <span>→</span>
                      </span>

                      <button
                        onClick={(e) => handleDelete('cv', cv._id, e)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-xs font-medium transition-colors"
                        title="Delete CV Record"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cover Letter History Tab */}
        {activeHistoryTab === 'cover-letter-history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>💼</span> Your Generated Cover Letters
              </h2>
              <Link
                to="/cover-letter"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>➕ Generate New</span>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading cover letters...</p>
              </div>
            ) : coverLetterHistory.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm max-w-xl mx-auto">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  📭
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Cover Letters Yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Craft high-impact tailored cover letters for any target company using our AI writer!
                </p>
                <Link
                  to="/cover-letter"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-md transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>✍️ Generate Cover Letter</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coverLetterHistory.map((letter) => (
                  <div
                    key={letter._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {letter.company || 'Unknown Company'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {letter.role || 'Target Role'}
                          </p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          v{letter.version || 1}
                        </span>
                      </div>

                      <div className="mb-5 p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Created:</span>{' '}
                          {new Date(letter.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Style:</span>{' '}
                          <span className="capitalize">{letter.template || 'Professional'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => handleDownloadCoverLetter(letter._id)}
                        className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span>
                        <span>Download PDF</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete('cover-letter', letter._id, e)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-xs font-medium transition-colors"
                        title="Delete Record"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default History;