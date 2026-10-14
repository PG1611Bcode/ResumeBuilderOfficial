import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { cvTemplates } from '../components/cvTemplates';
import { useAuth } from '../Context/AuthContext';

const CVHistoryDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [courseRecommendations, setCourseRecommendations] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  const fetchCourseRecommendations = async (missingSkills, company, role, cvText) => {
    if (!missingSkills || missingSkills.length === 0) {
      return;
    }
    setLoadingCourses(true);
    try {
      const response = await api.post('/api/learning/recommend-courses', {
        missingSkills,
        company,
        role,
        userCV: cvText
      });
      if (response.data.success) {
        setCourseRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch course recommendations:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/cv-history/${id}`);
        if (response.data.success) {
          const data = response.data.data;
          setCvData(data);
          if (user?.email) {
            setEmailRecipient(user.email);
          }
          if (data.analysisResults?.missingSkills) {
            fetchCourseRecommendations(
              data.analysisResults.missingSkills,
              data.companyName,
              data.roleName,
              data.originalCV
            );
          }
        } else {
          setError('Failed to load CV data.');
        }
      } catch (err) {
        setError('An error occurred while fetching the CV data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCVData();
  }, [id, user]);

  const generateProfessionalPDF = async (cvContent, companyName, roleName) => {
    if (!cvContent) {
      alert('No CV content available to download.');
      return;
    }
    try {
      setPdfLoading(true);
      const response = await api.post('/api/pdf/generate-cv-pdf', {
        profileData: {
          cvContent: cvContent,
          template: selectedTemplate
        }
      }, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV-${companyName || 'Resume'}-${roleName || 'Tailored'}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendEmail = async (recipient) => {
    if (!recipient) {
      setEmailError('Please enter an email address.');
      return;
    }
    if (!cvData || (!cvData.improvedCV && !cvData.originalCV)) {
      setEmailError('CV data is not available.');
      return;
    }

    setEmailLoading(true);
    setEmailSuccess('');
    setEmailError('');

    try {
      const payload = {
        toEmail: recipient,
        profileData: {
          cvContent: cvData.improvedCV || cvData.originalCV,
          template: selectedTemplate,
        },
      };

      const response = await api.post('/api/pdf/email-cv-pdf', payload);

      if (response.data.success) {
        setEmailSuccess(`Successfully sent CV to ${recipient}!`);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSuccess('');
        }, 3000);
      } else {
        setEmailError(response.data.message || 'Failed to send email.');
      }
    } catch (err) {
      console.error('Email sending error:', err);
      setEmailError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-20 transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading CV analysis details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-20 transition-colors">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-6 rounded-2xl max-w-md text-center">
          <p className="font-semibold">{error}</p>
          <Link to="/history" className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 underline">
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-20 transition-colors">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">CV record not found.</p>
          <Link to="/history" className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 underline">
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const feedback = {
    matchScore: cvData.analysisResults?.score !== undefined ? {
      score: cvData.analysisResults.score,
      matched: cvData.analysisResults.matchingSkills?.length || 0,
      missing: cvData.analysisResults.missingSkills?.length || 0
    } : null,
    recommendations: {
      strengths: cvData.analysisResults?.strengths || [],
      weaknesses: cvData.analysisResults?.weaknesses || [],
      structure: cvData.analysisResults?.structure || { clarity: 8, formatting: 7, impact: 6, comments: [] },
    }
  };

  return (
    <>
      {/* Email CV Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-gray-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>📧</span> Send CV via Email
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={emailLoading}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {emailSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl mb-4 text-sm text-center">
                {emailSuccess}
              </div>
            )}

            {emailError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl mb-4 text-sm text-center">
                {emailError}
              </div>
            )}

            {user?.email && (
              <button
                onClick={() => handleSendEmail(user.email)}
                disabled={emailLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                {emailLoading ? '⏳ Sending...' : `✉️ Send to My Email (${user.email})`}
              </button>
            )}

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <span className="relative bg-white dark:bg-gray-800 px-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                or
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="email_recipient" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Send to another email address:
              </label>
              <input
                type="email"
                id="email_recipient"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
              />
            </div>

            <button
              onClick={() => handleSendEmail(emailRecipient)}
              disabled={emailLoading}
              className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 text-sm"
            >
              {emailLoading ? 'Sending...' : 'Send CV PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/history"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>← Back to History</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEmailSuccess('');
                  setEmailError('');
                  setEmailRecipient(user?.email || '');
                  setShowEmailModal(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                <span>✉️</span>
                <span>Email CV</span>
              </button>
              <button
                onClick={() => generateProfessionalPDF(cvData.improvedCV || cvData.originalCV, cvData.companyName, cvData.roleName)}
                disabled={pdfLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>📥</span>
                <span>{pdfLoading ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Heading Banner */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  Target Role Analysis
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                  CV for {cvData.companyName || 'Target Company'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  Role: <span className="font-semibold text-gray-800 dark:text-gray-200">{cvData.roleName || 'Unspecified'}</span> • Analyzed on {new Date(cvData.createdAt).toLocaleDateString()}
                </p>
              </div>

              {feedback.matchScore && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className={`text-3xl sm:text-4xl font-extrabold ${
                    feedback.matchScore.score >= 70
                      ? 'text-green-500'
                      : feedback.matchScore.score >= 40
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}>
                    {feedback.matchScore.score}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 space-y-0.5">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">ATS Match</p>
                    <p className="text-green-600 dark:text-green-400 font-medium">✓ {feedback.matchScore.matched} Matched</p>
                    <p className="text-red-600 dark:text-red-400 font-medium">✗ {feedback.matchScore.missing} Missing</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          {(feedback.recommendations?.strengths?.length > 0 || feedback.recommendations?.weaknesses?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {feedback.recommendations?.strengths?.length > 0 && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-4">
                    <span>✅</span> CV Strengths
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    {feedback.recommendations.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.recommendations?.weaknesses?.length > 0 && (
                <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl p-6 border border-rose-200 dark:border-rose-800/60 shadow-sm">
                  <h3 className="text-base font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-4">
                    <span>⚠️</span> Areas to Improve
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                    {feedback.recommendations.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-600 dark:text-rose-400 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Select PDF Export Template
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose an ATS-tested layout to format your improved CV:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(cvTemplates).map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 text-left ${
                    selectedTemplate === template.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                  }`}
                >
                  <h4 className="font-bold text-sm mb-1" style={{ color: template.color }}>
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CV Content Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📄</span> Improved & Tailored CV Text
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cvData.improvedCV || cvData.originalCV || '');
                  alert('CV content copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>📋 Copy</span>
              </button>
            </div>

            <div className="bg-gray-900 text-gray-100 dark:bg-gray-950 dark:text-gray-200 p-6 rounded-2xl font-mono text-xs sm:text-sm leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap border border-gray-800">
              {cvData.improvedCV || cvData.originalCV}
            </div>
          </div>

          {/* Recommended Learning Resources */}
          {loadingCourses ? (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Searching recommended courses for missing skills...</p>
            </div>
          ) : (
            courseRecommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>📚</span> Recommended Learning Resources
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Curated courses and tutorials to bridge your identified skill gaps:
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    {courseRecommendations.filter(c => !c.isPaid).length} FREE + {courseRecommendations.filter(c => c.isPaid).length} PAID
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseRecommendations.map((course, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-5 border border-gray-200 dark:border-gray-600/80 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="text-2xl">
                            {course.platform === 'YouTube' ? '▶️' : course.platform === 'Udemy' ? '🎓' : course.platform === 'Coursera' ? '📚' : '💡'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            course.isPaid
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {course.isPaid ? (course.price || 'PAID') : 'FREE'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {course.title}
                        </h4>

                        {course.channelName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                            by {course.channelName}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                            {course.platform}
                          </span>
                          {course.duration && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                              ⏱️ {course.duration}
                            </span>
                          )}
                        </div>

                        {course.skillGap && (
                          <div className="mb-3">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              🎯 {course.skillGap}
                            </span>
                          </div>
                        )}

                        {course.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            {course.description}
                          </p>
                        )}
                      </div>

                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-center py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
                          course.isPaid
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                      >
                        {course.isPaid ? '🎓 View Course' : '▶️ Start Learning Free'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

        </div>
      </div>
    </>
  );
};

export default CVHistoryDetail;
