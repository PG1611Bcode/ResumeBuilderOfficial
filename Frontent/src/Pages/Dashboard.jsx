import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalResumes: 0,
    profileCompletion: 0,
    lastUpdated: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate loading dashboard data
      setTimeout(() => {
        setStats({
          totalResumes: 3,
          profileCompletion: 75,
          lastUpdated: new Date().toLocaleDateString()
        });
        setRecentActivity([
          { id: 1, action: 'Profile updated', time: '2 hours ago', icon: '👤' },
          { id: 2, action: 'Resume template selected', time: '1 day ago', icon: '📄' },
          { id: 3, action: 'Skills section completed', time: '2 days ago', icon: '⚡' }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Dashboard...</h3>
          <p className="text-gray-400">Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Resume Builder</h1>
                <p className="text-sm text-gray-400">Professional Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.fullname?.firstname} {user?.fullname?.lastname}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullname?.firstname || 'User'}! 👋
          </h2>
          <p className="text-gray-400">
            Let's continue building your professional resume.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Resumes</p>
                <p className="text-3xl font-bold text-white">{stats.totalResumes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Profile Complete</p>
                <p className="text-3xl font-bold text-white">{stats.profileCompletion}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            <div className="mt-3 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{width: `${stats.profileCompletion}%`}}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Last Updated</p>
                <p className="text-lg font-bold text-white">{stats.lastUpdated}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Action Cards */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Edit Profile',
                  description: 'Update your personal information',
                  icon: '👤',
                  color: 'from-blue-500 to-cyan-500',
                  action: () => navigate('/profile')
                },
                {
                  title: 'Create Resume',
                  description: 'Build a new professional resume',
                  icon: '📝',
                  color: 'from-purple-500 to-pink-500',
                  action: () => navigate('/create-resume')
                },
                {
                  title: 'Templates',
                  description: 'Browse resume templates',
                  icon: '🎨',
                  color: 'from-green-500 to-teal-500',
                  action: () => navigate('/templates')
                },
                {
                  title: 'Settings',
                  description: 'Manage your account settings',
                  icon: '⚙️',
                  color: 'from-orange-500 to-red-500',
                  action: () => navigate('/settings')
                }
              ].map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  className={`group bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-gray-600 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up`}
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                        {action.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">{action.description}</p>
                    </div>
                    <div className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className={`flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg animate-fade-in-up`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-sm">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300">
                  View all activity →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Templates Preview */}
        <div className="animate-fade-in-up animation-delay-800">
          <h3 className="text-xl font-bold text-white mb-6">Popular Resume Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Modern Professional', preview: '📋', popularity: '95%' },
              { name: 'Creative Designer', preview: '🎨', popularity: '87%' },
              { name: 'Tech Specialist', preview: '💻', popularity: '92%' }
            ].map((template, index) => (
              <div key={index} className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-blue-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-3xl group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {template.preview}
                  </div>
                  <h4 className="text-white font-semibold mb-2">{template.name}</h4>
                  <p className="text-gray-400 text-sm mb-3">Used by {template.popularity} of users</p>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-300 transform group-hover:scale-105">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
