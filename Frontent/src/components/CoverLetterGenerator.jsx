import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../services/api';
import companyData from '../assets/companies.json';

const CoverLetterGenerator = () => {
  // State management
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  // Mode: dropdown selection vs. custom typing
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCompany, setCustomCompany] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');

  // Company and role selection
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);

  // User info (extracted from CV or manual)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: ''
  });

  // Generated cover letter
  const [coverLetter, setCoverLetter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Company options for dropdown
  const companyOptions = companyData.map(c => ({
    label: c.name,
    value: c.id
  }));

  // Update role options when company changes
  useEffect(() => {
    if (selectedCompany) {
      if (selectedCompany.value === 'custom') {
        setIsCustomMode(true);
        setRoleOptions([]);
        setSelectedRole(null);
        return;
      }

      const company = companyData.find(c => c.id === selectedCompany.value);
      if (company && company.roles) {
        const options = company.roles.map(role => ({
          label: role,
          value: role
        }));
        setRoleOptions(options);
        setSelectedRole(null);
      }
    } else {
      setRoleOptions([]);
      setSelectedRole(null);
    }
  }, [selectedCompany]);

  // Handle CV file upload and extract info
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCvFile(file);
    setLoading(true);
    setCvUploaded(false);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await api.post('/api/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const parsedCV = response.data.data.parsedSections;
        setUserInfo({
          name: parsedCV.name || '',
          email: parsedCV.contact?.email || '',
          phone: parsedCV.contact?.phone || '',
          skills: parsedCV.skills || [],
          experience: parsedCV.experience?.map(exp => `${exp.position || ''} at ${exp.company || ''}`).filter(Boolean).join(', ') || ''
        });
        setCvUploaded(true);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Failed to upload CV. Please try again.');
      setCvUploaded(false);
    } finally {
      setLoading(false);
    }
  };

  // Determine current active target company and role
  const activeCompany = isCustomMode ? customCompany.trim() : (selectedCompany ? selectedCompany.label : '');
  const activeRole = isCustomMode ? customRole.trim() : (selectedRole ? selectedRole.label : '');

  // Generate cover letter
  const handleGenerate = async () => {
    if (!activeCompany || !activeRole) {
      alert('Please specify both a target company and a target role.');
      return;
    }

    if (!userInfo.name || !userInfo.email) {
      alert('Please ensure your name and email are filled in, either by uploading a CV or entering them manually.');
      return;
    }

    setGenerating(true);
    setCoverLetter(null);

    try {
      const response = await api.post('/api/cover-letter/generate', {
        userInfo,
        company: activeCompany,
        role: activeRole,
        jobDescription: jobDescription.trim(),
        template: selectedTemplate
      });

      if (response.data.success) {
        setCoverLetter(response.data.data);
        setEditedContent(response.data.data.content);
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate cover letter
  const handleRegenerate = async () => {
    if (!coverLetter || !coverLetter.id) return;
    setGenerating(true);
    try {
      const response = await api.post(`/api/cover-letter/regenerate/${coverLetter.id}`);
      if (response.data.success) {
        setCoverLetter(response.data.data);
        setEditedContent(response.data.data.content);
      }
    } catch (error) {
      console.error('Error regenerating:', error);
      alert('Failed to regenerate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Download cover letter as PDF
  const handleDownload = async () => {
    if (!coverLetter || !coverLetter.id) return;
    try {
      const response = await api.get(`/api/cover-letter/download/${coverLetter.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CoverLetter_${activeCompany.replace(/\s+/g, '_')}_${activeRole.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download. Please try again.');
    }
  };

  // Update user info manually
  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
      borderRadius: '0.75rem',
      padding: '0.2rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      color: 'inherit'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>✨ AI Writer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>💼</span> AI Cover Letter Generator
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-2xl">
            Create high-converting, ATS-tailored cover letters for any major company or custom job description.
          </p>
        </div>

        {/* Step 1: Upload CV */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <span>📄</span> Step 1: Upload Your CV (Optional)
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
            Upload your existing CV to auto-extract your skills and experience, or manually enter your information below.
          </p>

          <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center bg-gray-50 dark:bg-gray-700/30 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors">
            <span className="text-3xl block mb-2">📎</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
              {cvFile ? cvFile.name : 'Click to select or drag & drop your CV (PDF, DOCX, TXT)'}
            </span>
            <span className="text-xs text-gray-400 mt-1 block">Max size: 10MB</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleCVUpload}
              className="hidden"
            />
          </label>

          {loading && (
            <p className="mt-3 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span className="animate-spin inline-block">⏳</span> Extracting information from CV...
            </p>
          )}
          {cvUploaded && (
            <p className="mt-3 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>✅</span> CV uploaded successfully! Information auto-filled below.
            </p>
          )}
        </div>

        {/* Step 2: Candidate Information */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <span>👤</span> Step 2: Your Information & Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => handleUserInfoChange('name', e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => handleUserInfoChange('email', e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Years of Experience
              </label>
              <input
                type="text"
                value={userInfo.experience}
                onChange={(e) => handleUserInfoChange('experience', e.target.value)}
                placeholder="e.g. 5+ years in full-stack cloud systems"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Key Technical Skills (comma separated)
            </label>
            <textarea
              value={Array.isArray(userInfo.skills) ? userInfo.skills.join(', ') : userInfo.skills}
              onChange={(e) => handleUserInfoChange('skills', e.target.value.split(',').map(s => s.trim()))}
              placeholder="e.g. React, Node.js, Python, AWS Lambda, Docker, PostgreSQL, CI/CD"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Step 3: Target Company & Role */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🎯</span> Step 3: Target Company & Role
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(!isCustomMode);
                if (!isCustomMode) {
                  setSelectedCompany(null);
                  setSelectedRole(null);
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors self-start sm:self-auto"
            >
              {isCustomMode ? '📋 Switch to Dropdown Selection' : '✏️ Type Custom Company & Role'}
            </button>
          </div>

          {isCustomMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  🏢 Custom Company Name *
                </label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. OpenAI, Stripe, Scale AI"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  💼 Custom Target Role *
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Lead Distributed Systems Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Select Company *
                </label>
                <Select
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  options={companyOptions}
                  placeholder="Choose target company..."
                  styles={customSelectStyles}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Select Role *
                </label>
                <Select
                  value={selectedRole}
                  onChange={setSelectedRole}
                  options={roleOptions}
                  placeholder={selectedCompany ? 'Select target role...' : 'Select company first'}
                  isDisabled={!selectedCompany || selectedCompany.value === 'custom'}
                  styles={customSelectStyles}
                />
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="mt-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              📋 Paste Job Description (Optional, enhances AI tailoring)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste key responsibilities, preferred qualifications, or company values here..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Tone / Writing Style */}
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Writing Style:
            </span>
            {['professional', 'technical', 'creative'].map(t => (
              <label
                key={t}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                  selectedTemplate === t
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={t}
                  checked={selectedTemplate === t}
                  onChange={() => setSelectedTemplate(t)}
                  className="hidden"
                />
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center py-4">
          <button
            onClick={handleGenerate}
            disabled={generating || !activeCompany || !activeRole || !userInfo.name || !userInfo.email}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-base"
          >
            {generating ? '⏳ Crafting Tailored Cover Letter...' : `✨ Generate Cover Letter for ${activeCompany || 'Target Role'}`}
          </button>
          {generating && (
            <p className="mt-3 text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium animate-pulse">
              Our AI is reviewing company culture and tailoring your experience. Please hold on...
            </p>
          )}
        </div>

        {/* Generated Cover Letter Display */}
        {coverLetter && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/40 dark:border-emerald-500/30 transition-colors animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Version {coverLetter.version || 1}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  Tailored Cover Letter for {activeCompany}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Role: <span className="font-semibold text-gray-700 dark:text-gray-200">{activeRole}</span> • Style: <span className="capitalize">{selectedTemplate}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>{editMode ? '👁️' : '✏️'}</span>
                  <span>{editMode ? 'Preview' : 'Edit'}</span>
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="px-3 py-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Alternative</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>📥</span>
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 dark:bg-gray-900/60 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
              {editMode ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[450px] p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl font-serif text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              ) : (
                <div className="font-serif text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {editedContent || coverLetter.content}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl text-xs text-blue-800 dark:text-blue-300">
              💡 <strong>Pro Tip:</strong> Click <strong>Edit</strong> to personalize any project references or greeting lines before generating your PDF.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CoverLetterGenerator;