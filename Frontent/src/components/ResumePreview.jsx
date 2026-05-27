import React from 'react';

const ResumePreview = ({ data, template = 'classic' }) => {
  if (!data) return null;

  const {
    fullname = { firstname: '', lastname: '' },
    profile = {},
    experience = [],
    education = [],
    projects = [],
    skills = {}
  } = data;

  const name = `${fullname?.firstname || ''} ${fullname?.lastname || ''}`.trim();

  // Helper to render contact info safely
  const renderContact = () => {
    return (
      <div className="flex flex-wrap gap-4 text-[13px] opacity-90 mt-2">
        {profile?.email && <div><span>✉️</span> {profile.email}</div>}
        {profile?.phone && <div><span>📱</span> {profile.phone}</div>}
        {profile?.linkedIn && <div><span>🔗</span> {profile.linkedIn.replace('https://', '')}</div>}
        {profile?.github && <div><span>💻</span> {profile.github.replace('https://', '')}</div>}
      </div>
    );
  };

  // 1. Classic Professional
  if (template === 'classic') {
    return (
      <div contentEditable={true} suppressContentEditableWarning={true} className="bg-[#ffffff] w-full text-[#1a1a1a] font-sans shadow-lg mx-auto outline-none" style={{ width: '800px', minHeight: '1131px', padding: '40px' }}>
        <div className="text-center mb-6 border-b-2 border-[#2c3e50] pb-4">
          <h1 className="text-[28px] font-bold text-[#2c3e50] uppercase tracking-wider mb-2">{name}</h1>
          <div className="flex justify-center gap-4 text-[13px] text-[#555555]">
            {profile?.email && <span>{profile.email}</span>}
            {profile?.phone && <span>{profile.phone}</span>}
            {profile?.linkedIn && <span>{profile.linkedIn.replace('https://', '')}</span>}
          </div>
        </div>

        {profile?.summary && (
          <div className="mb-5">
            <h2 className="text-[16px] font-bold text-[#2c3e50] uppercase tracking-wide border-b-[1.5px] border-[#34495e] pb-1 mb-2">Professional Summary</h2>
            <p className="text-[#333333] text-[13px] leading-relaxed text-justify">{profile.summary}</p>
          </div>
        )}

        {skills?.technical && skills.technical.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[16px] font-bold text-[#2c3e50] uppercase tracking-wide border-b-[1.5px] border-[#34495e] pb-1 mb-2">Technical Skills</h2>
            <ul className="list-disc pl-5 text-[13px] text-[#333333] columns-2">
              {skills.technical.map((s, i) => <li key={i} className="mb-1">{s}</li>)}
            </ul>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[16px] font-bold text-[#2c3e50] uppercase tracking-wide border-b-[1.5px] border-[#34495e] pb-1 mb-3">Professional Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[#2c3e50] text-[14px]">{exp.position}</h3>
                    <span className="text-[13px] font-semibold text-[#555555]">
                      {exp.startDate || exp.duration} {exp.endDate ? `- ${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div className="text-[13px] font-medium text-[#444444] mb-2 italic">
                    {exp.company} {exp.location ? `| ${exp.location}` : ''}
                  </div>
                  {exp.description && <p className="text-[13px] text-[#333333] leading-relaxed text-justify whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[16px] font-bold text-[#2c3e50] uppercase tracking-wide border-b-[1.5px] border-[#34495e] pb-1 mb-3">Projects</h2>
            <div className="space-y-4">
              {projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="font-bold text-[#2c3e50] text-[14px]">{proj.name || proj.title}</h3>
                  {proj.description && <p className="text-[13px] text-[#333333] leading-relaxed text-justify mt-1 whitespace-pre-wrap">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[16px] font-bold text-[#2c3e50] uppercase tracking-wide border-b-[1.5px] border-[#34495e] pb-1 mb-3">Education</h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-[#2c3e50] text-[14px]">{edu.degree}</h3>
                    <div className="text-[13px] text-[#444444]">{edu.institution}</div>
                  </div>
                  <span className="text-[13px] font-semibold text-[#555555]">{edu.year || edu.endDate || edu.startDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Modern Tech
  if (template === 'modern') {
    return (
      <div contentEditable={true} suppressContentEditableWarning={true} className="bg-[#ffffff] w-full text-[#2d3748] font-sans shadow-lg mx-auto outline-none" style={{ width: '800px', minHeight: '1131px', padding: '0px' }}>
        <div className="text-[#ffffff] px-[40px] py-[30px] mb-[20px]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h1 className="text-[32px] font-bold mb-2">{name}</h1>
          {renderContact()}
        </div>

        <div className="px-[40px] py-[10px]">
          {profile?.summary && (
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-[#667eea] mb-2 border-b-2 border-[#667eea] pb-1">Professional Summary</h2>
              <p className="text-[13px] text-[#4a5568] leading-relaxed">{profile.summary}</p>
            </div>
          )}

          {skills?.technical && skills.technical.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-[#667eea] mb-2 border-b-2 border-[#667eea] pb-1">Core Competencies</h2>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map((s, i) => (
                  <span key={i} className="bg-[#edf2f7] text-[#4a5568] px-3 py-1 rounded-full text-[12px] font-medium border border-[#e2e8f0]">{s}</span>
                ))}
              </div>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-[#667eea] mb-3 border-b-2 border-[#667eea] pb-1">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[#2d3748] text-[15px]">{exp.position}</h3>
                      <span className="text-[13px] font-semibold text-[#718096] bg-[#edf2f7] px-2 py-0.5 rounded">
                        {exp.startDate || exp.duration} {exp.endDate ? `- ${exp.endDate}` : ''}
                      </span>
                    </div>
                    <div className="text-[13px] font-medium text-[#4a5568] mb-2">{exp.company}</div>
                    {exp.description && <p className="text-[13px] text-[#4a5568] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-[#667eea] mb-3 border-b-2 border-[#667eea] pb-1">Key Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[#2d3748] text-[14px]">{proj.name || proj.title}</h3>
                    {proj.description && <p className="text-[13px] text-[#4a5568] leading-relaxed mt-1 whitespace-pre-wrap">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-[#667eea] mb-3 border-b-2 border-[#667eea] pb-1">Education</h2>
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <div>
                      <h3 className="font-bold text-[#2d3748] text-[14px]">{edu.degree}</h3>
                      <div className="text-[13px] text-[#4a5568]">{edu.institution}</div>
                    </div>
                    <span className="text-[13px] font-semibold text-[#718096]">{edu.year || edu.endDate || edu.startDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Creative Portfolio
  if (template === 'creative') {
    return (
      <div contentEditable={true} suppressContentEditableWarning={true} className="bg-[#ffffff] w-full text-[#2c2c2c] font-sans shadow-lg mx-auto outline-none" style={{ width: '800px', minHeight: '1131px', padding: '0px' }}>
        <div className="text-[#ffffff] px-[40px] py-[35px] mb-[25px] rounded-b-[20px]" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <h1 className="text-[36px] font-bold mb-2 drop-shadow-sm">{name}</h1>
          {renderContact()}
        </div>

        <div className="px-[40px]">
          {profile?.summary && (
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-[#f5576c] mb-2 border-b-2 border-[#f093fb] pb-1 inline-block w-full">About Me</h2>
              <p className="text-[13px] text-[#444444] leading-relaxed">{profile.summary}</p>
            </div>
          )}

          {skills?.technical && skills.technical.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-[#f5576c] mb-3 border-b-2 border-[#f093fb] pb-1 inline-block w-full">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map((s, i) => (
                  <span key={i} className="bg-[#fff0f2] text-[#f5576c] px-3 py-1 rounded-md text-[12px] font-bold border border-[#fca5a5]">{s}</span>
                ))}
              </div>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-[#f5576c] mb-4 border-b-2 border-[#f093fb] pb-1 inline-block w-full">Experience</h2>
              <div className="space-y-5">
                {experience.map((exp, i) => (
                  <div key={i} className="border-l-4 border-[#f093fb] pl-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[#2c2c2c] text-[15px]">{exp.position}</h3>
                      <span className="text-[12px] font-bold text-[#f5576c]">
                        {exp.startDate || exp.duration} {exp.endDate ? `- ${exp.endDate}` : ''}
                      </span>
                    </div>
                    <div className="text-[13px] font-medium text-[#666666] mb-2">{exp.company}</div>
                    {exp.description && <p className="text-[13px] text-[#444444] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-[#f5576c] mb-4 border-b-2 border-[#f093fb] pb-1 inline-block w-full">Notable Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, i) => (
                  <div key={i} className="border-l-4 border-[#f5576c] pl-4">
                    <h3 className="font-bold text-[#2c2c2c] text-[14px]">{proj.name || proj.title}</h3>
                    {proj.description && <p className="text-[13px] text-[#444444] leading-relaxed mt-1 whitespace-pre-wrap">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-[#f5576c] mb-3 border-b-2 border-[#f093fb] pb-1 inline-block w-full">Education</h2>
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-baseline pl-4">
                    <div>
                      <h3 className="font-bold text-[#2c2c2c] text-[14px]">{edu.degree}</h3>
                      <div className="text-[13px] text-[#666666]">{edu.institution}</div>
                    </div>
                    <span className="text-[12px] font-bold text-[#f5576c]">{edu.year || edu.endDate || edu.startDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Minimal Executive
  if (template === 'minimal') {
    return (
      <div contentEditable={true} suppressContentEditableWarning={true} className="bg-[#ffffff] w-full text-[#2c2c2c] font-serif shadow-lg mx-auto outline-none" style={{ width: '800px', minHeight: '1131px', padding: '50px' }}>
        <div className="text-center mb-8 pb-6 border-b border-[#cccccc]">
          <h1 className="text-[32px] font-normal text-[#1a1a1a] mb-3">{name}</h1>
          <div className="flex justify-center gap-4 text-[12px] text-[#666666] font-sans">
            {profile?.email && <span>{profile.email}</span>}
            {profile?.phone && <span>{profile.phone}</span>}
            {profile?.linkedIn && <span>{profile.linkedIn.replace('https://', '')}</span>}
          </div>
        </div>

        {profile?.summary && (
          <div className="mb-6">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-[2px] mb-3">Profile</h2>
            <p className="text-[13px] text-[#444444] leading-[1.7] text-justify">{profile.summary}</p>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-[2px] mb-4">Experience</h2>
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[#1a1a1a] text-[14px]">{exp.position} — <span className="font-normal italic">{exp.company}</span></h3>
                    <span className="text-[12px] text-[#666666] font-sans">
                      {exp.startDate || exp.duration} {exp.endDate ? `to ${exp.endDate}` : ''}
                    </span>
                  </div>
                  {exp.description && <p className="text-[13px] text-[#444444] leading-[1.7] text-justify mt-2 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-[2px] mb-4">Education</h2>
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[#1a1a1a] text-[14px]">{edu.degree}</h3>
                    <span className="text-[12px] text-[#666666] font-sans">{edu.year || edu.endDate || edu.startDate}</span>
                  </div>
                  <div className="text-[13px] text-[#444444] italic">{edu.institution}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills?.technical && skills.technical.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-[2px] mb-3">Skills</h2>
            <p className="text-[13px] text-[#444444] leading-[1.7]">
              {skills.technical.join(' • ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 5. Technical Expert
  return (
    <div contentEditable={true} suppressContentEditableWarning={true} className="bg-[#ffffff] w-full text-[#1f2937] font-sans shadow-lg mx-auto outline-none" style={{ width: '800px', minHeight: '1131px', padding: '0px' }}>
      <div className="bg-[#ea580c] text-[#ffffff] px-[40px] py-[25px] border-b-4 border-[#c2410c]">
        <h1 className="text-[28px] font-bold uppercase tracking-wider mb-2">{name}</h1>
        {renderContact()}
      </div>

      <div className="px-[40px] py-[20px] flex gap-[30px]">
        {/* Left Column */}
        <div className="w-[65%]">
          {profile?.summary && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-[#ea580c] uppercase tracking-wide border-b-2 border-[#ea580c] mb-3 inline-block">Professional Profile</h2>
              <p className="text-[13px] text-[#374151] leading-relaxed text-justify">{profile.summary}</p>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-[#ea580c] uppercase tracking-wide border-b-2 border-[#ea580c] mb-4 inline-block">Work Experience</h2>
              <div className="space-y-5">
                {experience.map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-[#fdba74]">
                    <div className="absolute w-2 h-2 bg-[#ea580c] rounded-full -left-[5px] top-1.5"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[#111827] text-[14px]">{exp.position}</h3>
                      <span className="text-[12px] font-bold text-[#ea580c]">
                        {exp.startDate || exp.duration} {exp.endDate ? `- ${exp.endDate}` : ''}
                      </span>
                    </div>
                    <div className="text-[13px] font-medium text-[#4b5563] mb-2">{exp.company}</div>
                    {exp.description && <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-[#ea580c] uppercase tracking-wide border-b-2 border-[#ea580c] mb-4 inline-block">Technical Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-[#fdba74]">
                    <div className="absolute w-2 h-2 bg-[#ea580c] rounded-full -left-[5px] top-1.5"></div>
                    <h3 className="font-bold text-[#111827] text-[14px]">{proj.name || proj.title}</h3>
                    {proj.description && <p className="text-[13px] text-[#374151] leading-relaxed mt-1 whitespace-pre-wrap">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-[35%]">
          {skills?.technical && skills.technical.length > 0 && (
            <div className="mb-6 bg-[#fff7ed] p-4 rounded-lg border border-[#fed7aa]">
              <h2 className="text-[14px] font-bold text-[#ea580c] uppercase tracking-wide border-b border-[#ea580c] pb-1 mb-3">Technical Skills</h2>
              <ul className="list-square pl-4 text-[13px] text-[#374151] space-y-1">
                {skills.technical.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {education && education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[14px] font-bold text-[#ea580c] uppercase tracking-wide border-b-2 border-[#ea580c] mb-3 inline-block">Education</h2>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[#111827] text-[13px] leading-tight mb-1">{edu.degree}</h3>
                    <div className="text-[12px] text-[#4b5563] mb-1">{edu.institution}</div>
                    <span className="text-[12px] font-bold text-[#ea580c]">{edu.year || edu.endDate || edu.startDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
