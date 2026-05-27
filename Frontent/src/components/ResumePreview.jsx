import React from 'react';

const ResumePreview = ({ data, template = 'modern' }) => {
  if (!data) return null;

  const {
    fullname,
    profile,
    experience,
    education,
    projects,
    skills
  } = data;

  const getThemeColor = () => {
    switch (template) {
      case 'classic': return 'text-blue-800 border-blue-800';
      case 'modern': return 'text-purple-700 border-purple-700';
      case 'creative': return 'text-red-600 border-red-600';
      case 'minimal': return 'text-emerald-700 border-emerald-700';
      case 'technical': return 'text-orange-600 border-orange-600';
      default: return 'text-gray-800 border-gray-800';
    }
  };

  const getBgThemeColor = () => {
    switch (template) {
      case 'classic': return 'bg-blue-800 text-white';
      case 'modern': return 'bg-purple-700 text-white';
      case 'creative': return 'bg-red-600 text-white';
      case 'minimal': return 'bg-emerald-700 text-white';
      case 'technical': return 'bg-orange-600 text-white';
      default: return 'bg-gray-800 text-white';
    }
  };

  const themeClass = getThemeColor();
  const bgThemeClass = getBgThemeColor();

  return (
    <div className="bg-white w-full h-full text-gray-800 font-sans shadow-lg mx-auto" style={{ width: '800px', minHeight: '1131px', padding: '0' }}>
      
      {/* Header Section */}
      <div className={`${bgThemeClass} px-10 py-8`}>
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
          {fullname?.firstname} {fullname?.lastname}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm opacity-90 mt-3">
          {profile?.email && (
            <div className="flex items-center gap-1">
              <span>✉️</span> {profile.email}
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-1">
              <span>📱</span> {profile.phone}
            </div>
          )}
          {profile?.linkedIn && (
            <div className="flex items-center gap-1">
              <span>🔗</span> {profile.linkedIn.replace('https://', '')}
            </div>
          )}
          {profile?.github && (
            <div className="flex items-center gap-1">
              <span>💻</span> {profile.github.replace('https://', '')}
            </div>
          )}
        </div>
      </div>

      <div className="px-10 py-8">
        {/* Summary Section */}
        {profile?.summary && (
          <div className="mb-6">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b-2 pb-1 mb-3 ${themeClass}`}>
              Professional Summary
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed text-justify">
              {profile.summary}
            </p>
          </div>
        )}

        {/* Technical Skills */}
        {skills?.technical && skills.technical.length > 0 && (
          <div className="mb-6">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b-2 pb-1 mb-3 ${themeClass}`}>
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium border border-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <div className="mb-6">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b-2 pb-1 mb-3 ${themeClass}`}>
              Experience
            </h2>
            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-sm font-semibold text-gray-600">
                      {exp.startDate || exp.duration || 'Date'} {exp.endDate ? `- ${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-2 italic">
                    {exp.company} {exp.location ? `| ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <div className="mb-6">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b-2 pb-1 mb-3 ${themeClass}`}>
              Key Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900">{proj.name || proj.title}</h3>
                    {proj.technologies && (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-sm text-gray-700 leading-relaxed text-justify mt-1">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b-2 pb-1 mb-3 ${themeClass}`}>
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <span className="text-sm font-semibold text-gray-600">
                      {edu.year || edu.endDate || edu.startDate}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {edu.institution} {edu.fieldOfStudy ? `- ${edu.fieldOfStudy}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
