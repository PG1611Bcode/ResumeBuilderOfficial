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
        alert('✅ Cover letter generated successfully!');
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
        alert(`✅ Generated new version ${response.data.data.version || 2}!`);
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          💼 AI Cover Letter Generator
        </h2>
        <p style={{ color: '#718096', fontSize: '1rem' }}>
          Create high-converting, ATS-tailored cover letters for any major company or custom job description
        </p>
      </div>

      {/* Step 1: Upload CV */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
          📄 Step 1: Upload Your CV (Optional)
        </h3>
        <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Upload your existing CV to auto-extract your skills and experience, or manually enter your information below.
        </p>
        <input 
          type="file" 
          accept=".pdf,.doc,.docx,.txt" 
          onChange={handleCVUpload} 
          style={{ padding: '0.75rem', border: '2px dashed #cbd5e0', borderRadius: '8px', width: '100%', cursor: 'pointer', background: '#f7fafc' }} 
        />
        {loading && <p style={{ marginTop: '0.75rem', color: '#4299e1', fontWeight: '500' }}>⏳ Extracting information from CV...</p>}
        {cvUploaded && <p style={{ marginTop: '0.75rem', color: '#38a169', fontWeight: '600' }}>✅ CV uploaded successfully! Information auto-filled below.</p>}
      </div>

      {/* Step 2: Candidate Information */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem' }}>
          👤 Step 2: Your Information & Credentials
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Full Name *</label>
            <input 
              type="text" 
              value={userInfo.name} 
              onChange={(e) => handleUserInfoChange('name', e.target.value)} 
              placeholder="e.g. Sarah Jenkins" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Email Address *</label>
            <input 
              type="email" 
              value={userInfo.email} 
              onChange={(e) => handleUserInfoChange('email', e.target.value)} 
              placeholder="e.g. sarah@example.com" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Phone Number</label>
            <input 
              type="tel" 
              value={userInfo.phone} 
              onChange={(e) => handleUserInfoChange('phone', e.target.value)} 
              placeholder="e.g. +1 (555) 019-2834" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Years of Experience</label>
            <input 
              type="text" 
              value={userInfo.experience} 
              onChange={(e) => handleUserInfoChange('experience', e.target.value)} 
              placeholder="e.g., 3+ years in full-stack engineering" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} 
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Key Technical Skills (comma separated)</label>
          <textarea 
            value={Array.isArray(userInfo.skills) ? userInfo.skills.join(', ') : userInfo.skills} 
            onChange={(e) => handleUserInfoChange('skills', e.target.value.split(',').map(s => s.trim()))} 
            placeholder="e.g. React, Node.js, TypeScript, AWS, System Architecture, Docker, PostgreSQL" 
            rows={2} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }} 
          />
        </div>
      </div>

      {/* Step 3: Select or Type Target Company & Role */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2d3748', margin: 0 }}>
            🎯 Step 3: Target Company & Role
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
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: isCustomMode ? '#4c51bf' : '#4a5568',
              background: isCustomMode ? '#ebf4ff' : '#f7fafc',
              border: `1px solid ${isCustomMode ? '#4c51bf' : '#cbd5e0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {isCustomMode ? '📋 Switch to Dropdown Mode' : '✏️ Type Custom Company & Role'}
          </button>
        </div>

        {isCustomMode ? (
          /* Custom Company and Role Inputs */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                🏢 Custom Company Name *
              </label>
              <input 
                type="text" 
                value={customCompany} 
                onChange={(e) => setCustomCompany(e.target.value)} 
                placeholder="e.g. OpenAI, Stripe, Scale AI, or Startup Name" 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', background: 'white' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                💼 Custom Target Role *
              </label>
              <input 
                type="text" 
                value={customRole} 
                onChange={(e) => setCustomRole(e.target.value)} 
                placeholder="e.g. Senior Full Stack Engineer, AI Solutions Architect" 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', background: 'white' }} 
              />
            </div>
          </div>
        ) : (
          /* Preset Dropdowns */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Select Company *</label>
              <Select 
                value={selectedCompany} 
                onChange={setSelectedCompany} 
                options={companyOptions} 
                placeholder="Choose from 16+ companies..." 
                styles={{ control: (base) => ({ ...base, padding: '0.25rem', borderRadius: '8px', border: '1px solid #cbd5e0' }) }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>Select Role *</label>
              <Select 
                value={selectedRole} 
                onChange={setSelectedRole} 
                options={roleOptions} 
                placeholder={selectedCompany ? "Select target role..." : "Select company first"} 
                isDisabled={!selectedCompany || selectedCompany.value === 'custom'} 
                styles={{ control: (base) => ({ ...base, padding: '0.25rem', borderRadius: '8px', border: '1px solid #cbd5e0' }) }} 
              />
            </div>
          </div>
        )}

        {/* Custom Job Description Input (Optional) */}
        <div style={{ marginTop: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>
            📋 Paste Job Description or Requirements (Optional, enhances AI accuracy)
          </label>
          <textarea 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Paste the job description, key responsibilities, or desired qualifications here to let AI tailor the letter precisely to the job posting..." 
            rows={4} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical' }} 
          />
        </div>

        {/* Tone/Template Selection */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', color: '#4a5568', fontSize: '0.9rem' }}>Writing Style:</span>
          {['professional', 'technical', 'creative'].map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#2d3748' }}>
              <input 
                type="radio" 
                name="template" 
                value={t} 
                checked={selectedTemplate === t} 
                onChange={() => setSelectedTemplate(t)} 
              />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={handleGenerate} 
          disabled={generating || !activeCompany || !activeRole || !userInfo.name || !userInfo.email} 
          style={{ 
            padding: '1rem 3rem', 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'white', 
            background: generating ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: (generating || !activeCompany || !activeRole || !userInfo.name || !userInfo.email) ? 'not-allowed' : 'pointer', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
            transition: 'all 0.3s ease' 
          }}
        >
          {generating ? '⏳ Crafting Tailored Cover Letter...' : `✨ Generate Cover Letter for ${activeCompany || 'Target Role'}`}
        </button>
        {generating && <p style={{ marginTop: '1rem', color: '#667eea', fontWeight: '500' }}>Our AI is researching company patterns and tailoring your cover letter. Please hold on...</p>}
      </div>

      {/* Generated Cover Letter Display */}
      {coverLetter && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #48bb78' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>
                ✅ Tailored Cover Letter for {activeCompany}
              </h3>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                Role: {activeRole} • Style: {selectedTemplate} • Version {coverLetter.version || 1}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setEditMode(!editMode)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: editMode ? 'white' : '#4299e1', background: editMode ? '#4299e1' : 'white', border: `2px solid #4299e1`, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {editMode ? '👁️ Preview' : '✏️ Edit'}
              </button>
              <button onClick={handleRegenerate} disabled={generating} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: '#805ad5', background: 'white', border: '2px solid #805ad5', borderRadius: '6px', cursor: generating ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                🔄 Regenerate Alternative
              </button>
              <button onClick={handleDownload} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: 'white', background: '#48bb78', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                📥 Download PDF
              </button>
            </div>
          </div>
          <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {editMode ? (
              <textarea 
                value={editedContent} 
                onChange={(e) => setEditedContent(e.target.value)} 
                style={{ width: '100%', minHeight: '500px', padding: '1rem', fontSize: '1rem', lineHeight: '1.6', fontFamily: 'Georgia, serif', border: '1px solid #cbd5e0', borderRadius: '6px', resize: 'vertical' }} 
              />
            ) : (
              <div style={{ fontSize: '1rem', lineHeight: '1.8', color: '#2d3748', fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap' }}>
                {editedContent || coverLetter.content}
              </div>
            )}
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#edf2f7', borderRadius: '6px', borderLeft: '4px solid #4299e1' }}>
            <p style={{ fontSize: '0.875rem', color: '#4a5568', margin: 0 }}>
              💡 <strong>Tip:</strong> Click <strong>Edit</strong> to customize paragraphs before downloading your PDF.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!coverLetter && !generating && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f7fafc', borderRadius: '12px', border: '2px dashed #cbd5e0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontSize: '1.25rem', color: '#4a5568', marginBottom: '0.5rem' }}>Ready to Create Your Cover Letter?</h3>
          <p style={{ color: '#718096' }}>
            Select a target company from the dropdown or type a custom company & role to begin.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;