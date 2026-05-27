import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ResumePreview – 5 fully-redesigned, industry-grade CV templates
   Requirements met:
   ✅ Compact horizontal skill-tag / inline-grid layout (no long bullet lists)
   ✅ Explicit HEX text colours throughout (no invisible or low-contrast text)
   ✅ break-inside-avoid on every Experience, Project & Education block
   ✅ contentEditable preserved on every text node
   ✅ Premium typography: structured headers with border-bottom accent rules
───────────────────────────────────────────────────────────────────────────── */

/* ── Shared micro-components ─────────────────────────────────────────── */

/** Renders a horizontal wrapping tag-cloud of skill pills */
const SkillTags = ({ skills, tagStyle }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
      {skills.map((s, i) => (
        <span key={i} contentEditable suppressContentEditableWarning style={tagStyle}>
          {s}
        </span>
      ))}
    </div>
  );
};

/** Renders skills in a 3-column dense inline grid */
const SkillGrid = ({ skills, textColor }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '3px 8px',
      }}
    >
      {skills.map((s, i) => (
        <div
          key={i}
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: '12px',
            color: textColor || '#374151',
            paddingLeft: '10px',
            position: 'relative',
            lineHeight: '1.6',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              color: textColor || '#374151',
              fontSize: '8px',
            }}
          >
            ▸
          </span>
          {s}
        </div>
      ))}
    </div>
  );
};

const ResumePreview = ({ data, template = 'classic' }) => {
  if (!data) return null;

  const {
    fullname = { firstname: '', lastname: '' },
    profile = {},
    experience = [],
    education = [],
    projects = [],
    skills = {},
  } = data;

  const name = `${fullname?.firstname || ''} ${fullname?.lastname || ''}`.trim();
  const techSkills = skills?.technical || [];

  /* ══════════════════════════════════════════════════════════════════════════
     1. CLASSIC PROFESSIONAL
     Colour palette: navy #1e3a5f / slate text / subtle silver accents
  ══════════════════════════════════════════════════════════════════════════ */
  if (template === 'classic') {
    const accent = '#1e3a5f';
    const rule = { borderBottom: `2px solid ${accent}`, marginBottom: '10px', paddingBottom: '4px' };
    const sectionStyle = { marginBottom: '18px', pageBreakInside: 'avoid', breakInside: 'avoid' };
    const SectionHeader = ({ children }) => (
      <h2
        style={{
          ...rule,
          fontSize: '12px',
          fontWeight: '700',
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          display: 'block',
          width: '100%',
        }}
      >
        {children}
      </h2>
    );

    return (
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          color: '#1a1a2e',
          padding: '44px 48px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: `3px double ${accent}`, paddingBottom: '16px' }}>
          <h1
            contentEditable
            suppressContentEditableWarning
            style={{ fontSize: '28px', fontWeight: '700', color: accent, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}
          >
            {name}
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '6px 18px',
              marginTop: '8px',
              fontSize: '12px',
              color: '#4b5563',
            }}
          >
            {profile?.email && (
              <span contentEditable suppressContentEditableWarning>
                {profile.email}
              </span>
            )}
            {profile?.phone && (
              <span contentEditable suppressContentEditableWarning>
                {profile.phone}
              </span>
            )}
            {profile?.linkedIn && (
              <span contentEditable suppressContentEditableWarning>
                {profile.linkedIn.replace('https://', '')}
              </span>
            )}
            {profile?.github && (
              <span contentEditable suppressContentEditableWarning>
                {profile.github.replace('https://', '')}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {profile?.summary && (
          <div style={sectionStyle}>
            <SectionHeader>Professional Summary</SectionHeader>
            <p
              contentEditable
              suppressContentEditableWarning
              style={{ fontSize: '13px', color: '#374151', lineHeight: '1.65', textAlign: 'justify', margin: 0 }}
            >
              {profile.summary}
            </p>
          </div>
        )}

        {/* Technical Skills — compact 3-col grid */}
        {techSkills.length > 0 && (
          <div style={sectionStyle}>
            <SectionHeader>Technical Skills</SectionHeader>
            <SkillGrid skills={techSkills} textColor="#374151" />
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <SectionHeader>Professional Experience</SectionHeader>
            {experience.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0 }}
                  >
                    {exp.position}
                  </h3>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}
                  >
                    {exp.startDate || exp.duration}
                    {exp.endDate ? ` – ${exp.endDate}` : ''}
                  </span>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  style={{ fontSize: '12.5px', color: '#4b5563', fontStyle: 'italic', marginBottom: '4px' }}
                >
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description && (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}
                  >
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <SectionHeader>Key Projects</SectionHeader>
            {projects.map((proj, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                <h3
                  contentEditable
                  suppressContentEditableWarning
                  style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 3px 0' }}
                >
                  {proj.name || proj.title}
                </h3>
                {proj.description && (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}
                  >
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={sectionStyle}>
            <SectionHeader>Education</SectionHeader>
            {education.map((edu, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div>
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}
                  >
                    {edu.degree}
                  </h3>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                    {edu.institution}
                  </div>
                </div>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '8px' }}
                >
                  {edu.year || edu.endDate || edu.startDate}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2. MODERN TECH
     Two-tone: deep indigo sidebar-header gradient + crisp white body.
     Skill pills with indigo tint, timeline dots for experience.
  ══════════════════════════════════════════════════════════════════════════ */
  if (template === 'modern') {
    const accent = '#4f46e5';
    const accentLight = '#e0e7ff';
    const sectionStyle = { marginBottom: '18px', pageBreakInside: 'avoid', breakInside: 'avoid' };

    const SectionHeader = ({ children }) => (
      <h2
        style={{
          fontSize: '11px',
          fontWeight: '800',
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          borderBottom: `2px solid ${accent}`,
          paddingBottom: '5px',
          marginBottom: '12px',
        }}
      >
        {children}
      </h2>
    );

    const tagStyle = {
      display: 'inline-block',
      backgroundColor: accentLight,
      color: accent,
      borderRadius: '4px',
      padding: '2px 9px',
      fontSize: '11.5px',
      fontWeight: '600',
      border: `1px solid #c7d2fe`,
    };

    return (
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          color: '#1f2937',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #818cf8 100%)',
            padding: '32px 44px 28px',
            color: '#ffffff',
          }}
        >
          <h1
            contentEditable
            suppressContentEditableWarning
            style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}
          >
            {name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12.5px', opacity: 0.9 }}>
            {profile?.email && <span contentEditable suppressContentEditableWarning>✉ {profile.email}</span>}
            {profile?.phone && <span contentEditable suppressContentEditableWarning>📱 {profile.phone}</span>}
            {profile?.linkedIn && <span contentEditable suppressContentEditableWarning>🔗 {profile.linkedIn.replace('https://', '')}</span>}
            {profile?.github && <span contentEditable suppressContentEditableWarning>💻 {profile.github.replace('https://', '')}</span>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 44px' }}>
          {/* Summary */}
          {profile?.summary && (
            <div style={sectionStyle}>
              <SectionHeader>Professional Summary</SectionHeader>
              <p
                contentEditable
                suppressContentEditableWarning
                style={{ fontSize: '13px', color: '#374151', lineHeight: '1.65', margin: 0 }}
              >
                {profile.summary}
              </p>
            </div>
          )}

          {/* Skills — pill tags */}
          {techSkills.length > 0 && (
            <div style={sectionStyle}>
              <SectionHeader>Core Competencies</SectionHeader>
              <SkillTags skills={techSkills} tagStyle={tagStyle} />
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <SectionHeader>Work Experience</SectionHeader>
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '14px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}
                    >
                      {exp.position}
                    </h3>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      style={{
                        fontSize: '11px',
                        color: accent,
                        fontWeight: '600',
                        backgroundColor: accentLight,
                        padding: '1px 8px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px',
                      }}
                    >
                      {exp.startDate || exp.duration}
                      {exp.endDate ? ` – ${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}
                  >
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <SectionHeader>Featured Projects</SectionHeader>
              {projects.map((proj, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 3px 0' }}
                  >
                    {proj.name || proj.title}
                  </h3>
                  {proj.description && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={sectionStyle}>
              <SectionHeader>Education</SectionHeader>
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}
                    >
                      {edu.degree}
                    </h3>
                    <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280' }}>
                      {edu.institution}
                    </div>
                  </div>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '11px', color: accent, fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '8px' }}
                  >
                    {edu.year || edu.endDate || edu.startDate}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3. CREATIVE PORTFOLIO
     Two-column layout: narrow slate sidebar (contact + skills) + white main.
     Bold teal accent; skill chips with left-border glyph.
  ══════════════════════════════════════════════════════════════════════════ */
  if (template === 'creative') {
    const accent = '#0d9488';       // teal-600
    const sidebarBg = '#0f172a';    // slate-900
    const sidebarText = '#e2e8f0';

    const SidebarSection = ({ title, children }) => (
      <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
        <h2
          style={{
            fontSize: '10px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: accent,
            borderBottom: `1px solid #1e293b`,
            paddingBottom: '5px',
            marginBottom: '10px',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    );

    const MainSection = ({ title, children }) => (
      <div style={{ marginBottom: '18px' }}>
        <h2
          style={{
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: accent,
            borderBottom: `2px solid ${accent}`,
            paddingBottom: '4px',
            marginBottom: '12px',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    );

    return (
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          width: '794px',
          minHeight: '1123px',
          display: 'flex',
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        {/* ── Sidebar ── */}
        <div
          style={{
            width: '240px',
            backgroundColor: sidebarBg,
            color: sidebarText,
            padding: '36px 22px',
            flexShrink: 0,
          }}
        >
          {/* Name block */}
          <div style={{ marginBottom: '28px' }}>
            <h1
              contentEditable
              suppressContentEditableWarning
              style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', lineHeight: '1.2', margin: '0 0 6px 0' }}
            >
              {name}
            </h1>
            <div style={{ width: '32px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
          </div>

          {/* Contact */}
          <SidebarSection title="Contact">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#94a3b8' }}>
              {profile?.email && <span contentEditable suppressContentEditableWarning>{profile.email}</span>}
              {profile?.phone && <span contentEditable suppressContentEditableWarning>{profile.phone}</span>}
              {profile?.linkedIn && <span contentEditable suppressContentEditableWarning>{profile.linkedIn.replace('https://', '')}</span>}
              {profile?.github && <span contentEditable suppressContentEditableWarning>{profile.github.replace('https://', '')}</span>}
            </div>
          </SidebarSection>

          {/* Skills */}
          {techSkills.length > 0 && (
            <SidebarSection title="Technical Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {techSkills.map((s, i) => (
                  <span
                    key={i}
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#1e293b',
                      color: '#e2e8f0',
                      border: `1px solid #334155`,
                      borderLeft: `3px solid ${accent}`,
                      borderRadius: '3px',
                      padding: '2px 7px',
                      fontSize: '11px',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Education */}
          {education.length > 0 && (
            <SidebarSection title="Education">
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                  <div contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '12px', color: '#f1f5f9' }}>
                    {edu.degree}
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {edu.institution}
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent }}>
                    {edu.year || edu.endDate || edu.startDate}
                  </div>
                </div>
              ))}
            </SidebarSection>
          )}
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '36px 32px', overflowWrap: 'break-word' }}>
          {/* Summary */}
          {profile?.summary && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
              <MainSection title="Profile">
                <p
                  contentEditable
                  suppressContentEditableWarning
                  style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: 0 }}
                >
                  {profile.summary}
                </p>
              </MainSection>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <MainSection title="Work Experience">
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}
                    >
                      {exp.position}
                    </h3>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '11.5px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}
                    >
                      {exp.startDate || exp.duration}
                      {exp.endDate ? ` – ${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}
                  >
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <MainSection title="Notable Projects">
              {projects.map((proj, i) => (
                <div
                  key={i}
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    marginBottom: '12px',
                    borderLeft: `3px solid ${accent}`,
                    paddingLeft: '10px',
                  }}
                >
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 3px 0' }}
                  >
                    {proj.name || proj.title}
                  </h3>
                  {proj.description && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </MainSection>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4. MINIMAL EXECUTIVE
     Pure white, serif font. Ultra-restrained palette: charcoal + warm grey.
     Skills as bullet-separated inline list. No icons, no colour splashes.
  ══════════════════════════════════════════════════════════════════════════ */
  if (template === 'minimal') {
    const headerLine = { borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '10px' };
    const sectionStyle = { marginBottom: '20px', pageBreakInside: 'avoid', breakInside: 'avoid' };

    const SectionHeader = ({ children }) => (
      <h2
        style={{
          ...headerLine,
          fontSize: '10.5px',
          fontWeight: '700',
          color: '#111827',
          textTransform: 'uppercase',
          letterSpacing: '2.5px',
        }}
      >
        {children}
      </h2>
    );

    return (
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          fontFamily: "'Garamond', 'Georgia', 'Times New Roman', serif",
          color: '#1a1a1a',
          padding: '52px 56px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1.5px solid #374151', paddingBottom: '18px' }}>
          <h1
            contentEditable
            suppressContentEditableWarning
            style={{ fontSize: '30px', fontWeight: '400', color: '#111827', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 10px 0' }}
          >
            {name}
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '4px 14px',
              fontSize: '11.5px',
              color: '#6b7280',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {profile?.email && <span contentEditable suppressContentEditableWarning>{profile.email}</span>}
            {profile?.phone && <span contentEditable suppressContentEditableWarning>{profile.phone}</span>}
            {profile?.linkedIn && <span contentEditable suppressContentEditableWarning>{profile.linkedIn.replace('https://', '')}</span>}
            {profile?.github && <span contentEditable suppressContentEditableWarning>{profile.github.replace('https://', '')}</span>}
          </div>
        </div>

        {/* Summary */}
        {profile?.summary && (
          <div style={sectionStyle}>
            <SectionHeader>Profile</SectionHeader>
            <p
              contentEditable
              suppressContentEditableWarning
              style={{ fontSize: '13px', color: '#374151', lineHeight: '1.75', textAlign: 'justify', margin: 0 }}
            >
              {profile.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader>Experience</SectionHeader>
            {experience.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      fontWeight: '700',
                      fontSize: '13.5px',
                      color: '#111827',
                      margin: 0,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {exp.position}
                    {exp.company ? (
                      <span style={{ fontWeight: '400', fontStyle: 'italic', color: '#374151' }}>
                        {' '}— {exp.company}
                      </span>
                    ) : null}
                  </h3>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}
                  >
                    {exp.startDate || exp.duration}
                    {exp.endDate ? ` to ${exp.endDate}` : ''}
                  </span>
                </div>
                {exp.description && (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: '4px 0 0 0', textAlign: 'justify', whiteSpace: 'pre-wrap' }}
                  >
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader>Education</SectionHeader>
            {education.map((edu, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <div>
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0, fontFamily: "'Inter', sans-serif" }}
                  >
                    {edu.degree}
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}
                  >
                    {edu.institution}
                  </div>
                </div>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}
                >
                  {edu.year || edu.endDate || edu.startDate}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader>Selected Projects</SectionHeader>
            {projects.map((proj, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                <h3
                  contentEditable
                  suppressContentEditableWarning
                  style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px 0', fontFamily: "'Inter', sans-serif" }}
                >
                  {proj.name || proj.title}
                </h3>
                {proj.description && (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}
                  >
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills — minimal dot-separated inline line */}
        {techSkills.length > 0 && (
          <div style={sectionStyle}>
            <SectionHeader>Skills</SectionHeader>
            <p
              contentEditable
              suppressContentEditableWarning
              style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: 0, fontFamily: "'Inter', sans-serif" }}
            >
              {techSkills.join(' · ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5. TECHNICAL EXPERT  (default)
     Two-column body: 62% main (experience + projects) / 38% sidebar
     (skills grid + education). Burnt-orange accent. Dark navy header strip.
  ══════════════════════════════════════════════════════════════════════════ */
  const accent = '#c2410c';       // orange-700
  const accentLight = '#fff7ed';  // orange-50
  const headerBg = '#1c1917';     // stone-900

  const MainSectionHeader = ({ children }) => (
    <h2
      style={{
        fontSize: '11px',
        fontWeight: '800',
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        borderBottom: `2px solid ${accent}`,
        paddingBottom: '4px',
        marginBottom: '12px',
      }}
    >
      {children}
    </h2>
  );

  const SidebarSectionHeader = ({ children }) => (
    <h2
      style={{
        fontSize: '10px',
        fontWeight: '800',
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        borderBottom: `1px solid #fed7aa`,
        paddingBottom: '4px',
        marginBottom: '10px',
      }}
    >
      {children}
    </h2>
  );

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        color: '#1f2937',
        boxSizing: 'border-box',
        outline: 'none',
      }}
    >
      {/* Header strip */}
      <div
        style={{
          backgroundColor: headerBg,
          color: '#ffffff',
          padding: '28px 40px',
        }}
      >
        <h1
          contentEditable
          suppressContentEditableWarning
          style={{ fontSize: '26px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px 0', color: '#f5f5f4' }}
        >
          {name}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12px', color: '#a8a29e' }}>
          {profile?.email && <span contentEditable suppressContentEditableWarning>✉ {profile.email}</span>}
          {profile?.phone && <span contentEditable suppressContentEditableWarning>📱 {profile.phone}</span>}
          {profile?.linkedIn && <span contentEditable suppressContentEditableWarning>🔗 {profile.linkedIn.replace('https://', '')}</span>}
          {profile?.github && <span contentEditable suppressContentEditableWarning>💻 {profile.github.replace('https://', '')}</span>}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* ── Main Column ── */}
        <div style={{ flex: '1 1 62%', padding: '24px 28px 24px 40px', borderRight: '1px solid #e7e5e4' }}>
          {/* Summary */}
          {profile?.summary && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
              <MainSectionHeader>Professional Profile</MainSectionHeader>
              <p
                contentEditable
                suppressContentEditableWarning
                style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, textAlign: 'justify' }}
              >
                {profile.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <MainSectionHeader>Work Experience</MainSectionHeader>
              {experience.map((exp, i) => (
                <div
                  key={i}
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    marginBottom: '14px',
                    paddingLeft: '12px',
                    borderLeft: `3px solid #fed7aa`,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-5px',
                      top: '5px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: accent,
                      borderRadius: '50%',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0 }}
                    >
                      {exp.position}
                    </h3>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '11px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}
                    >
                      {exp.startDate || exp.duration}
                      {exp.endDate ? ` – ${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}
                  >
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <MainSectionHeader>Technical Projects</MainSectionHeader>
              {projects.map((proj, i) => (
                <div
                  key={i}
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    marginBottom: '12px',
                    paddingLeft: '12px',
                    borderLeft: `3px solid #fed7aa`,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-5px',
                      top: '5px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: accent,
                      borderRadius: '50%',
                    }}
                  />
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 3px 0' }}
                  >
                    {proj.name || proj.title}
                  </h3>
                  {proj.description && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ flex: '0 0 38%', padding: '24px 32px 24px 24px', backgroundColor: accentLight }}>
          {/* Skills — 3-col grid */}
          {techSkills.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSectionHeader>Technical Skills</SidebarSectionHeader>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '4px 6px',
                }}
              >
                {techSkills.map((s, i) => (
                  <span
                    key={i}
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      fontSize: '11px',
                      color: '#292524',
                      backgroundColor: '#ffedd5',
                      border: '1px solid #fed7aa',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontWeight: '500',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSectionHeader>Education</SidebarSectionHeader>
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '12.5px', color: '#111827', margin: '0 0 2px 0', lineHeight: '1.3' }}
                  >
                    {edu.degree}
                  </h3>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: '#57534e' }}>
                    {edu.institution}
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '700' }}>
                    {edu.year || edu.endDate || edu.startDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
