const { GoogleGenAI } = require('@google/genai');

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate a professional cover letter using AI with dynamic company and role tailoring
 */
async function generateCoverLetter({ userInfo = {}, company = 'Company', role = 'Role', jobDescription = '', template = 'professional' }) {
  const client = getClient();

  if (client) {
    try {
      const prompt = buildPrompt(userInfo, company, role, jobDescription, template);
      console.log(`🤖 Generating personalized cover letter for ${company} - ${role}...`);

      let text = '';
      try {
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (geminiErr) {
        console.warn('gemini-2.5-flash failed for cover letter, attempting gemini-1.5-flash:', geminiErr.message);
        const response = await client.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      if (text && text.trim().length > 100) {
        console.log('✅ Cover letter generated successfully via Gemini AI');
        return text.trim();
      }
    } catch (error) {
      console.warn('⚠️ Error in Gemini cover letter generation, using dynamic personalized template:', error.message);
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY is not configured. Generating dynamic tailored cover letter.');
  }

  // Dynamic High-Quality Cover Letter Fallback
  return generateTailoredCoverLetter(userInfo, company, role, jobDescription, template);
}

function buildPrompt(userInfo, company, role, jobDescription, template) {
  const { name = 'Applicant', email = '', phone = '', skills = [], experience = '' } = userInfo;
  const skillsList = Array.isArray(skills) ? skills.join(', ') : (skills || 'Engineering & Problem Solving');

  let styleGuide = '';
  switch (template) {
    case 'creative':
      styleGuide = 'Write in an energetic, engaging, and memorable narrative tone that highlights unique problem-solving capabilities while maintaining executive polish.';
      break;
    case 'technical':
      styleGuide = 'Write in a precise, results-oriented technical tone emphasizing architectural decisions, technical stack mastery, and concrete quantified business achievements.';
      break;
    case 'professional':
    default:
      styleGuide = 'Write in an authoritative, poised, and respectful corporate tone emphasizing proven track record, domain leadership, and alignment with corporate strategic goals.';
      break;
  }

  return `You are a World-Class Executive Career Coach and Cover Letter Specialist.
Write a captivating, custom-tailored cover letter for the following candidate:

CANDIDATE INFORMATION:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Key Skills & Core Tech: ${skillsList}
- Professional Experience Background: ${experience || 'Experienced professional with demonstrated impact'}

TARGET POSITION:
- Company: ${company}
- Target Role: ${role}
${jobDescription ? `- Target Job Description / Key Requirements:\n"${jobDescription}"` : ''}

TONE & STYLE:
${styleGuide}

STRICT WRITING GUIDELINES:
1. Make it deeply customized for ${company} and the ${role} position. Mention why ${company}'s work/mission stands out in its industry.
2. Address key qualifications directly matching the target role and job description.
3. Quantify achievements (e.g. improved performance, delivered scalable features, mentored engineers, optimized workflows).
4. Avoid generic fluff like "I am writing to apply for...". Use a compelling, confident opening hook.
5. Length: 280 to 380 words.
6. Format: Plain text only (no markdown symbols like ** or #, no markdown tables).

Return the full letter starting with Today's Date, Recipient Header, Salutation, 3-4 cohesive paragraphs, and Professional Sign-off:`;
}

function generateTailoredCoverLetter(userInfo, company, role, jobDescription, template) {
  const name = userInfo.name || 'Candidate';
  const email = userInfo.email || '';
  const phone = userInfo.phone || '';
  const skillsArray = Array.isArray(userInfo.skills) ? userInfo.skills : (typeof userInfo.skills === 'string' ? userInfo.skills.split(',').map(s => s.trim()) : []);
  const topSkills = skillsArray.slice(0, 4).join(', ') || 'modern software engineering and scalable architecture';
  const experience = userInfo.experience || 'proven industry experience';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `${today}

Hiring Team & Leadership
${company}

Dear Hiring Team,

I am writing to express my strong interest in the ${role} opportunity at ${company}. With ${experience} delivering scalable, high-impact solutions and specialized expertise in ${topSkills}, I am excited by the prospect of contributing directly to ${company}'s continued engineering innovation and operational excellence.

Throughout my career, I have focused on translating complex business and architectural challenges into robust, maintainable, and high-performance solutions. My background with ${topSkills} has enabled me to drive quantifiable improvements in system efficiency, reduce operational bottlenecks, and maintain high standards of code craftsmanship. Whether architecting new features or optimizing mission-critical workflows, I thrive in fast-paced, collaborative environments that demand technical rigor.

${company}'s reputation for industry-defining impact and technical excellence aligns perfectly with my professional values. I am eager to bring my problem-solving mindset, collaborative drive, and hands-on technical skills to help accelerate your team's objectives.

Thank you for your time and consideration. I welcome the opportunity to discuss how my experience and passion for building quality software can create immediate value for ${company}.

Sincerely,

${name}
${email ? email : ''}
${phone ? phone : ''}`;
}

/**
 * Regenerate a cover letter with variations
 */
async function regenerateCoverLetter(originalContent, userInfo, company, role) {
  const client = getClient();
  if (client) {
    try {
      const prompt = `You are an elite career strategist.
I have an existing cover letter for a ${role} position at ${company}.
Create a FRESH, ALTERNATIVE version that:
- Retains the candidate's core qualifications and technical strengths
- Introduces a bold, fresh narrative hook and distinct sentence flow
- Emphasizes different angles of impact (e.g., architectural depth, business leadership, team velocity)
- Keeps the length between 270-350 words in plain text format without markdown symbols.

ORIGINAL COVER LETTER:
"""
${originalContent}
"""

CANDIDATE INFO:
Name: ${userInfo?.name || 'Applicant'}
Email: ${userInfo?.email || ''}
Phone: ${userInfo?.phone || ''}

Generate the complete new version now:`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text && text.trim().length > 100) {
        return text.trim();
      }
    } catch (err) {
      console.warn('Regeneration error, using dynamic variation:', err.message);
    }
  }

  return generateTailoredCoverLetter(userInfo, company, role, '', 'creative');
}

module.exports = {
  generateCoverLetter,
  regenerateCoverLetter
};