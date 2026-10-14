import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import companyData from '../assets/companies.json';
import { popularTemplates } from '../components/cvTemplates';

const CVAnalyzer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [cvFile, setCvFile] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [customCompany, setCustomCompany] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    location.state?.templateId || 'modern-clean'
  );

  // Execution & UI State
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('improved');
  const [copied, setCopied] = useState(false);

  // Format companies for react-select
  const companyOptions = [
    ...companyData.map((c) => ({
      label: c.name,
      value: c.id
    })),
    { label: '✏️ Enter Custom Company / Role', value: 'custom' }
  ];

  // Update roles when company dropdown changes
  useEffect(() => {
    if (selectedCompany) {
      if (selectedCompany.value === 'custom') {
        setIsCustomMode(true);
        setRoleOptions([]);
        setSelectedRole(null);
        return;
      }
      setIsCustomMode(false);
      const company = companyData.find((c) => c.id === selectedCompany.value);
      if (company && company.roles) {
        setRoleOptions(company.roles.map((r) => ({ label: r, value: r })));
        setSelectedRole(null);
      } else {
        setRoleOptions([]);
        setSelectedRole(null);
      }
    }
  }, [selectedCompany]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExt)) {
        setErrorMessage('Unsupported format. Please upload a PDF, Word (.docx), or Text (.txt) file.');
        setCvFile(null);
        return;
      }
      setErrorMessage('');
      setCvFile(file);
    }
  };

  const handleSubmitAnalysis = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!cvFile) {
      setErrorMessage('Please select or drag a CV file to upload.');
      return;
    }

    const companyName = isCustomMode ? customCompany.trim() : selectedCompany?.label;
    const roleName = isCustomMode ? customRole.trim() : selectedRole?.value;

    if (!companyName) {
      setErrorMessage('Please select or enter a target company name.');
      return;
    }

    if (!roleName) {
      setErrorMessage('Please select or enter a target role.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      formData.append('company', companyName);
      formData.append('companyName', companyName);
      formData.append('role', roleName);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }
      formData.append('template', selectedTemplateId);

      const response = await api.post('/api/cv/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        setAnalysisResult(response.data.data);
        window.scrollTo({ top: 400, behavior: 'smooth' });
      } else {
        setErrorMessage(response.data?.message || 'Failed to analyze CV. Please try again.');
      }
    } catch (err) {
      console.error('CV analysis error:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'An error occurred during CV analysis.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
      borderRadius: '0.75rem',
      padding: '0.2rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': { borderColor: '#6b7280' }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'inherit'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1f2937',
      borderRadius: '0.75rem',
      border: '1px solid #374151',
      zIndex: 50
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#374151' : 'transparent',
      color: '#f9fafb',
      cursor: 'pointer'
    })
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Banner */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>✨</span> AI-Powered ATS Optimizer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Analyze & Tailor Your Resume
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your resume and choose your target company & role. Our AI evaluates ATS keyword alignment, scores job readiness, and generates enhanced content.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between animate-shake">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-200 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Analyzer Form */}
        <form onSubmit={handleSubmitAnalysis} className="space-y-8">
          
          {/* Step 1: File Upload */}
          <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload Your Resume
              </h2>
            </div>

            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 sm:p-10 text-center transition-colors bg-gray-50/50 dark:bg-gray-900/40">
              <input
                type="file"
                id="cv-file-input"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl sm:text-5xl mb-3">📄</span>
                {cvFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {cvFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(cvFile.size / 1024).toFixed(1)} KB • Click or drag to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Drag and drop your resume file here, or{' '}
                      <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Supported formats: PDF (.pdf), Microsoft Word (.docx, .doc), Plain Text (.txt)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Target Opportunity */}
          <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Target Company & Role
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                {isCustomMode ? '← Choose from Predefined Companies' : '✏️ Enter Custom Company/Role'}
              </button>
            </div>

            {isCustomMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. Stripe, Airbnb, Spotify"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Company *
                  </label>
                  <Select
                    options={companyOptions}
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                    placeholder="Search company (Google, Amazon, Meta...)"
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Target Role *
                  </label>
                  <Select
                    options={roleOptions}
                    value={selectedRole}
                    onChange={setSelectedRole}
                    placeholder={selectedCompany ? 'Select a role...' : 'Select company first'}
                    isDisabled={!selectedCompany || roleOptions.length === 0}
                    styles={customSelectStyles}
                  />
                </div>
              </div>
            )}

            {/* Optional Job Description */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Paste Job Description (Optional, for precise ATS matching)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or qualifications from the job posting..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Template Selector Pill */}
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Target Template:
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  {popularTemplates.find((t) => t.id === selectedTemplateId)?.name || 'Modern Clean'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/templates')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change template →
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Resume with AI...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Analyze & Optimize CV</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Step 3: Analysis Results Section */}
        {analysisResult && (
          <div className="mt-12 space-y-8 animate-fade-in-up">
            
            {/* Match Score Card */}
            <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    ATS Match Analysis
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {analysisResult.matchScore?.level || 'Analysis Complete'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Evaluated against target requirements for{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {isCustomMode ? customRole : selectedRole?.value}
                    </span>{' '}
                    at{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {isCustomMode ? customCompany : selectedCompany?.label}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/60 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400">
                    {analysisResult.matchScore?.score || 0}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <p>
                      Matched:{' '}
                      <strong className="text-green-600 dark:text-green-400">
                        {analysisResult.matchScore?.matched || analysisResult.analysis?.matchingSkills?.length || 0}
                      </strong>
                    </p>
                    <p>
                      Missing:{' '}
                      <strong className="text-amber-600 dark:text-amber-400">
                        {analysisResult.matchScore?.missing || analysisResult.analysis?.missingSkills?.length || 0}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                
                {/* Matching Skills */}
                <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40">
                  <h3 className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-3">
                    <span>✓</span> Matching Skills Detected
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysisResult.analysis?.matchingSkills || analysisResult.matchScore?.details?.matchedSkills || []).length > 0 ? (
                      (analysisResult.analysis?.matchingSkills || analysisResult.matchScore?.details?.matchedSkills).map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-200"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No direct keyword matches found.
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
                  <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-3">
                    <span>⚠️</span> Recommended Skills to Add
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysisResult.analysis?.missingSkills || analysisResult.matchScore?.details?.missingSkills || []).length > 0 ? (
                      (analysisResult.analysis?.missingSkills || analysisResult.matchScore?.details?.missingSkills).map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200"
                          >
                            + {skill}
                          </span>
                        )
                      )
                    ) : (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Great job! No major skill gaps identified.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {Array.isArray(analysisResult.analysis?.suggestions) && analysisResult.analysis.suggestions.length > 0 && (
                <div className="mt-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40">
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                    <span>💡</span> Actionable Recommendations
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    {analysisResult.analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Improved CV Content Viewer */}
            <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('improved')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'improved'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ✨ AI-Improved Content
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'original'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📄 Original Text
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleCopyText(
                        activeTab === 'improved'
                          ? analysisResult.improvedCV
                          : analysisResult.originalCV
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>{copied ? '✓ Copied' : '📋 Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold hover:bg-black dark:hover:bg-gray-600 transition-colors"
                  >
                    View in History →
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 font-mono text-xs text-gray-800 dark:text-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {activeTab === 'improved'
                  ? analysisResult.improvedCV || 'No improved content returned.'
                  : analysisResult.originalCV || 'No original text available.'}
              </div>
            </div>

            {/* Quick Next Steps */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={() =>
                  navigate('/cover-letter', {
                    state: {
                      company: isCustomMode ? customCompany : selectedCompany?.label,
                      role: isCustomMode ? customRole : selectedRole?.value
                    }
                  })
                }
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md text-center"
              >
                ✉️ Generate Matching Cover Letter
              </button>
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setCvFile(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-all text-center"
              >
                🔄 Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVAnalyzer;
