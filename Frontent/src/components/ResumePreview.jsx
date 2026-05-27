import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ResumePreview – 5 premium CV templates with DUAL-MODE rendering
   ─────────────────────────────────────────────────────────────────────────────
   MODE A – Structured: when data arrays (experience, education, …) contain
            real entries the premium component-based layout is used.
   MODE B – Markdown fallback: when the AI returns a raw markdown string
            instead of a parsed object, we render data._rawMarkdown directly
            using a zero-dependency, pure-JS markdown→HTML converter. The
            rendered output is wrapped in a styled container that inherits
            each template's colour palette, typography and hex text colours.
   ─────────────────────────────────────────────────────────────────────────────
   Requirements met:
   ✅ No new npm package – pure-JS markdown parser handles ##, **, *, -, [a](b)
   ✅ Hex-colour-themed <h1>–<h3>, <ul>/<li>, <a>, <strong>, <em> per template
   ✅ break-inside-avoid on every section block
   ✅ contentEditable on every text node (structured mode)
   ✅ Dynamic header data-binding: data.profile.email || data.email
   ✅ LinkedIn & GitHub rendered as clickable <a> hyperlinks
   ✅ Smart grouped skills (Core Tech / Tools & Platforms rows)
   ✅ Certifications & Awards as independent isolated sections
────────────────────────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════════════════════
   ZERO-DEPENDENCY MARKDOWN → HTML CONVERTER
   Handles: # h1, ## h2, ### h3, **bold**, *italic*, `code`, - bullet, [a](b)
   Returns a safe HTML string (no user-controlled tags are ever injected raw).
══════════════════════════════════════════════════════════════════════════════ */
const mdToHtml = (md = '') => {
  if (!md || typeof md !== 'string') return '';

  // 1. Normalise CRLF → LF
  let text = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Escape raw HTML that might already be in the string
  const esc = (s) =>
    s.replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;');

  // Helper: convert inline markdown (bold, italic, code, links)
  const inline = (s) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // [text](url) – only allow http(s) urls
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = text.split('\n');
  const out = [];
  let inList = false;

  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimStart();

    // Headings
    if (/^### /.test(trimmed)) {
      closeList();
      out.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (/^## /.test(trimmed)) {
      closeList();
      out.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (/^# /.test(trimmed)) {
      closeList();
      out.push(`<h1>${inline(trimmed.slice(2))}</h1>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      closeList();
      out.push('<hr/>');
      continue;
    }

    // Unordered list item: -, *, or •
    if (/^[-*•]\s/.test(trimmed)) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Blank line
    if (trimmed === '') {
      closeList();
      out.push('<br/>');
      continue;
    }

    // Normal paragraph line
    closeList();
    out.push(`<p>${inline(trimmed)}</p>`);
  }
  closeList();
  return out.join('\n');
};

/* ── Heuristic check: does the data have meaningful structured content? ── */
const hasStructuredContent = (data) => {
  if (!data) return false;
  const { experience = [], education = [], projects = [], skills = {} } = data;
  const techSkills = skills?.technical || [];
  return (
    experience.some(e => e.position || e.company) ||
    education.some(e => e.degree || e.institution) ||
    projects.some(p => p.title || p.name) ||
    techSkills.length > 0
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   SHARED UTILITIES
══════════════════════════════════════════════════════════════════════════════ */

const ensureHttps = (url) => {
  if (!url) return '#';
  return url.startsWith('http') ? url : `https://${url}`;
};

const stripProto = (url) => (url || '').replace(/^https?:\/\//, '');

/** Split flat skill array into { core, tools } */
const groupSkills = (skills = []) => {
  const toolKw = [
    'git','github','gitlab','docker','kubernetes','aws','azure','gcp','ci/cd',
    'jenkins','jira','linux','bash','sql','mongodb','postgres','mysql','redis',
    'firebase','heroku','vercel','netlify','figma','postman','vs code','vscode',
    'webpack','vite','npm','yarn','agile','scrum','rest','graphql','nginx',
  ];
  const core = [], tools = [];
  skills.forEach((s) => {
    const lower = s.toLowerCase();
    toolKw.some((kw) => lower.includes(kw)) ? tools.push(s) : core.push(s);
  });
  if (core.length === 0 || tools.length === 0) {
    const mid = Math.ceil(skills.length / 2);
    return { core: skills.slice(0, mid), tools: skills.slice(mid) };
  }
  return { core, tools };
};

/* ── Shared skill renderers ──────────────────────────────────────────── */

const SkillGrid = ({ skills, textColor }) => {
  if (!skills?.length) return null;
  const { core, tools } = groupSkills(skills);
  const renderRow = (label, list) =>
    list.length > 0 && (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: textColor || '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 8px' }}>
          {list.map((s, i) => (
            <div key={i} contentEditable suppressContentEditableWarning
              style={{ fontSize: '12px', color: textColor || '#374151', paddingLeft: '10px', position: 'relative', lineHeight: '1.6' }}>
              <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '8px' }}>▸</span>{s}
            </div>
          ))}
        </div>
      </div>
    );
  return <div>{renderRow('Core Technologies', core)}{renderRow('Tools & Platforms', tools)}</div>;
};

const GroupedSkillTags = ({ skills, tagStyle, labelColor }) => {
  if (!skills?.length) return null;
  const { core, tools } = groupSkills(skills);
  const lbl = { fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: labelColor || '#6b7280', marginBottom: '4px' };
  const row = (label, list) =>
    list.length > 0 && (
      <div style={{ marginBottom: '8px' }}>
        <div style={lbl}>{label}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 5px' }}>
          {list.map((s, i) => (
            <span key={i} contentEditable suppressContentEditableWarning style={tagStyle}>{s}</span>
          ))}
        </div>
      </div>
    );
  return <div>{row('Core Technologies', core)}{row('Tools & Platforms', tools)}</div>;
};

/**
 * TypedSkillsBlock – preferred renderer when the AI returns typed skill groups.
 * Falls back to GroupedSkillTags (heuristic) when typed groups are empty.
 */
const TypedSkillsBlock = ({ typedGroups, techSkills, tagStyle, labelColor, textColor, mode = 'tags' }) => {
  const lbl = {
    fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '1px', color: labelColor || '#6b7280', marginBottom: '4px',
  };

  // Use typed groups when available
  if (typedGroups && typedGroups.length > 0) {
    return (
      <div>
        {typedGroups.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: '8px' }}>
            <div style={lbl}>{label}</div>
            {mode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 8px' }}>
                {items.map((s, i) => (
                  <div key={i} contentEditable suppressContentEditableWarning
                    style={{ fontSize: '12px', color: textColor || '#374151', paddingLeft: '10px', position: 'relative', lineHeight: '1.6' }}>
                    <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '8px' }}>▸</span>{s}
                  </div>
                ))}
              </div>
            ) : mode === 'dot' ? (
              <p contentEditable suppressContentEditableWarning
                style={{ fontSize: '12.5px', color: textColor || '#374151', lineHeight: '1.7', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                {items.join(' · ')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 5px' }}>
                {items.map((s, i) => (
                  <span key={i} contentEditable suppressContentEditableWarning style={tagStyle}>{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Fallback: heuristic grouper on flat technical array
  if (mode === 'grid') return <SkillGrid skills={techSkills} textColor={textColor} />;
  if (mode === 'dot') {
    const { core, tools } = groupSkills(techSkills);
    return (
      <div>
        {core.length > 0 && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: textColor || '#374151', lineHeight: '1.7', margin: '0 0 4px', fontFamily: "'Inter',sans-serif" }}><strong style={{ color: '#111827' }}>Core:</strong> {core.join(' · ')}</p>}
        {tools.length > 0 && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: textColor || '#374151', lineHeight: '1.7', margin: 0, fontFamily: "'Inter',sans-serif" }}><strong style={{ color: '#111827' }}>Tools:</strong> {tools.join(' · ')}</p>}
      </div>
    );
  }
  return <GroupedSkillTags skills={techSkills} tagStyle={tagStyle} labelColor={labelColor} />;
};



/* ══════════════════════════════════════════════════════════════════════════════
   MARKDOWN FALLBACK RENDERER  (MODE B)
   Wraps the converted HTML in a styled <div> whose CSS variables match each
   template's palette. All heading / list / link colours are explicit hex.
══════════════════════════════════════════════════════════════════════════════ */

/** Per-template colour tokens for the markdown body */
const THEME_TOKENS = {
  classic:   { h1: '#1e3a5f', h2: '#1e3a5f', h3: '#111827', body: '#374151', accent: '#1e3a5f', li: '#374151', link: '#1e3a5f',  border: '#1e3a5f', font: "'Georgia','Times New Roman',serif",      sans: "'Inter',sans-serif" },
  modern:    { h1: '#ffffff', h2: '#4f46e5', h3: '#111827', body: '#374151', accent: '#4f46e5', li: '#374151', link: '#4f46e5',  border: '#4f46e5', font: "'Inter','Segoe UI',Arial,sans-serif",    sans: "'Inter',sans-serif" },
  creative:  { h1: '#f8fafc', h2: '#0d9488', h3: '#111827', body: '#374151', accent: '#0d9488', li: '#374151', link: '#0d9488',  border: '#0d9488', font: "'Inter','Segoe UI',Arial,sans-serif",    sans: "'Inter',sans-serif" },
  minimal:   { h1: '#111827', h2: '#111827', h3: '#111827', body: '#374151', accent: '#111827', li: '#374151', link: '#374151',  border: '#374151', font: "'Garamond','Georgia',serif",              sans: "'Inter',sans-serif" },
  technical: { h1: '#f5f5f4', h2: '#c2410c', h3: '#111827', body: '#374151', accent: '#c2410c', li: '#374151', link: '#c2410c',  border: '#c2410c', font: "'Inter','Segoe UI',Arial,sans-serif",    sans: "'Inter',sans-serif" },
};

const MarkdownBody = ({ markdown, template, headerNode }) => {
  const tk = THEME_TOKENS[template] || THEME_TOKENS.classic;
  const html = mdToHtml(markdown);

  /* Scoped CSS injected once — we use a unique class so templates don't clash */
  const cls = `md-cv-${template}`;

  const css = `
    .${cls} { font-family: ${tk.font}; color: ${tk.body}; line-height: 1.65; }
    .${cls} h1 { font-size: 22px; font-weight: 700; color: ${tk.h1}; text-transform: uppercase; letter-spacing: 1.5px; margin: 16px 0 6px; }
    .${cls} h2 { font-size: 13px; font-weight: 800; color: ${tk.h2}; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid ${tk.border}; padding-bottom: 3px; margin: 18px 0 8px; page-break-inside: avoid; break-inside: avoid; }
    .${cls} h3 { font-size: 13px; font-weight: 700; color: ${tk.h3}; margin: 10px 0 4px; page-break-inside: avoid; break-inside: avoid; }
    .${cls} p  { font-size: 12.5px; color: ${tk.body}; margin: 0 0 5px; }
    .${cls} ul { margin: 4px 0 8px 0; padding-left: 18px; page-break-inside: avoid; break-inside: avoid; }
    .${cls} li { font-size: 12.5px; color: ${tk.li}; margin-bottom: 3px; line-height: 1.55; }
    .${cls} a  { color: ${tk.link}; text-decoration: underline; }
    .${cls} strong { font-weight: 700; color: ${tk.h3}; }
    .${cls} em { font-style: italic; color: ${tk.body}; }
    .${cls} code { font-family: monospace; font-size: 11.5px; background: #f3f4f6; padding: 1px 4px; border-radius: 3px; }
    .${cls} hr { border: none; border-top: 1px solid #e5e7eb; margin: 10px 0; }
    .${cls} br { display: block; margin: 3px 0; content: ""; }
  `;

  return (
    <>
      <style>{css}</style>
      {headerNode}
      <div
        className={cls}
        contentEditable
        suppressContentEditableWarning
        style={{ padding: '24px 44px', outline: 'none' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
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
    _rawMarkdown = '',
  } = data;

  const name = `${fullname?.firstname || ''} ${fullname?.lastname || ''}`.trim();

  // Flat legacy list (kept for heuristic groupSkills fallback)
  const techSkills = skills?.technical || [];

  // Typed skill groups from the new AI JSON schema
  const typedGroups = [
    { label: 'Languages',        items: skills?.languages || [] },
    { label: 'Frontend',         items: skills?.frontend  || [] },
    { label: 'Backend',          items: skills?.backend   || [] },
    { label: 'Tools & Platforms',items: skills?.tools     || [] },
    { label: 'Soft Skills',      items: skills?.soft      || [] },
  ].filter(g => g.items.length > 0);

  // If typed groups are empty fall back to heuristic split of the flat list
  const hasTypedGroups = typedGroups.length > 0;

  // Resolve email: DB profile sub-object first, then top-level auth email
  const email    = profile?.email    || data?.email || '';
  const phone    = profile?.phone    || '';
  const linkedIn = profile?.linkedIn || '';
  const github   = profile?.github   || '';
  // Summary: AI sets profile.summary; objective is an alias used in new schema
  const summary  = profile?.summary  || data?.objective || '';

  // ── Decide render mode ────────────────────────────────────────────────
  const useStructured = hasStructuredContent(data);
  // Fall back to markdown if structured data is sparse and raw string exists
  const useMarkdown = !useStructured && !!_rawMarkdown.trim();

  /* ════════════════════════════════════════════════════════════════════════
     MARKDOWN FALLBACK HEADERS (reusable across all 5 templates in Mode B)
  ════════════════════════════════════════════════════════════════════════ */

  const ClassicMdHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: '4px', borderBottom: '3px double #1e3a5f', paddingBottom: '16px', padding: '44px 48px 16px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a5f', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px 0', fontFamily: "'Georgia',serif" }}>{name}</h1>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px', fontSize: '12px', color: '#4b5563', fontFamily: "'Inter',sans-serif" }}>
        {email    && <span>{email}</span>}
        {phone    && <span>{phone}</span>}
        {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f', textDecoration: 'underline' }}>{stripProto(linkedIn)}</a>}
        {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f', textDecoration: 'underline' }}>{stripProto(github)}</a>}
      </div>
    </div>
  );

  const ModernMdHeader = () => (
    <div style={{ background: 'linear-gradient(135deg,#312e81 0%,#4f46e5 60%,#818cf8 100%)', padding: '32px 44px 28px', color: '#fff' }}>
      <h1 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{name}</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12.5px', opacity: 0.92 }}>
        {email    && <span>✉ {email}</span>}
        {phone    && <span>📱 {phone}</span>}
        {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: '#c7d2fe', textDecoration: 'underline' }}>🔗 {stripProto(linkedIn)}</a>}
        {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: '#c7d2fe', textDecoration: 'underline' }}>💻 {stripProto(github)}</a>}
      </div>
    </div>
  );

  const CreativeMdSidebar = () => (
    <div style={{ width: '240px', backgroundColor: '#0f172a', color: '#e2e8f0', padding: '36px 22px', flexShrink: 0 }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', lineHeight: '1.2', margin: '0 0 8px 0' }}>{name}</h1>
      <div style={{ width: '32px', height: '3px', backgroundColor: '#0d9488', borderRadius: '2px', marginBottom: '24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#94a3b8' }}>
        {email    && <span>{email}</span>}
        {phone    && <span>{phone}</span>}
        {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'underline', wordBreak: 'break-all' }}>{stripProto(linkedIn)}</a>}
        {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'underline', wordBreak: 'break-all' }}>{stripProto(github)}</a>}
      </div>
    </div>
  );

  const MinimalMdHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: '4px', borderBottom: '1.5px solid #374151', paddingBottom: '18px', padding: '52px 56px 18px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: '400', color: '#111827', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 10px 0', fontFamily: "'Garamond',Georgia,serif" }}>{name}</h1>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif" }}>
        {email    && <span>{email}</span>}
        {phone    && <span>{phone}</span>}
        {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: '#374151', textDecoration: 'underline' }}>{stripProto(linkedIn)}</a>}
        {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: '#374151', textDecoration: 'underline' }}>{stripProto(github)}</a>}
      </div>
    </div>
  );

  const TechnicalMdHeader = () => (
    <div style={{ backgroundColor: '#1c1917', color: '#fff', padding: '28px 40px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px 0', color: '#f5f5f4' }}>{name}</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12px', color: '#a8a29e' }}>
        {email    && <span>✉ {email}</span>}
        {phone    && <span>📱 {phone}</span>}
        {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline' }}>🔗 {stripProto(linkedIn)}</a>}
        {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline' }}>💻 {stripProto(github)}</a>}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     MARKDOWN MODE RENDERS (MODE B)
  ════════════════════════════════════════════════════════════════════════ */

  if (useMarkdown) {
    if (template === 'classic') {
      return (
        <div style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}>
          <MarkdownBody markdown={_rawMarkdown} template="classic" headerNode={<ClassicMdHeader />} />
        </div>
      );
    }
    if (template === 'modern') {
      return (
        <div style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}>
          <MarkdownBody markdown={_rawMarkdown} template="modern" headerNode={<ModernMdHeader />} />
        </div>
      );
    }
    if (template === 'creative') {
      return (
        <div style={{ width: '794px', minHeight: '1123px', display: 'flex', boxSizing: 'border-box', outline: 'none' }}>
          <CreativeMdSidebar />
          <div style={{ flex: 1, backgroundColor: '#fff' }}>
            <MarkdownBody markdown={_rawMarkdown} template="creative" headerNode={null} />
          </div>
        </div>
      );
    }
    if (template === 'minimal') {
      return (
        <div style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}>
          <MarkdownBody markdown={_rawMarkdown} template="minimal" headerNode={<MinimalMdHeader />} />
        </div>
      );
    }
    // technical (default)
    return (
      <div style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}>
        <TechnicalMdHeader />
        <MarkdownBody markdown={_rawMarkdown} template="technical" headerNode={null} />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     STRUCTURED MODE (MODE A) — premium component-based templates
  ════════════════════════════════════════════════════════════════════════ */

  /* ── 1. CLASSIC PROFESSIONAL ── */
  if (template === 'classic') {
    const accent = '#1e3a5f';
    const rule   = { borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '10px', margin: 0 };
    const block  = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' };
    const SH     = ({ children }) => (
      <h2 style={{ ...rule, fontSize: '12px', fontWeight: '700', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{children}</h2>
    );
    const linkS  = { color: accent, textDecoration: 'underline', textDecorationColor: '#93c5fd', fontSize: '12px' };

    return (
      <div contentEditable suppressContentEditableWarning
        style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Georgia','Times New Roman',serif", color: '#1a1a2e', padding: '44px 48px', boxSizing: 'border-box', outline: 'none' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: `3px double ${accent}`, paddingBottom: '16px' }}>
          <h1 contentEditable suppressContentEditableWarning style={{ fontSize: '28px', fontWeight: '700', color: accent, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>{name}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px', fontSize: '12px', color: '#4b5563' }}>
            {email    && <span contentEditable suppressContentEditableWarning>{email}</span>}
            {phone    && <span contentEditable suppressContentEditableWarning>{phone}</span>}
            {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={linkS}>{stripProto(linkedIn)}</a>}
            {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={linkS}>{stripProto(github)}</a>}
          </div>
        </div>

        {/* Summary */}
        {summary && <div style={block}><SH>Professional Summary</SH><p contentEditable suppressContentEditableWarning style={{ fontSize: '13px', color: '#374151', lineHeight: '1.65', textAlign: 'justify', margin: '8px 0 0' }}>{summary}</p></div>}

        {/* Skills */}
        {(hasTypedGroups || techSkills.length > 0) && <div style={block}><SH>Skills</SH><div style={{ marginTop: '8px' }}><TypedSkillsBlock typedGroups={typedGroups} techSkills={techSkills} textColor="#374151" mode="grid" /></div></div>}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ ...block }}>
            <SH>Professional Experience</SH>
            {experience.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0 }}>{exp.position}</h3>
                  <span contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                  </span>
                </div>
                <div contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#4b5563', fontStyle: 'italic', marginBottom: '4px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ ...block }}>
            <SH>Key Projects</SH>
            {projects.map((proj, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px' }}>{proj.title || proj.name}</h3>
                  {proj.technologies && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{proj.technologies}</span>}
                </div>
                {proj.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{proj.description}</p>}
                {(proj.projectUrl || proj.githubUrl) && (
                  <div style={{ marginTop: '2px', fontSize: '11px', display: 'flex', gap: '12px' }}>
                    {proj.projectUrl && <a href={ensureHttps(proj.projectUrl)} target="_blank" rel="noopener noreferrer" style={linkS}>Live Demo</a>}
                    {proj.githubUrl  && <a href={ensureHttps(proj.githubUrl)}  target="_blank" rel="noopener noreferrer" style={linkS}>GitHub</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div style={{ ...block }}>
            <SH>Certifications &amp; Achievements</SH>
            {certifications.map((cert, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{cert.name}</h3>
                  {cert.issueDate && <span contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{cert.issueDate}</span>}
                </div>
                {cert.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>{cert.issuer}</div>}
                {cert.credentialUrl && <a href={ensureHttps(cert.credentialUrl)} target="_blank" rel="noopener noreferrer" style={{ ...linkS, fontSize: '11px' }}>View Credential</a>}
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div style={{ ...block }}>
            <SH>Awards &amp; Honours</SH>
            {awards.map((award, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{award.title}</h3>
                  {award.date && <span contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{award.date}</span>}
                </div>
                {award.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>{award.issuer}</div>}
                {award.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#374151', lineHeight: '1.55', margin: '2px 0 0' }}>{award.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={block}>
            <SH>Education</SH>
            {education.map((edu, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', marginTop: i === 0 ? '8px' : 0 }}>
                <div>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
                </div>
                <span contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.endDate || edu.year || edu.startDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── 2. MODERN TECH ── */
  if (template === 'modern') {
    const accent = '#4f46e5', accentLight = '#e0e7ff';
    const block  = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' };
    const SH     = ({ children }) => (
      <h2 style={{ fontSize: '11px', fontWeight: '800', color: accent, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: `2px solid ${accent}`, paddingBottom: '5px', marginBottom: '12px', margin: 0 }}>{children}</h2>
    );
    const tagS   = { display: 'inline-block', backgroundColor: accentLight, color: accent, borderRadius: '4px', padding: '2px 9px', fontSize: '11.5px', fontWeight: '600', border: '1px solid #c7d2fe' };
    const linkS  = { color: '#c7d2fe', textDecoration: 'underline', fontSize: '12.5px' };

    return (
      <div contentEditable suppressContentEditableWarning style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: '#1f2937', boxSizing: 'border-box', outline: 'none' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#312e81 0%,#4f46e5 60%,#818cf8 100%)', padding: '32px 44px 28px', color: '#fff' }}>
          <h1 contentEditable suppressContentEditableWarning style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.5px' }}>{name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12.5px', opacity: 0.92 }}>
            {email    && <span contentEditable suppressContentEditableWarning>✉ {email}</span>}
            {phone    && <span contentEditable suppressContentEditableWarning>📱 {phone}</span>}
            {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={linkS}>🔗 {stripProto(linkedIn)}</a>}
            {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={linkS}>💻 {stripProto(github)}</a>}
          </div>
        </div>

        <div style={{ padding: '28px 44px' }}>
          {summary && <div style={{ ...block, marginTop: 0 }}><SH>Professional Summary</SH><p contentEditable suppressContentEditableWarning style={{ fontSize: '13px', color: '#374151', lineHeight: '1.65', margin: '10px 0 0' }}>{summary}</p></div>}

          {(hasTypedGroups || techSkills.length > 0) && <div style={block}><SH>Core Competencies</SH><div style={{ marginTop: '10px' }}><TypedSkillsBlock typedGroups={typedGroups} techSkills={techSkills} tagStyle={tagS} labelColor="#6366f1" mode="tags" /></div></div>}

          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}><SH>Work Experience</SH>
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: i === 0 ? '10px' : 0, marginBottom: '14px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>{exp.position}</h3>
                    <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '600', backgroundColor: accentLight, padding: '1px 8px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                    </span>
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div style={{ marginBottom: '18px' }}><SH>Featured Projects</SH>
              {projects.map((proj, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: i === 0 ? '10px' : 0, marginBottom: '12px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px' }}>{proj.title || proj.name}</h3>
                    {proj.technologies && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{proj.technologies}</span>}
                  </div>
                  {proj.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{proj.description}</p>}
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div style={{ marginBottom: '18px' }}><SH>Certifications &amp; Achievements</SH>
              {certifications.map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: i === 0 ? '10px' : 0, marginBottom: '10px', paddingLeft: '14px', borderLeft: `3px solid ${accentLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{cert.name}</h3>
                    {cert.issueDate && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '600', backgroundColor: accentLight, padding: '1px 8px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px' }}>{cert.issueDate}</span>}
                  </div>
                  {cert.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{cert.issuer}</div>}
                  {cert.credentialUrl && <a href={ensureHttps(cert.credentialUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: accent, textDecoration: 'underline' }}>View Credential</a>}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div style={block}><SH>Education</SH>
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: i === 0 ? '10px' : 0, marginBottom: '8px' }}>
                  <div>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
                    <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280' }}>{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
                  </div>
                  <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.endDate || edu.year || edu.startDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── 3. CREATIVE PORTFOLIO ── */
  if (template === 'creative') {
    const accent    = '#0d9488';
    const sidebarBg = '#0f172a';
    const chipS     = { display: 'inline-block', backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderLeft: `3px solid ${accent}`, borderRadius: '3px', padding: '2px 7px', fontSize: '11px' };
    const SidebarSH = ({ title }) => (
      <h2 style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: accent, borderBottom: '1px solid #1e293b', paddingBottom: '5px', marginBottom: '10px', margin: 0 }}>{title}</h2>
    );
    const MainSH    = ({ children }) => (
      <h2 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '12px', margin: 0 }}>{children}</h2>
    );

    return (
      <div contentEditable suppressContentEditableWarning style={{ width: '794px', minHeight: '1123px', display: 'flex', fontFamily: "'Inter','Segoe UI',Arial,sans-serif", boxSizing: 'border-box', outline: 'none' }}>
        {/* Sidebar */}
        <div style={{ width: '240px', backgroundColor: sidebarBg, color: '#e2e8f0', padding: '36px 22px', flexShrink: 0 }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 contentEditable suppressContentEditableWarning style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', lineHeight: '1.2', margin: '0 0 8px' }}>{name}</h1>
            <div style={{ width: '32px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
          </div>
          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
            <SidebarSH title="Contact" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#94a3b8' }}>
              {email    && <span contentEditable suppressContentEditableWarning>{email}</span>}
              {phone    && <span contentEditable suppressContentEditableWarning>{phone}</span>}
              {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline', wordBreak: 'break-all' }}>{stripProto(linkedIn)}</a>}
              {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline', wordBreak: 'break-all' }}>{stripProto(github)}</a>}
            </div>
          </div>
          {(hasTypedGroups || techSkills.length > 0) && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
              <SidebarSH title="Technical Skills" />
              <TypedSkillsBlock typedGroups={typedGroups} techSkills={techSkills} tagStyle={chipS} labelColor="#64748b" mode="tags" />
            </div>
          )}
          {education.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
              <SidebarSH title="Education" />
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                  <div contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '12px', color: '#f1f5f9' }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#94a3b8' }}>{edu.institution}</div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent }}>{edu.endDate || edu.year || edu.startDate}</div>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '22px' }}>
              <SidebarSH title="Certifications" />
              {certifications.map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px' }}>
                  <div contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '11.5px', color: '#f1f5f9' }}>{cert.name}</div>
                  {cert.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: '#94a3b8' }}>{cert.issuer}</div>}
                  {cert.issueDate && <div contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: accent }}>{cert.issueDate}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '36px 32px', overflowWrap: 'break-word' }}>
          {summary && (
            <div style={{ marginBottom: '18px' }}><MainSH>Profile</MainSH>
              <p contentEditable suppressContentEditableWarning style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: '10px 0 0' }}>{summary}</p>
            </div>
          )}
          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}><MainSH>Work Experience</MainSH>
              {experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px', marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>{exp.position}</h3>
                    <span contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                    </span>
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div style={{ marginBottom: '18px' }}><MainSH>Notable Projects</MainSH>
              {projects.map((proj, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px', marginTop: i === 0 ? '10px' : 0, borderLeft: `3px solid ${accent}`, paddingLeft: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px' }}>{proj.title || proj.name}</h3>
                    {proj.technologies && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{proj.technologies}</span>}
                  </div>
                  {proj.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{proj.description}</p>}
                </div>
              ))}
            </div>
          )}
          {awards.length > 0 && (
            <div style={{ marginBottom: '18px' }}><MainSH>Awards &amp; Recognition</MainSH>
              {awards.map((award, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{award.title}</h3>
                    {award.date && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>{award.date}</span>}
                  </div>
                  {award.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>{award.issuer}</div>}
                  {award.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{award.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── 4. MINIMAL EXECUTIVE ── */
  if (template === 'minimal') {
    const block  = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' };
    const rule   = { borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '10px', margin: 0 };
    const SH     = ({ children }) => <h2 style={{ ...rule, fontSize: '10.5px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '2.5px' }}>{children}</h2>;
    const linkS  = { color: '#374151', textDecoration: 'underline', fontSize: '11.5px', fontFamily: "'Inter',sans-serif" };

    return (
      <div contentEditable suppressContentEditableWarning style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Garamond','Georgia','Times New Roman',serif", color: '#1a1a1a', padding: '52px 56px', boxSizing: 'border-box', outline: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1.5px solid #374151', paddingBottom: '18px' }}>
          <h1 contentEditable suppressContentEditableWarning style={{ fontSize: '30px', fontWeight: '400', color: '#111827', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 10px' }}>{name}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif" }}>
            {email    && <span contentEditable suppressContentEditableWarning>{email}</span>}
            {phone    && <span contentEditable suppressContentEditableWarning>{phone}</span>}
            {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={linkS}>{stripProto(linkedIn)}</a>}
            {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={linkS}>{stripProto(github)}</a>}
          </div>
        </div>

        {summary && <div style={block}><SH>Profile</SH><p contentEditable suppressContentEditableWarning style={{ fontSize: '13px', color: '#374151', lineHeight: '1.75', textAlign: 'justify', margin: '8px 0 0' }}>{summary}</p></div>}

        {experience.length > 0 && (
          <div style={{ marginBottom: '20px' }}><SH>Experience</SH>
            {experience.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '14px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                    {exp.position}{exp.company && <span style={{ fontWeight: '400', fontStyle: 'italic', color: '#374151' }}> — {exp.company}</span>}
                  </h3>
                  <span contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {exp.startDate || exp.duration}{exp.endDate ? ` to ${exp.endDate}` : exp.isCurrentJob ? ' to Present' : ''}
                  </span>
                </div>
                {exp.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: '4px 0 0', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div style={{ marginBottom: '20px' }}><SH>Education</SH>
            {education.map((edu, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', marginTop: i === 0 ? '8px' : 0 }}>
                <div>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0, fontFamily: "'Inter',sans-serif" }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>{edu.institution}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</div>
                </div>
                <span contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.endDate || edu.year || edu.startDate}</span>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: '20px' }}><SH>Selected Projects</SH>
            {projects.map((proj, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px', fontFamily: "'Inter',sans-serif" }}>{proj.title || proj.name}</h3>
                  {proj.technologies && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px', fontFamily: "'Inter',sans-serif" }}>{proj.technologies}</span>}
                </div>
                {proj.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', margin: 0, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: '20px' }}><SH>Certifications</SH>
            {certifications.map((cert, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '6px', marginTop: i === 0 ? '8px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0, fontFamily: "'Inter',sans-serif" }}>{cert.name}</h3>
                  {cert.issueDate && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', marginLeft: '8px' }}>{cert.issueDate}</span>}
                </div>
                {cert.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {(hasTypedGroups || techSkills.length > 0) && (
          <div style={block}><SH>Skills</SH>
            <div style={{ marginTop: '8px' }}>
              <TypedSkillsBlock typedGroups={typedGroups} techSkills={techSkills} textColor="#374151" mode="dot" />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── 5. TECHNICAL EXPERT (default) ── */
  const accent      = '#c2410c';
  const accentLight = '#fff7ed';
  const headerBg    = '#1c1917';

  const MainSH    = ({ children }) => <h2 style={{ fontSize: '11px', fontWeight: '800', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '12px', margin: 0 }}>{children}</h2>;
  const SidebarSH = ({ children }) => <h2 style={{ fontSize: '10px', fontWeight: '800', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #fed7aa', paddingBottom: '4px', marginBottom: '10px', margin: 0 }}>{children}</h2>;

  const dotBullet = { position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', backgroundColor: accent, borderRadius: '50%' };
  const timelineItem = { pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '14px', paddingLeft: '12px', borderLeft: '3px solid #fed7aa', position: 'relative' };

  return (
    <div contentEditable suppressContentEditableWarning style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: '#1f2937', boxSizing: 'border-box', outline: 'none' }}>
      {/* Header */}
      <div style={{ backgroundColor: headerBg, color: '#fff', padding: '28px 40px' }}>
        <h1 contentEditable suppressContentEditableWarning style={{ fontSize: '26px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px', color: '#f5f5f4' }}>{name}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '12px', color: '#a8a29e' }}>
          {email    && <span contentEditable suppressContentEditableWarning>✉ {email}</span>}
          {phone    && <span contentEditable suppressContentEditableWarning>📱 {phone}</span>}
          {linkedIn && <a href={ensureHttps(linkedIn)} target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline' }}>🔗 {stripProto(linkedIn)}</a>}
          {github   && <a href={ensureHttps(github)}   target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline' }}>💻 {stripProto(github)}</a>}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Main Column */}
        <div style={{ flex: '1 1 62%', padding: '24px 28px 24px 40px', borderRight: '1px solid #e7e5e4' }}>
          {summary && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
              <MainSH>Professional Profile</MainSH>
              <p contentEditable suppressContentEditableWarning style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', margin: '10px 0 0', textAlign: 'justify' }}>{summary}</p>
            </div>
          )}
          {experience.length > 0 && (
            <div style={{ marginBottom: '18px' }}><MainSH>Work Experience</MainSH>
              {experience.map((exp, i) => (
                <div key={i} style={{ ...timelineItem, marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={dotBullet} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13.5px', color: '#111827', margin: 0 }}>{exp.position}</h3>
                    <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate || exp.duration}{exp.endDate ? ` – ${exp.endDate}` : exp.isCurrentJob ? ' – Present' : ''}
                    </span>
                  </div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div style={{ marginBottom: '18px' }}><MainSH>Technical Projects</MainSH>
              {projects.map((proj, i) => (
                <div key={i} style={{ ...timelineItem, marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={dotBullet} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px' }}>{proj.title || proj.name}</h3>
                    {proj.technologies && <span contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: '#6b7280', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{proj.technologies}</span>}
                  </div>
                  {proj.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#374151', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{proj.description}</p>}
                  {(proj.projectUrl || proj.githubUrl) && (
                    <div style={{ marginTop: '3px', display: 'flex', gap: '12px', fontSize: '11px' }}>
                      {proj.projectUrl && <a href={ensureHttps(proj.projectUrl)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>Live Demo</a>}
                      {proj.githubUrl  && <a href={ensureHttps(proj.githubUrl)}  target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>GitHub</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {awards.length > 0 && (
            <div style={{ marginBottom: '18px' }}><MainSH>Awards &amp; Achievements</MainSH>
              {awards.map((award, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>{award.title}</h3>
                    {award.date && <span contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>{award.date}</span>}
                  </div>
                  {award.issuer && <div contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{award.issuer}</div>}
                  {award.description && <p contentEditable suppressContentEditableWarning style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', margin: '2px 0 0' }}>{award.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: '0 0 38%', padding: '24px 32px 24px 24px', backgroundColor: accentLight }}>
          {(hasTypedGroups || techSkills.length > 0) && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSH>Technical Skills</SidebarSH>
              <div style={{ marginTop: '8px' }}>
                <TypedSkillsBlock 
                  typedGroups={typedGroups} 
                  techSkills={techSkills} 
                  tagStyle={{ fontSize: '10.5px', color: '#292524', backgroundColor: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '3px', padding: '2px 6px', fontWeight: '500' }} 
                  labelColor="#78716c" 
                  mode="tags" 
                />
              </div>
            </div>
          )}
          {education.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSH>Education</SidebarSH>
              {education.map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '12.5px', color: '#111827', margin: '0 0 2px', lineHeight: '1.3' }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h3>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11.5px', color: '#57534e' }}>{edu.institution}</div>
                  <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: accent, fontWeight: '700' }}>{edu.endDate || edu.year || edu.startDate}</div>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
              <SidebarSH>Certifications</SidebarSH>
              {certifications.map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px', marginTop: i === 0 ? '8px' : 0 }}>
                  <h3 contentEditable suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '12px', color: '#111827', margin: '0 0 1px', lineHeight: '1.3' }}>{cert.name}</h3>
                  {cert.issuer    && <div contentEditable suppressContentEditableWarning style={{ fontSize: '11px', color: '#57534e' }}>{cert.issuer}</div>}
                  {cert.issueDate && <div contentEditable suppressContentEditableWarning style={{ fontSize: '10.5px', color: accent, fontWeight: '700' }}>{cert.issueDate}</div>}
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
