import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import companyData from '../assets/companies.json';
import { popularTemplates, cvTemplates } from '../components/cvTemplates';
import { useAuth } from '../Context/AuthContext';

const CVAnalyzer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const previewRef = useRef(null);

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
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('styled'); // 'styled' | 'markdown' | 'original'
  const [copied, setCopied] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(user?.email || '');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

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

  useEffect(() => {
    if (user?.email && !emailRecipient) {
      setEmailRecipient(user.email);
    }
  }, [user]);

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
        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
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

  // Safe property extraction from analysis response with full alias support
  const improvedContent =
    analysisResult?.improvedCV ||
    analysisResult?.improvedContent ||
    analysisResult?.aiImprovedCV ||
    analysisResult?.optimizedResume ||
    analysisResult?.structuredResume ||
    '';

  const originalContent =
    analysisResult?.originalCV ||
    analysisResult?.originalText ||
    '';

  const matchScore =
    analysisResult?.atsScore ||
    analysisResult?.matchScore?.score ||
    analysisResult?.analysis?.score ||
    75;

  const matchedSkillsList =
    analysisResult?.matchedSkills ||
    analysisResult?.analysis?.matchingSkills ||
    analysisResult?.analysis?.skillsMatch ||
    analysisResult?.matchScore?.details?.matchedSkills ||
    [];

  const missingSkillsList =
    analysisResult?.missingSkills ||
    analysisResult?.analysis?.missingSkills ||
    analysisResult?.matchScore?.details?.missingSkills ||
    [];

  const recommendationsList =
    analysisResult?.suggestions ||
    analysisResult?.analysis?.suggestions ||
    analysisResult?.recommendations?.suggestions ||
    [];

  const currentTemplate =
    popularTemplates.find((t) => t.id === selectedTemplateId) ||
    popularTemplates[0];

  // Markdown Inline Formatter for JSX (bolds and links)
  const renderInlineFormatted = (text, templateColor) => {
    if (!text) return null;
    const parts = [];
    const pattern = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-gray-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const linkText = token.slice(1, token.indexOf(']('));
        const linkUrl = token.slice(token.indexOf('](') + 2, -1);
        parts.push(
          <a
            key={keyIdx++}
            href={linkUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-85 font-medium"
            style={{ color: templateColor }}
          >
            {linkText}
          </a>
        );
      }
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Convert markdown structure to clean styled JSX matching active template
  const renderStyledResumeBlocks = (markdown, template) => {
    if (!markdown) {
      return (
        <div className="py-16 text-center text-gray-400 text-sm">
          Generating tailored ATS resume content...
        </div>
      );
    }

    const lines = markdown.split('\n');
    const elements = [];
    let currentList = [];
    let elIndex = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elIndex++}`} className="list-disc list-outside ml-5 space-y-1 mb-3 text-xs sm:text-sm text-gray-700">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormatted(item, template.color)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line) {
        flushList();
        continue;
      }

      if (line.startsWith('# ')) {
        flushList();
        const title = line.replace(/^#\s+/, '');
        elements.push(
          <div key={`h1-${elIndex++}`} className="pb-2 mb-3 border-b-2" style={{ borderColor: template.color }}>
            <h1
              className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight"
              style={{ color: template.color }}
            >
              {title}
            </h1>
          </div>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        const section = line.replace(/^##\s+/, '');
        elements.push(
          <div key={`h2-${elIndex++}`} className="mt-5 mb-2 pb-1 border-b" style={{ borderColor: template.color }}>
            <h2
              className="text-xs sm:text-sm font-bold uppercase tracking-wider"
              style={{ color: template.color }}
            >
              {section}
            </h2>
          </div>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        const subHeading = line.replace(/^###\s+/, '');
        elements.push(
          <h3
            key={`h3-${elIndex++}`}
            className="text-xs sm:text-sm font-bold text-gray-900 mt-3 mb-0.5"
          >
            {renderInlineFormatted(subHeading, template.color)}
          </h3>
        );
      } else if ((line.startsWith('- ') || line.startsWith('* ')) && !line.startsWith('**')) {
        const item = line.replace(/^[-*]\s+/, '');
        currentList.push(item);
      } else if ((line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) || (line.startsWith('_') && line.endsWith('_'))) {
        flushList();
        const sub = line.replace(/^[*_]|[*_]$/g, '');
        elements.push(
          <p key={`sub-${elIndex++}`} className="text-[11px] sm:text-xs text-gray-500 italic mb-1.5">
            {renderInlineFormatted(sub, template.color)}
          </p>
        );
      } else {
        flushList();
        // Check if line looks like contact banner
        const isContactLine = line.includes('@') || line.includes('•') || line.includes('|');
        elements.push(
          <p
            key={`p-${elIndex++}`}
            className={`leading-relaxed mb-2 ${isContactLine ? 'text-xs text-gray-600 mb-4' : 'text-xs sm:text-sm text-gray-700'}`}
          >
            {renderInlineFormatted(line, template.color)}
          </p>
        );
      }
    }

    flushList();
    return elements;
  };

  // Convert markdown to clean, semantic HTML for client-side print/PDF export
  const markdownToPrintHTML = (markdown, template) => {
    if (!markdown) return '';
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;

    const formatInline = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" style="color: ${template.color}; text-decoration: underline;">$1</a>`);
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1 style="color: ${template.color}; border-bottom: 2px solid ${template.color}; padding-bottom: 4px; margin-bottom: 8px;">${formatInline(line.replace(/^#\s+/, ''))}</h1>`;
      } else if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 style="color: ${template.color}; border-bottom: 1.5px solid ${template.color}; padding-bottom: 2px; margin-top: 14px; margin-bottom: 6px;">${formatInline(line.replace(/^##\s+/, ''))}</h2>`;
      } else if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 style="margin-top: 8px; margin-bottom: 2px; color: #111827;">${formatInline(line.replace(/^###\s+/, ''))}</h3>`;
      } else if ((line.startsWith('- ') || line.startsWith('* ')) && !line.startsWith('**')) {
        if (!inList) {
          html += '<ul style="margin: 4px 0 8px 0; padding-left: 20px;">';
          inList = true;
        }
        html += `<li style="margin-bottom: 2px; line-height: 1.45;">${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`;
      } else if ((line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) || (line.startsWith('_') && line.endsWith('_'))) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<div style="font-size: 9.5pt; color: #6b7280; font-style: italic; margin-bottom: 4px;">${formatInline(line.replace(/^[*_]|[*_]$/g, ''))}</div>`;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p style="margin: 4px 0 6px 0; line-height: 1.45;">${formatInline(line)}</p>`;
      }
    }

    if (inList) {
      html += '</ul>';
    }

    return html;
  };

  // Reliable PDF Download with Client-Side Fallback
  const handleDownloadPDF = async () => {
    if (!improvedContent) {
      alert('No resume content available to download.');
      return;
    }

    setPdfDownloading(true);
    const company = isCustomMode ? customCompany.trim() : selectedCompany?.label || 'Target';
    const role = isCustomMode ? customRole.trim() : selectedRole?.value || 'Position';
    const filename = `Resume-${company.replace(/\s+/g, '_')}-${role.replace(/\s+/g, '_')}-${selectedTemplateId}.pdf`;

    try {
      // 1. Attempt backend PDF generator route (/api/pdf/generate-cv-pdf)
      let response;
      try {
        response = await api.post(
          '/api/pdf/generate-cv-pdf',
          {
            profileData: {
              cvContent: improvedContent,
              template: selectedTemplateId,
              companyName: company,
              roleName: role
            }
          },
          { responseType: 'blob', timeout: 12000 }
        );
      } catch (e) {
        // Fallback to /api/cv/download
        response = await api.post(
          '/api/cv/download',
          {
            profileData: {
              cvContent: improvedContent,
              template: selectedTemplateId,
              companyName: company,
              roleName: role
            }
          },
          { responseType: 'blob', timeout: 12000 }
        );
      }

      if (response && response.data && response.data.size > 100) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
      throw new Error('Empty PDF received');
    } catch (err) {
      console.warn('Backend PDF generator unavailable, launching high-fidelity print exporter:', err.message);
      // 2. Client-side printable fallback (100% reliable on all platforms & Vercel)
      exportClientSidePDF(improvedContent, currentTemplate, company, role);
    } finally {
      setPdfDownloading(false);
    }
  };

  // High-fidelity Client-Side Print / PDF Export
  const exportClientSidePDF = (content, template, company, role) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print your resume PDF.');
      return;
    }

    const htmlBody = markdownToPrintHTML(content, template);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Resume - ${company} ${role}</title>
        <style>
          @page { size: A4; margin: 0.45in 0.55in; }
          * { box-sizing: border-box; }
          body {
            font-family: ${template.previewStyle?.fontFamily || 'Inter, sans-serif'};
            color: #1f2937;
            background: #ffffff;
            margin: 0;
            padding: 10px 20px;
            line-height: 1.45;
            font-size: 10pt;
          }
          h1 { font-size: 20pt; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          h2 { font-size: 11.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
          h3 { font-size: 10.5pt; font-weight: 700; }
          p { margin: 3px 0 5px 0; font-size: 9.5pt; }
          ul { margin: 3px 0 6px 0; padding-left: 18px; }
          li { margin-bottom: 2px; font-size: 9pt; }
          a { text-decoration: none; }
          strong { color: #111827; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="resume-sheet">
          ${htmlBody}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Handle Send to Email
  const handleSendEmail = async (recipient) => {
    if (!recipient) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!improvedContent) {
      setEmailError('Resume content is not available.');
      return;
    }

    setEmailLoading(true);
    setEmailSuccess('');
    setEmailError('');

    try {
      const response = await api.post('/api/pdf/email-cv-pdf', {
        toEmail: recipient,
        profileData: {
          cvContent: improvedContent,
          template: selectedTemplateId
        }
      });

      if (response.data && response.data.success) {
        setEmailSuccess(`Successfully sent improved resume PDF to ${recipient}!`);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSuccess('');
        }, 3000);
      } else {
        setEmailError(response.data?.message || 'Failed to send email.');
      }
    } catch (err) {
      console.error('Email sending error:', err);
      setEmailError(err.response?.data?.message || 'An error occurred while sending email.');
    } finally {
      setEmailLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Banner */}
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>✨</span> AI-Powered ATS Optimizer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Analyze & Build Your Target Resume
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your resume and choose your target company & role. Our AI evaluates ATS keyword alignment, scores job readiness, and rewrites enhanced content tailored to recruiter standards.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between animate-shake">
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

          {/* Step 2: Target Company & Role */}
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
                onClick={() => {
                  setIsCustomMode(!isCustomMode);
                  if (!isCustomMode) {
                    setSelectedCompany(null);
                    setSelectedRole(null);
                  }
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                {isCustomMode ? '📋 Switch to Dropdown Mode' : '✏️ Type Custom Company & Role'}
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
                    placeholder="e.g. OpenAI, Stripe, Google"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Target Role *
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                Paste Job Description (Optional, for laser-focused ATS keyword optimization)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or requirements from the target job posting..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Step 3: Choose Resume Template (Inline Selector) */}
          <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Choose ATS Resume Template
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Selected: {currentTemplate.name}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
              Select an industry-tested layout. You can also switch templates instantly after analysis without re-uploading!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTemplates.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: template.color }}
                        >
                          {template.badge}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      <span>ATS: {template.popularity}</span>
                      <span className="capitalize">{template.previewStyle?.fontFamily.split(',')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing & Rewriting CV with Gemini AI...</span>
                </>
              ) : (
                <>
                  <span>✨ Analyze & Optimize Resume</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Section */}
        {analysisResult && (
          <div ref={previewRef} className="space-y-8 animate-fade-in-up">

            {/* Score & Summary Banner */}
            <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Analysis Complete
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                    ATS Readiness & Match Report
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Target: <strong className="text-gray-800 dark:text-gray-200">{customRole || selectedRole?.value || 'Selected Role'}</strong> at{' '}
                    <strong className="text-gray-800 dark:text-gray-200">{customCompany || selectedCompany?.label || 'Target Company'}</strong>
                  </p>
                </div>

                {/* Score Gauge */}
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div
                    className={`text-4xl font-extrabold ${
                      matchScore >= 75
                        ? 'text-green-500'
                        : matchScore >= 50
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {matchScore}%
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-gray-800 dark:text-gray-200">ATS Match Rating</p>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      ✓ {matchedSkillsList.length} Matching
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold">
                      ! {missingSkillsList.length} Missing
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Matched Skills */}
                <div className="p-4 rounded-2xl bg-green-50/60 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40">
                  <h3 className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-3">
                    <span>✅</span> Matched ATS Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkillsList.length > 0 ? (
                      matchedSkillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        General competencies detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-3">
                    <span>⚠️</span> Critical Skills to Highlight
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkillsList.length > 0 ? (
                      missingSkillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                        >
                          + {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Strong alignment with all identified requirements!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {recommendationsList.length > 0 && (
                <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                    <span>💡</span> High-Impact Optimization Recommendations
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    {recommendationsList.map((suggestion, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Complete Improved Resume Viewer & Live Template Switcher */}
            <div className="bg-white dark:bg-gray-800/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">

              {/* Top Controls: Views & Template Switcher */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                {/* View Toggles */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('styled')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'styled'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📄 Formatted Resume Sheet
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'markdown'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    💻 Markdown & Code
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'original'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📑 Original Resume Text
                  </button>
                </div>

                {/* Primary Action Buttons: Download PDF, Email, Copy */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfDownloading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <span>📥</span>
                    <span>{pdfDownloading ? 'Generating PDF...' : 'Download Improved CV (PDF)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEmailSuccess('');
                      setEmailError('');
                      setShowEmailModal(true);
                    }}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>✉️</span>
                    <span>Send to Email</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(activeTab === 'original' ? originalContent : improvedContent)}
                    className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>{copied ? '✓ Copied' : '📋 Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Live Template Switcher Pills */}
              <div className="pt-4 pb-2 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Live Template Style:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularTemplates.map((template) => {
                      const isActive = selectedTemplateId === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                            isActive
                              ? 'text-white shadow-sm'
                              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          style={{
                            backgroundColor: isActive ? template.color : undefined,
                            borderColor: isActive ? template.color : undefined
                          }}
                        >
                          {template.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View in History</span>
                  <span>→</span>
                </button>
              </div>

              {/* Content Display: Rendered Document Sheet vs Markdown */}
              <div className="mt-4">
                {activeTab === 'styled' && (
                  <div className="bg-gray-100 dark:bg-gray-950 p-4 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 flex justify-center overflow-x-auto">
                    {/* The Printed Document Canvas */}
                    <div
                      className="bg-white text-gray-900 rounded-xl shadow-2xl p-8 sm:p-14 w-full max-w-3xl min-h-[750px] border border-gray-200 transition-all duration-300"
                      style={{
                        fontFamily: currentTemplate.previewStyle?.fontFamily || 'Inter, sans-serif'
                      }}
                    >
                      {/* Formatted Resume Body in Chosen Template Style */}
                      <div className="w-full">
                        {renderStyledResumeBlocks(improvedContent, currentTemplate)}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'markdown' && (
                  <div className="p-4 sm:p-6 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs sm:text-sm leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap border border-gray-800">
                    {improvedContent || 'No improved content returned.'}
                  </div>
                )}

                {activeTab === 'original' && (
                  <div className="p-4 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-xs sm:text-sm leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                    {originalContent || 'No original resume text available.'}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Next Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setCvFile(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold text-xs transition-colors"
              >
                🔄 Analyze Another Resume
              </button>

              <button
                onClick={() => navigate('/cover-letter')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>✍️ Generate Matching Cover Letter</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

      </div>

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
                <span>📧</span> Send Improved CV via Email
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
                Recipient Email Address:
              </label>
              <input
                type="email"
                id="email_recipient"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="recruiter@company.com or candidate@example.com"
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

    </div>
  );
};

export default CVAnalyzer;
