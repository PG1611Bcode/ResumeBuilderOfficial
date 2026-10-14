import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api, { profileAPI } from '../services/api';
import { popularTemplates } from '../components/cvTemplates';

// Helper function to format relative timestamps cleanly
const formatRelativeTime = (dateInput) => {
  if (!dateInput) return 'Recently';
  const now = new Date();
  const past = new Date(dateInput);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Calculate profile completion percentage based on real user fields
const calculateProfileCompletion = (profileData) => {
  if (!profileData) return 0;
  
  const hasName = Boolean(
    profileData.fullname?.firstname ||
    profileData.personalInfo?.name ||
    profileData.name
  );
  const hasEmail = Boolean(
    profileData.email ||
    profileData.personalInfo?.email
  );
  const hasPhone = Boolean(
    profileData.profile?.phone ||
    profileData.personalInfo?.phone
  );
  const hasSummary = Boolean(
    profileData.profile?.summary ||
    profileData.personalInfo?.summary ||
    profileData.summary
  );
  const hasSkills = Boolean(
    (Array.isArray(profileData.skills?.technical) && profileData.skills.technical.length > 0) ||
    (Array.isArray(profileData.skills) && profileData.skills.length > 0)
  );
  const hasExperience = Boolean(
    Array.isArray(profileData.experience) && profileData.experience.length > 0
  );
  const hasEducation = Boolean(
    Array.isArray(profileData.education) && profileData.education.length > 0
  );

  const criteria = [hasName, hasEmail, hasPhone, hasSummary, hasSkills, hasExperience, hasEducation];
  const completed = criteria.filter(Boolean).length;
  return Math.round((completed / criteria.length) * 100);
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalResumes: 0,
    profileCompletion: 0,
    lastUpdated: 'Not updated yet'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Auto-scroll to templates if route is /templates or hash is #popular-templates
  useEffect(() => {
    if (location.pathname === '/templates' || location.hash === '#popular-templates') {
      setTimeout(() => {
        document.getElementById('popular-templates')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [location]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch CV history and user profile in parallel
      const [historyResult, profileResult] = await Promise.allSettled([
        api.get('/api/cv-history'),
        profileAPI.getProfile()
      ]);

      let historyData = [];
      if (historyResult.status === 'fulfilled' && historyResult.value?.data?.success) {
        historyData = historyResult.value.data.data || [];
      }

      let profileData = null;
      if (profileResult.status === 'fulfilled' && profileResult.value?.data?.success) {
        profileData = profileResult.value.data.user || null;
      } else if (user) {
        profileData = user;
      }

      // 1. Calculate Total Resumes
      const totalResumes = historyData.length;

      // 2. Calculate Profile Completion %
      const completionPercentage = calculateProfileCompletion(profileData || user);

      // 3. Determine Last Updated timestamp
      let lastUpdatedStr = 'Not updated yet';
      if (historyData.length > 0 && (historyData[0].createdAt || historyData[0].updatedAt)) {
        lastUpdatedStr = new Date(historyData[0].createdAt || historyData[0].updatedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } else if (profileData?.updatedAt) {
        lastUpdatedStr = new Date(profileData.updatedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      setStats({
        totalResumes,
        profileCompletion: completionPercentage,
        lastUpdated: lastUpdatedStr
      });

      // 4. Map Recent Activity from actual CV history entries
      const mappedActivity = historyData.slice(0, 4).map((item) => ({
        id: item._id,
        title: `${item.companyName || 'Target Company'} - ${item.roleName || 'Target Role'}`,
        score: item.analysisResults?.score,
        time: formatRelativeTime(item.createdAt || item.updatedAt),
        date: new Date(item.createdAt || item.updatedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        })
      }));

      setRecentActivity(mappedActivity);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTemplates = () => {
    const el = document.getElementById('popular-templates');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUseTemplate = (templateId) => {
    setSelectedTemplate(null);
    navigate('/create-resume', { state: { templateId } });
  };

  const displayName = user?.fullname?.firstname || user?.name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content (Duplicate Navbar Header has been completely removed) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-gray-800/90 to-gray-800/40 border border-gray-700/70 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Resume Workspace
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-400 mt-2 text-base sm:text-lg max-w-2xl">
                Track your applications, monitor ATS readiness, and generate job-winning resumes tailored to modern recruiters.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/create-resume')}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>➕ Create Resume</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Total Resumes Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Resumes Analyzed</p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-700 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-extrabold text-white mt-1 group-hover:text-blue-400 transition-colors">
                    {stats.totalResumes}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Across all role submissions</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📄
              </div>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Profile Completeness</p>
                {loading ? (
                  <div className="h-9 w-20 bg-gray-700 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-extrabold text-white mt-1 group-hover:text-purple-400 transition-colors">
                    {stats.profileCompletion}%
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Skills, experience & contacts</p>
              </div>
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚡
              </div>
            </div>
            <div className="mt-4 bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>
          </div>

          {/* Last Updated Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 hover:border-green-500/40 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Last Activity Date</p>
                {loading ? (
                  <div className="h-9 w-32 bg-gray-700 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-white mt-1 group-hover:text-green-400 transition-colors">
                    {stats.lastUpdated}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Latest resume generation or edit</p>
              </div>
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📅
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Quick Actions (2 Columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Create Resume',
                  description: 'Analyze and build an ATS-tailored resume',
                  icon: '📝',
                  color: 'from-blue-500 to-indigo-600',
                  badge: 'Core Tool',
                  action: () => navigate('/create-resume')
                },
                {
                  title: 'Edit Profile',
                  description: 'Update your personal info, experience, and skills',
                  icon: '👤',
                  color: 'from-purple-500 to-pink-600',
                  badge: `${stats.profileCompletion}% Done`,
                  action: () => navigate('/profile')
                },
                {
                  title: 'Resume Templates',
                  description: 'Browse 4 ATS-tested industry templates',
                  icon: '🎨',
                  color: 'from-emerald-500 to-teal-600',
                  badge: 'ATS-Ready',
                  action: scrollToTemplates
                },
                {
                  title: 'Account Settings',
                  description: 'Manage profile preferences and security',
                  icon: '⚙️',
                  color: 'from-amber-500 to-orange-600',
                  badge: 'Preferences',
                  action: () => navigate('/profile')
                }
              ].map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  className="group bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 hover:border-gray-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {action.title}
                        </h3>
                        {action.badge && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-700/80 text-gray-300">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <span className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Bar */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🕒</span> Recent Activity
              </h2>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all →
              </button>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[300px]">
              {loading ? (
                <div className="space-y-4 py-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3 p-3 bg-gray-700/20 rounded-xl animate-pulse">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => navigate(`/cv-history/${activity.id}`)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/60 border border-gray-700/40 hover:border-gray-600 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg shrink-0">
                          📄
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                      {typeof activity.score === 'number' && (
                        <span className="shrink-0 ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          {activity.score}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Clean Empty State */
                <div className="py-8 px-4 text-center my-auto flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-gray-700/40 rounded-full flex items-center justify-center text-2xl mb-3 text-gray-400">
                    📂
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    No recent activity yet
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs mb-4 leading-relaxed">
                    Create your first CV analysis to track recommendations, match scores, and versions here!
                  </p>
                  <button
                    onClick={() => navigate('/create-resume')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all shadow-md"
                  >
                    Create Your First Resume
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-700/60">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full text-center text-blue-400 hover:text-blue-300 text-xs font-semibold py-1 transition-colors"
                >
                  View full history & downloads →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Resume Templates Section */}
        <div id="popular-templates" className="scroll-mt-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>🎯</span> ATS-Compliant Layouts
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Popular Resume Templates
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Engineered for maximum readability by Applicant Tracking Systems (ATS) and hiring managers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden"
              >
                {/* Header tag */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.badge}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    ATS: {template.popularity}
                  </span>
                </div>

                {/* Wireframe Mock Preview Card */}
                <div
                  onClick={() => setSelectedTemplate(template)}
                  className="h-44 w-full bg-gray-900/90 rounded-xl p-3 border border-gray-750 group-hover:border-gray-600 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between mb-4 shadow-inner"
                >
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-gray-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-700 shadow-md">
                      🔍 Quick Preview
                    </span>
                  </div>

                  {/* Wireframe content tailored to template type */}
                  <div className="space-y-2">
                    {/* Header mock */}
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-800">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: template.color }}
                      ></div>
                      <div className="h-2 w-20 bg-gray-600 rounded"></div>
                      <div className="h-1.5 w-12 bg-gray-700 rounded ml-auto"></div>
                    </div>
                    {/* Summary mock */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-gray-700/70 rounded"></div>
                      <div className="h-1.5 w-4/5 bg-gray-700/70 rounded"></div>
                    </div>
                    {/* Section 1 mock */}
                    <div className="pt-1 space-y-1.5">
                      <div className="h-2 w-16 bg-gray-500 rounded"></div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <div className="h-1.5 w-full bg-gray-700/50 rounded"></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <div className="h-1.5 w-3/4 bg-gray-700/50 rounded"></div>
                      </div>
                    </div>
                    {/* Tags / skills mock */}
                    <div className="flex gap-1 pt-1">
                      <div className="h-3 w-8 bg-gray-800 rounded text-[8px] text-gray-500 flex items-center justify-center">
                        HTML
                      </div>
                      <div className="h-3 w-9 bg-gray-800 rounded text-[8px] text-gray-500 flex items-center justify-center">
                        React
                      </div>
                      <div className="h-3 w-10 bg-gray-800 rounded text-[8px] text-gray-500 flex items-center justify-center">
                        Node
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                    {template.tagline}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="flex-1 py-2 px-3 bg-gray-700/60 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-gray-600/50"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all transform active:scale-95"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Interactive Template Preview Modal */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-700 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedTemplate.name}
                  </h3>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: selectedTemplate.color }}
                  >
                    {selectedTemplate.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="w-9 h-9 rounded-full bg-gray-700/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Template Paper Mockup */}
            <div
              className="bg-white text-gray-900 rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-200 mb-6 font-sans text-xs sm:text-sm"
              style={{ fontFamily: selectedTemplate.previewStyle?.fontFamily || 'Inter, sans-serif' }}
            >
              {/* Resume Header */}
              <div className="border-b pb-3 mb-4 text-center">
                <h1
                  className="text-xl sm:text-2xl font-extrabold tracking-tight"
                  style={{ color: selectedTemplate.color }}
                >
                  ALEX MORGAN, PMP
                </h1>
                <p className="text-gray-600 text-[11px] sm:text-xs mt-1">
                  Senior Software Engineer & Team Lead • San Francisco, CA • alex.morgan@example.com • (555) 234-5678
                </p>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <h2
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: selectedTemplate.color }}
                >
                  Professional Summary
                </h2>
                <p className="text-gray-700 text-[11px] sm:text-xs leading-relaxed">
                  Results-oriented software architect with 7+ years of experience scaling distributed backend systems and microservices. Proven track record improving latency by 45% and leading cross-functional teams to deliver enterprise cloud solutions.
                </p>
              </div>

              {/* Experience */}
              <div className="mb-4">
                <h2
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-2"
                  style={{ color: selectedTemplate.color }}
                >
                  Work Experience
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">Lead Systems Engineer</span>
                      <span className="text-[10px] text-gray-500">2022 – Present</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">Apex Cloud Technologies • San Francisco, CA</p>
                    <ul className="list-disc list-inside text-gray-700 text-[11px] mt-1 space-y-0.5">
                      <li>Designed and deployed serverless microservices processing 12M+ daily requests.</li>
                      <li>Architected automated CI/CD pipelines reducing deployment downtime by 80%.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h2
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: selectedTemplate.color }}
                >
                  Technical Proficiencies
                </h2>
                <p className="text-gray-700 text-[11px]">
                  <strong>Languages & Frameworks:</strong> JavaScript, TypeScript, Python, React, Node.js, Express, Go<br />
                  <strong>Infrastructure & Tools:</strong> Docker, Kubernetes, AWS (Lambda, ECS), MongoDB, PostgreSQL, Git
                </p>
              </div>

              {/* Education */}
              <div>
                <h2
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-1"
                  style={{ color: selectedTemplate.color }}
                >
                  Education
                </h2>
                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="font-bold text-gray-900">B.S. in Computer Science</span>
                  <span className="text-gray-500">University of California, Berkeley</span>
                </div>
              </div>
            </div>

            {/* Template Features Highlights */}
            <div className="mb-6 bg-gray-700/30 rounded-2xl p-4 border border-gray-700/50">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                ATS Optimization Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                {selectedTemplate.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-700">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium text-sm transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleUseTemplate(selectedTemplate.id)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
