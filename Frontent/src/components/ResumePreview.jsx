import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ResumePreview – 5 premium CV templates
   Fixes applied in this version:
   ✅ Dynamic header: reads data.email || data.profile.email for real user data
   ✅ LinkedIn & GitHub rendered as clickable <a> hyperlinks per template theme
   ✅ Completely isolated section blocks — no nesting bleed between sections
   ✅ Objective / Summary section restored directly beneath the header
   ✅ Certifications & Awards rendered as their own independent sections
   ✅ Smart grouped skills: splits into "Core Technologies" + "Tools & Platforms"
   ✅ contentEditable on every text node, break-inside-avoid on every block
───────────────────────────────────────────────────────────────────────────── */

/* ── Shared utilities ────────────────────────────────────────────────── */

/** Normalise a URL – ensure it starts with https:// */
const ensureHttps = (url) => {
  if (!url) return '#';
  return url.startsWith('http') ? url : `https://${url}`;
};

/** Strip protocol for display text */
const stripProto = (url) => (url || '').replace(/^https?:\/\//, '');

/**
 * Smart skill grouper.
 * Heuristically splits a flat skill array into two rows:
 *   - "Core Technologies" → languages, frameworks, libraries
 *   - "Tools & Platforms"  → DevOps, DBs, cloud, IDEs, methodologies
 * Returns { core: string[], tools: string[] }
 */
const groupSkills = (skills = []) => {
  const toolKeywords = [
    'git','github','gitlab','docker','kubernetes','aws','azure','gcp','ci/cd',
    'jenkins','jira','linux','bash','sql','mongodb','postgres','mysql','redis',
    'firebase','heroku','vercel','netlify','figma','postman','vs code','vscode',
    'webpack','vite','npm','yarn','agile','scrum','rest','graphql','nginx',
  ];
  const core = [];
  const tools = [];
  skills.forEach((s) => {
    const lower = s.toLowerCase();
    if (toolKeywords.some((kw) => lower.includes(kw))) {
      tools.push(s);
    } else {
      core.push(s);
    }
  });
  // If grouping is too unbalanced, just split in half
  if (core.length === 0 || tools.length === 0) {
    const mid = Math.ceil(skills.length / 2);
    return { core: skills.slice(0, mid), tools: skills.slice(mid) };
  }
  return { core, tools };
};

/* ── Shared skill renderers ──────────────────────────────────────────── */

/** Pill tag cloud (for Modern / Creative) */
const SkillTags = ({ skills, tagStyle }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
      {skills.map((s, i) => (
        <span key={i} contentEditable suppressContentEditableWarning style={tagStyle}>{s}</span>
      ))}
    </div>
  );
};

/** Grouped two-row skill layout */
const GroupedSkills = ({ skills, tagStyle, labelColor, rowGap = '8px' }) => {
  const { core, tools } = groupSkills(skills);
  const rowStyle = { marginBottom: rowGap };
  const labelStyle = {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: labelColor || '#6b7280',
    marginBottom: '4px',
  };
  return (
    <div>
      {core.length > 0 && (
        <div style={rowStyle}>
          <div style={labelStyle}>Core Technologies</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 5px' }}>
            {core.map((s, i) => (
              <span key={i} contentEditable suppressContentEditableWarning style={tagStyle}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {tools.length > 0 && (
        <div style={rowStyle}>
          <div style={labelStyle}>Tools &amp; Platforms</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 5px' }}>
            {tools.map((s, i) => (
              <span key={i} contentEditable suppressContentEditableWarning style={tagStyle}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** 3-column arrow-prefix grid (for Classic) */
const SkillGrid = ({ skills, textColor }) => {
  if (!skills || skills.length === 0) return null;
  const { core, tools } = groupSkills(skills);
  const renderRow = (label, list) => (
    list.length > 0 && (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: textColor || '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 8px' }}>
          {list.map((s, i) => (
            <div key={i} contentEditable suppressContentEditableWarning
              style={{ fontSize: '12px', color: textColor || '#374151', paddingLeft: '10px', position: 'relative', lineHeight: '1.6' }}>
              <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '8px' }}>▸</span>
              {s}
            </div>
          ))}
        </div>
      </div>
    )
  );
  return (
    <div>
      {renderRow('Core Technologies', core)}
      {renderRow('Tools & Platforms', tools)}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const ResumePreview = ({ data, template = 'classic' }) => {
  if (!data) return null;

  const {
    fullname = { firstname: '', lastname: '' },
    profile = {},
    experience = [],
    education = [],
    projects = [],
    skills = {},
    certifications = [],
    awards = [],
  } = data;

  const name = `${fullname?.firstname || ''} ${fullname?.lastname || ''}`.trim();
  const techSkills = skills?.technical || [];
  const softSkills = skills?.soft || [];

  // Email: try profile.email first, then top-level data.email (auth object)
  const email = profile?.email || data?.email || '';
  const phone = profile?.phone || '';
  const linkedIn = profile?.linkedIn || '';
  const github = profile?.github || '';
  const summary = profile?.summary || '';

  /* ════════════════════════════════════════════════════════════════════════
     1. CLASSIC PROFESSIONAL
     Palette: navy #1e3a5f / slate / double-rule name header / 3-col grid
  ════════════════════════════════════════════════════════════════════════ */
  if (template === 'classic') {
    const accent = '#1e3a5f';
    const dividerRule = { borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '10px' };
    const block = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' };

    const SectionHeader = ({ children }) => (
      <h2 style={{ ...dividerRule, fontSize: '12px', fontWeight: '700', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
        {children}
      </h2>
    );

    const linkStyle = { color: accent, textDecoration: 'underline', textDecorationColor: '#93c5fd', fontSize: '12px' };

    return (
      <div contentEditable suppressContentEditableWarning
        style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', fontFamily: "'Georgia','Times New Roman',serif", color: '#1a1a2e', padding: '44px 48px', boxSizing: 'border-box', outline: 'none' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: `3px double ${accent}`, paddingBottom: '16px' }}>
          <h1 contentEditable suppressContentEditableWarning
            style={{ fontSize: '28px', fontWeight: '700', color: accent, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            {name}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px', fontSize: '12px', color: '#4b5563' }}>
            {email && <span contentEditable suppressContentEditableWarning>{email}</span>}
            {phone && <span contentEditable suppressContentEditableWarning>{phone}</span>}
            {linkedIn && (
              <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {stripProto(linkedIn)}
              </a>
            )}
            {github && (
              <a href={ensureHttps(github)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {stripProto(github)}
              </a>
            )}
          </div>
        </div>

        {/* ── Objective / Summary ── */}
        {summary && (
          <div style={block}>
            <SectionHeader>Professional Summary</SectionHeader>
            <p contentEditable suppressContentEditableWarning
              style={{ fontSize: '13px', color: '#374151', lineHeight: '1.65', textAlign: 'justify', margin: '8px 0 0 0' }}>
              {summary}
            </p>
          </div>
        )}

        {/* ── Technical Skills ── */}
        {techSkills.length > 0 && (
          <div style={block}>
            <SectionHeader>Technical Skills</SectionHeader>
            <div style={{ marginTop: '8px' }}>
              <SkillGrid skills={techSkills} textColor="#374151" />
            </div>
          </div>
        )}

        {/* ── Professional Experience ── */}
        {experience.length > 0 && (
          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
            <SectionHeader>Professional Experience</SectionHeader>
            {experience.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0 }}>
                    {exp.position}
                  </h3>
                  <span contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                  </span>
                </div>
                <div contentEditable suppressContentEditableWarning
                  style={{ fontSize: '12.5px', color: '#4b5563', fontStyle: 'italic', marginBottom: '4px' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description && (
                  <p contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Key Projects ── */}
        {projects.length > 0 && (
          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
            <SectionHeader>Key Projects</SectionHeader>
            {projects.map((proj, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px 0' }}>
                    {proj.title || proj.name}
                  </h3>
                  {proj.technologies && (
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {proj.technologies}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                    {proj.description}
                  </p>
                )}
                {(proj.projectUrl || proj.githubUrl) && (
                  <div style={{ marginTop: '2px', fontSize: '11px', display: 'flex', gap: '12px' }}>
                    {proj.projectUrl && <a href={ensureHttps(proj.projectUrl)} target="_blank" rel="noopener noreferrer" style={linkStyle}>Live Demo</a>}
                    {proj.githubUrl && <a href={ensureHttps(proj.githubUrl)} target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Certifications & Achievements ── */}
        {certifications.length > 0 && (
          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
            <SectionHeader>Certifications &amp; Achievements</SectionHeader>
            {certifications.map((cert, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                    {cert.name}
                  </h3>
                  {cert.issueDate && (
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {cert.issueDate}{cert.expiryDate ? ` – ${cert.expiryDate}` : ''}
                    </span>
                  )}
                </div>
                {cert.issuer && (
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                    {cert.issuer}
                  </div>
                )}
                {cert.credentialUrl && (
                  <a href={ensureHttps(cert.credentialUrl)} target="_blank" rel="noopener noreferrer"
                    style={{ ...linkStyle, fontSize: '11px' }}>
                    View Credential
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Awards ── */}
        {awards.length > 0 && (
          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
            <SectionHeader>Awards &amp; Honours</SectionHeader>
            {awards.map((award, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                    {award.title}
                  </h3>
                  {award.date && (
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {award.date}
                    </span>
                  )}
                </div>
                {award.issuer && (
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                    {award.issuer}
                  </div>
                )}
                {award.description && (
                  <p contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#374151', lineHeight: '1.55', margin: '2px 0 0 0' }}>
                    {award.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Education ── */}
        {education.length > 0 && (
          <div style={block}>
            <SectionHeader>Education</SectionHeader>
            {education.map((edu, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', marginTop: i === 0 ? '8px' : 0 }}>
                <div>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                    {edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                  </div>
                </div>
                <span contentEditable suppressContentEditableWarning
                  style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {edu.endDate || edu.year || edu.startDate}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     2. MODERN TECH
     Deep indigo gradient banner + white body. Pill tags, left-border timeline.
  ════════════════════════════════════════════════════════════════════════ */
  if (template === 'modern') {
    const accent = '#4f46e5';
    const accentLight = '#e0e7ff';
    const block = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' };

    const SectionHeader = ({ children }) => (
      <h2 style={{ fontSize: '11px', fontWeight: '800', color: accent, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: `2px solid ${accent}`, paddingBottom: '5px', marginBottom: '12px', margin: 0 }}>
        {children}
      </h2>
    );

    const tagStyle = { display: 'inline-block', backgroundColor: accentLight, color: accent, borderRadius: '4px', padding: '2px 9px', fontSize: '11.5px', fontWeight: '600', border: '1px solid #c7d2fe' };
    const linkStyle = { color: '#c7d2fe', textDecoration: 'underline', fontSize: '12.5px' };

    return (
      <div contentEditable suppressContentEditableWarning
        style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: '#1f2937', boxSizing: 'border-box', outline: 'none' }}>

        {/* ── Header Banner ── */}
        <div style={{ background: 'linear-gradient(135deg,#312e81 0%,#4f46e5 60%,#818cf8 100%)', padding: '32px 44px 28px', color: '#ffffff' }}>
          <h1 contentEditable suppressContentEditableWarning
            style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            {name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12.5px', opacity: 0.92 }}>
            {email && <span contentEditable suppressContentEditableWarning>✉ {email}</span>}
            {phone && <span contentEditable suppressContentEditableWarning>📱 {phone}</span>}
            {linkedIn && (
              <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                🔗 {stripProto(linkedIn)}
              </a>
            )}
            {github && (
              <a href={ensureHttps(github)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                💻 {stripProto(github)}
              </a>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '28px 44px' }}>

          {/* Summary */}
          {summary && (
            <div style={{ ...block, marginTop: 0 }}>
              <SectionHeader>Professional Summary</SectionHeader>
              <p contentEditable suppressContentEditableWarning
                style={{ fontSize: '13px', color: '#374151', lineHeight: '1.65', margin: '10px 0 0 0' }}>
                {summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {techSkills.length > 0 && (
            <div style={block}>
              <SectionHeader>Core Competencies</SectionHeader>
              <div style={{ marginTop: '10px' }}>
                <GroupedSkills skills={techSkills} tagStyle={tagStyle} labelColor="#6366f1" />
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <SectionHeader>Work Experience</SectionHeader>
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: i === 0 ? '10px' : 0, marginBottom: '14px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>
                      {exp.position}
                    </h3>
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '11px', color: accent, fontWeight: '600', backgroundColor: accentLight, padding: '1px 8px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                    </span>
                  </div>
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
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
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: i === 0 ? '10px' : 0, marginBottom: '12px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px 0' }}>
                      {proj.title || proj.name}
                    </h3>
                    {proj.technologies && (
                      <span contentEditable suppressContentEditableWarning
                        style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {proj.description}
                    </p>
                  )}
                  {(proj.projectUrl || proj.githubUrl) && (
                    <div style={{ marginTop: '3px', display: 'flex', gap: '12px', fontSize: '11px' }}>
                      {proj.projectUrl && <a href={ensureHttps(proj.projectUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>Live Demo</a>}
                      {proj.githubUrl && <a href={ensureHttps(proj.githubUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>GitHub</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <SectionHeader>Certifications &amp; Achievements</SectionHeader>
              {certifications.map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: i === 0 ? '10px' : 0, marginBottom: '10px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                      {cert.name}
                    </h3>
                    {cert.issueDate && (
                      <span contentEditable suppressContentEditableWarning
                        style={{ fontSize: '11px', color: accent, fontWeight: '600', backgroundColor: accentLight, padding: '1px 8px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {cert.issueDate}
                      </span>
                    )}
                  </div>
                  {cert.issuer && (
                    <div contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      {cert.issuer}
                    </div>
                  )}
                  {cert.credentialUrl && (
                    <a href={ensureHttps(cert.credentialUrl)} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: accent, textDecoration: 'underline' }}>
                      View Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={block}>
              <SectionHeader>Education</SectionHeader>
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: i === 0 ? '10px' : 0, marginBottom: '8px' }}>
                  <div>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <div contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#6b7280' }}>
                      {edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                  <span contentEditable suppressContentEditableWarning
                    style={{ fontSize: '11px', color: accent, fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {edu.endDate || edu.year || edu.startDate}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     3. CREATIVE PORTFOLIO
     2-column: dark slate sidebar (contact + skills + education) + white main
  ════════════════════════════════════════════════════════════════════════ */
  if (template === 'creative') {
    const accent = '#0d9488';
    const sidebarBg = '#0f172a';

    const SidebarSection = ({ title, children }) => (
      <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
        <h2 style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: accent, borderBottom: '1px solid #1e293b', paddingBottom: '5px', marginBottom: '10px', margin: 0 }}>
          {title}
        </h2>
        {children}
      </div>
    );

    const MainSection = ({ title, children }) => (
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '12px', margin: 0 }}>
          {title}
        </h2>
        {children}
      </div>
    );

    const chipStyle = { display: 'inline-block', backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderLeft: `3px solid ${accent}`, borderRadius: '3px', padding: '2px 7px', fontSize: '11px' };
    const sidebarLinkStyle = { color: accent, textDecoration: 'underline', fontSize: '11.5px', wordBreak: 'break-all' };

    return (
      <div contentEditable suppressContentEditableWarning
        style={{ width: '794px', minHeight: '1123px', display: 'flex', fontFamily: "'Inter','Segoe UI',Arial,sans-serif", boxSizing: 'border-box', outline: 'none' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: '240px', backgroundColor: sidebarBg, color: '#e2e8f0', padding: '36px 22px', flexShrink: 0 }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 contentEditable suppressContentEditableWarning
              style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', lineHeight: '1.2', margin: '0 0 8px 0' }}>
              {name}
            </h1>
            <div style={{ width: '32px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
          </div>

          {/* Contact */}
          <SidebarSection title="Contact">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#94a3b8' }}>
              {email && <span contentEditable suppressContentEditableWarning>{email}</span>}
              {phone && <span contentEditable suppressContentEditableWarning>{phone}</span>}
              {linkedIn && (
                <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={sidebarLinkStyle}>
                  {stripProto(linkedIn)}
                </a>
              )}
              {github && (
                <a href={ensureHttps(github)} target="_blank" rel="noopener noreferrer" style={sidebarLinkStyle}>
                  {stripProto(github)}
                </a>
              )}
            </div>
          </SidebarSection>

          {/* Skills */}
          {techSkills.length > 0 && (
            <SidebarSection title="Technical Skills">
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '4px' }}>Core Tech</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {groupSkills(techSkills).core.map((s, i) => (
                    <span key={i} contentEditable suppressContentEditableWarning style={chipStyle}>{s}</span>
                  ))}
                </div>
              </div>
              {groupSkills(techSkills).tools.length > 0 && (
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '4px' }}>Tools &amp; Platforms</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {groupSkills(techSkills).tools.map((s, i) => (
                      <span key={i} contentEditable suppressContentEditableWarning style={chipStyle}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </SidebarSection>
          )}

          {/* Education in sidebar */}
          {education.length > 0 && (
            <SidebarSection title="Education">
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                  <div contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '12px', color: '#f1f5f9' }}>
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#94a3b8' }}>{edu.institution}</div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent }}>
                    {edu.endDate || edu.year || edu.startDate}
                  </div>
                </div>
              ))}
            </SidebarSection>
          )}

          {/* Certifications in sidebar */}
          {certifications.length > 0 && (
            <SidebarSection title="Certifications">
              {certifications.map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px' }}>
                  <div contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '11.5px', color: '#f1f5f9' }}>{cert.name}</div>
                  {cert.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: '#94a3b8' }}>{cert.issuer}</div>}
                  {cert.issueDate && <div contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: accent }}>{cert.issueDate}</div>}
                </div>
              ))}
            </SidebarSection>
          )}
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '36px 32px', overflowWrap: 'break-word' }}>

          {/* Summary */}
          {summary && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
              <MainSection title="Profile">
                <p contentEditable suppressContentEditableWarning
                  style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: '10px 0 0 0' }}>
                  {summary}
                </p>
              </MainSection>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <MainSection title="Work Experience">
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px', marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>
                      {exp.position}
                    </h3>
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '11.5px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                    </span>
                  </div>
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
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
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px', marginTop: i === 0 ? '10px' : 0, borderLeft: `3px solid ${accent}`, paddingLeft: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px 0' }}>
                      {proj.title || proj.name}
                    </h3>
                    {proj.technologies && (
                      <span contentEditable suppressContentEditableWarning
                        style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {proj.description}
                    </p>
                  )}
                  {(proj.projectUrl || proj.githubUrl) && (
                    <div style={{ marginTop: '3px', display: 'flex', gap: '12px', fontSize: '11px' }}>
                      {proj.projectUrl && <a href={ensureHttps(proj.projectUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>Live Demo</a>}
                      {proj.githubUrl && <a href={ensureHttps(proj.githubUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>GitHub</a>}
                    </div>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <MainSection title="Awards &amp; Recognition">
              {awards.map((award, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                      {award.title}
                    </h3>
                    {award.date && (
                      <span contentEditable suppressContentEditableWarning
                        style={{ fontSize: '11.5px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {award.date}
                      </span>
                    )}
                  </div>
                  {award.issuer && (
                    <div contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>{award.issuer}</div>
                  )}
                  {award.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                      {award.description}
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

  /* ════════════════════════════════════════════════════════════════════════
     4. MINIMAL EXECUTIVE
     Pure white, serif. Ultra-restrained charcoal palette. Skills: dot list.
  ════════════════════════════════════════════════════════════════════════ */
  if (template === 'minimal') {
    const block = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' };
    const headerLine = { borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '10px', margin: 0 };

    const SectionHeader = ({ children }) => (
      <h2 style={{ ...headerLine, fontSize: '10.5px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '2.5px' }}>
        {children}
      </h2>
    );

    const linkStyle = { color: '#374151', textDecoration: 'underline', fontSize: '11.5px', fontFamily: "'Inter','Segoe UI',sans-serif" };

    return (
      <div contentEditable suppressContentEditableWarning
        style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', fontFamily: "'Garamond','Georgia','Times New Roman',serif", color: '#1a1a1a', padding: '52px 56px', boxSizing: 'border-box', outline: 'none' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1.5px solid #374151', paddingBottom: '18px' }}>
          <h1 contentEditable suppressContentEditableWarning
            style={{ fontSize: '30px', fontWeight: '400', color: '#111827', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
            {name}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {email && <span contentEditable suppressContentEditableWarning>{email}</span>}
            {phone && <span contentEditable suppressContentEditableWarning>{phone}</span>}
            {linkedIn && (
              <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {stripProto(linkedIn)}
              </a>
            )}
            {github && (
              <a href={ensureHttps(github)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {stripProto(github)}
              </a>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div style={block}>
            <SectionHeader>Profile</SectionHeader>
            <p contentEditable suppressContentEditableWarning
              style={{ fontSize: '13px', color: '#374151', lineHeight: '1.75', textAlign: 'justify', margin: '8px 0 0 0' }}>
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader>Experience</SectionHeader>
            {experience.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '14px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                    {exp.position}
                    {exp.company && <span style={{ fontWeight: '400', fontStyle: 'italic', color: '#374151' }}> — {exp.company}</span>}
                  </h3>
                  <span contentEditable suppressContentEditableWarning
                    style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {exp.startDate || exp.duration}{exp.endDate ? ` to ${exp.endDate}` : exp.isCurrentJob ? ' to Present' : ''}
                  </span>
                </div>
                {exp.description && (
                  <p contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: '4px 0 0 0', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
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
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', marginTop: i === 0 ? '8px' : 0 }}>
                <div>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                    {edu.institution}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </div>
                </div>
                <span contentEditable suppressContentEditableWarning
                  style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {edu.endDate || edu.year || edu.startDate}
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
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px 0', fontFamily: "'Inter',sans-serif" }}>
                    {proj.title || proj.name}
                  </h3>
                  {proj.technologies && (
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px', fontFamily: "'Inter',sans-serif" }}>
                      {proj.technologies}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader>Certifications</SectionHeader>
            {certifications.map((cert, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '6px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                    {cert.name}
                  </h3>
                  {cert.issueDate && (
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {cert.issueDate}
                    </span>
                  )}
                </div>
                {cert.issuer && (
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                    {cert.issuer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills — minimal dot-separated */}
        {techSkills.length > 0 && (
          <div style={block}>
            <SectionHeader>Skills</SectionHeader>
            <div style={{ marginTop: '8px' }}>
              {groupSkills(techSkills).core.length > 0 && (
                <p contentEditable suppressContentEditableWarning
                  style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: '0 0 4px 0', fontFamily: "'Inter',sans-serif" }}>
                  <strong style={{ color: '#111827' }}>Core:</strong> {groupSkills(techSkills).core.join(' · ')}
                </p>
              )}
              {groupSkills(techSkills).tools.length > 0 && (
                <p contentEditable suppressContentEditableWarning
                  style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                  <strong style={{ color: '#111827' }}>Tools:</strong> {groupSkills(techSkills).tools.join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     5. TECHNICAL EXPERT (default)
     Stone-900 header strip + 62%/38% two-column body. Orange accent.
  ════════════════════════════════════════════════════════════════════════ */
  const accent = '#c2410c';
  const accentLight = '#fff7ed';
  const headerBg = '#1c1917';

  const MainSectionHeader = ({ children }) => (
    <h2 style={{ fontSize: '11px', fontWeight: '800', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '12px', margin: 0 }}>
      {children}
    </h2>
  );

  const SidebarSectionHeader = ({ children }) => (
    <h2 style={{ fontSize: '10px', fontWeight: '800', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #fed7aa', paddingBottom: '4px', marginBottom: '10px', margin: 0 }}>
      {children}
    </h2>
  );

  const techLinkStyle = { color: '#fb923c', textDecoration: 'underline', fontSize: '12px' };

  return (
    <div contentEditable suppressContentEditableWarning
      style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: '#1f2937', boxSizing: 'border-box', outline: 'none' }}>

      {/* ── Header strip ── */}
      <div style={{ backgroundColor: headerBg, color: '#ffffff', padding: '28px 40px' }}>
        <h1 contentEditable suppressContentEditableWarning
          style={{ fontSize: '26px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px 0', color: '#f5f5f4' }}>
          {name}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12px', color: '#a8a29e' }}>
          {email && <span contentEditable suppressContentEditableWarning>✉ {email}</span>}
          {phone && <span contentEditable suppressContentEditableWarning>📱 {phone}</span>}
          {linkedIn && (
            <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={techLinkStyle}>
              🔗 {stripProto(linkedIn)}
            </a>
          )}
          {github && (
            <a href={ensureHttps(github)} target="_blank" rel="noopener noreferrer" style={techLinkStyle}>
              💻 {stripProto(github)}
            </a>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: 'flex', gap: 0 }}>

        {/* ── Main Column ── */}
        <div style={{ flex: '1 1 62%', padding: '24px 28px 24px 40px', borderRight: '1px solid #e7e5e4' }}>

          {/* Summary */}
          {summary && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
              <MainSectionHeader>Professional Profile</MainSectionHeader>
              <p contentEditable suppressContentEditableWarning
                style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: '10px 0 0 0', textAlign: 'justify' }}>
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <MainSectionHeader>Work Experience</MainSectionHeader>
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '14px', marginTop: i === 0 ? '10px' : 0, paddingLeft: '12px', borderLeft: '3px solid #fed7aa', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', backgroundColor: accent, borderRadius: '50%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0 }}>
                      {exp.position}
                    </h3>
                    <span contentEditable suppressContentEditableWarning
                      style={{ fontSize: '11px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                    </span>
                  </div>
                  <div contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
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
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px', marginTop: i === 0 ? '10px' : 0, paddingLeft: '12px', borderLeft: '3px solid #fed7aa', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', backgroundColor: accent, borderRadius: '50%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px 0' }}>
                      {proj.title || proj.name}
                    </h3>
                    {proj.technologies && (
                      <span contentEditable suppressContentEditableWarning
                        style={{ fontSize: '10.5px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {proj.description}
                    </p>
                  )}
                  {(proj.projectUrl || proj.githubUrl) && (
                    <div style={{ marginTop: '3px', display: 'flex', gap: '12px', fontSize: '11px' }}>
                      {proj.projectUrl && <a href={ensureHttps(proj.projectUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>Live Demo</a>}
                      {proj.githubUrl && <a href={ensureHttps(proj.githubUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>GitHub</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Awards — in main column for Technical */}
          {awards.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <MainSectionHeader>Awards &amp; Achievements</MainSectionHeader>
              {awards.map((award, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning
                      style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                      {award.title}
                    </h3>
                    {award.date && (
                      <span contentEditable suppressContentEditableWarning
                        style={{ fontSize: '11px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {award.date}
                      </span>
                    )}
                  </div>
                  {award.issuer && (
                    <div contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      {award.issuer}
                    </div>
                  )}
                  {award.description && (
                    <p contentEditable suppressContentEditableWarning
                      style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', margin: '2px 0 0 0' }}>
                      {award.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar Column ── */}
        <div style={{ flex: '0 0 38%', padding: '24px 32px 24px 24px', backgroundColor: accentLight }}>

          {/* Skills — 2-col grouped chips */}
          {techSkills.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSectionHeader>Technical Skills</SidebarSectionHeader>
              <div style={{ marginTop: '8px' }}>
                {groupSkills(techSkills).core.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#78716c', marginBottom: '4px' }}>Core Tech</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 4px' }}>
                      {groupSkills(techSkills).core.map((s, i) => (
                        <span key={i} contentEditable suppressContentEditableWarning
                          style={{ fontSize: '10.5px', color: '#292524', backgroundColor: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '3px', padding: '2px 6px', fontWeight: '500' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {groupSkills(techSkills).tools.length > 0 && (
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#78716c', marginBottom: '4px' }}>Tools &amp; Platforms</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 4px' }}>
                      {groupSkills(techSkills).tools.map((s, i) => (
                        <span key={i} contentEditable suppressContentEditableWarning
                          style={{ fontSize: '10.5px', color: '#292524', backgroundColor: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '3px', padding: '2px 6px', fontWeight: '500' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSectionHeader>Education</SidebarSectionHeader>
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '12.5px', color: '#111827', margin: '0 0 2px 0', lineHeight: '1.3' }}>
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: '#57534e' }}>
                    {edu.institution}
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '700' }}>
                    {edu.endDate || edu.year || edu.startDate}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications in sidebar */}
          {certifications.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSectionHeader>Certifications</SidebarSectionHeader>
              {certifications.map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                  <h3 contentEditable suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '12px', color: '#111827', margin: '0 0 1px 0', lineHeight: '1.3' }}>
                    {cert.name}
                  </h3>
                  {cert.issuer && (
                    <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#57534e' }}>{cert.issuer}</div>
                  )}
                  {cert.issueDate && (
                    <div contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: accent, fontWeight: '700' }}>{cert.issueDate}</div>
                  )}
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
