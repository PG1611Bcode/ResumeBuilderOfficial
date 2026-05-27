const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function analyzeAndCustomizeCV(cvText, profileData, roleDetails) {
  try {
    console.log('Calling Groq API for CV analysis...');

    // ── Build a safe contact block from the DB profile so the AI can reference it
    const contactBlock = {
      firstname:  profileData?.fullname?.firstname  || "",
      lastname:   profileData?.fullname?.lastname   || "",
      email:      profileData?.profile?.email       || profileData?.email || "",
      phone:      profileData?.profile?.phone       || "",
      linkedin:   profileData?.profile?.linkedIn    || "",
      github:     profileData?.profile?.github      || "",
    };

    const prompt = `You are an expert career consultant and CV writer. Your task is to analyze the candidate's CV against the target role and return a fully structured, optimized CV in strict JSON format.

=== CANDIDATE PROFILE (USE THIS DATA AS THE AUTHORITATIVE SOURCE FOR CONTACT INFO) ===
Name: ${contactBlock.firstname} ${contactBlock.lastname}
Email: ${contactBlock.email}
Phone: ${contactBlock.phone}
LinkedIn: ${contactBlock.linkedin}
GitHub: ${contactBlock.github}

=== UPLOADED CV TEXT ===
${cvText}

=== TARGET ROLE ===
Company: ${roleDetails.company}
Role: ${roleDetails.role}
Required Skills: ${roleDetails.skills.join(', ')}
Required Experience: ${roleDetails.experience} years

=== INSTRUCTIONS ===
1. Analyze the CV for strengths, weaknesses and skills match against the target role.
2. Produce an improved, ATS-optimized version of the CV tailored to the target role.
3. The "improvedCV" field MUST be a structured JSON object — NOT a string, NOT markdown, NOT plain text.
4. Populate EVERY field. Use the candidate profile above for all contact info. Do NOT invent contact details.
5. Skills MUST be split into distinct categories: languages, frontend, backend, tools, soft.
6. Experience and projects descriptions should be bullet-point rich, achievement-focused sentences.

Return ONLY valid JSON matching this EXACT schema (no markdown fences, no extra keys outside this schema):

{
  "analysis": {
    "strengths": [ { "point": "string", "detail": "string" } ],
    "weaknesses": [ { "point": "string", "detail": "string", "actionableStep": "string" } ],
    "skillsMatch": ["list of matching skills from the CV"],
    "missingSkills": ["list of skills required but not found in CV"],
    "overallScore": "number 0-100 as string"
  },
  "improvedCV": {
    "profile": {
      "firstname": "${contactBlock.firstname}",
      "lastname": "${contactBlock.lastname}",
      "email": "${contactBlock.email}",
      "phone": "${contactBlock.phone}",
      "linkedin": "${contactBlock.linkedin}",
      "github": "${contactBlock.github}"
    },
    "objective": "2-4 sentence tailored professional summary targeting the role",
    "skills": {
      "languages": ["Programming languages only, e.g. Python, JavaScript, Java"],
      "frontend": ["Frontend frameworks/libs e.g. React, Vue, Tailwind"],
      "backend": ["Backend frameworks/services e.g. Node.js, Express, Django"],
      "tools": ["DevOps, DBs, cloud, IDEs e.g. Docker, AWS, Git, MongoDB"],
      "soft": ["Soft skills e.g. Leadership, Communication, Problem Solving"]
    },
    "experience": [
      {
        "title": "Job Title at Company Name",
        "duration": "Month Year – Month Year",
        "description": "Achievement-focused bullet points as a single string. Start each bullet with •. Include quantified results where possible."
      }
    ],
    "education": [
      {
        "degree": "Degree name",
        "institution": "University/College name",
        "year": "Graduation year or date range",
        "score": "GPA or percentage if mentioned, else empty string"
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "tech": "Comma-separated tech stack",
        "description": "What it does and your contribution"
      }
    ],
    "certifications": [
      {
        "name": "Certification name",
        "issuer": "Issuing organisation",
        "year": "Year obtained"
      }
    ]
  },
  "changesMade": ["list of changes made to optimize the CV"],
  "recommendations": ["list of recommendations for the candidate"]
}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.3,   // lower = more deterministic / schema-faithful
    });

    const text = response.choices[0]?.message?.content || '';
    console.log('Groq API response received');

    // Strip any accidental markdown fences
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    try {
      const parsedResult = JSON.parse(cleanedText);

      // ── Safety: if the AI returned improvedCV as a string (old format), wrap it
      if (typeof parsedResult.improvedCV === 'string') {
        console.warn('AI returned improvedCV as a string — wrapping in structured object');
        parsedResult._rawMarkdown = parsedResult.improvedCV;
        parsedResult.improvedCV = buildFallbackImprovedCV(contactBlock, profileData, parsedResult._rawMarkdown);
      }

      return parsedResult;
    } catch (parseError) {
      console.error('JSON parsing failed, using structured fallback. Parse error:', parseError.message);
      return buildFullFallback(contactBlock, profileData, roleDetails, cvText);
    }

  } catch (error) {
    console.error('Groq AI Error:', error);
    throw new Error('AI analysis failed: ' + error.message);
  }
}

/** Builds a structured improvedCV object from real profile data when the AI returns a string */
function buildFallbackImprovedCV(contactBlock, profileData, rawText) {
  return {
    profile: {
      firstname: contactBlock.firstname,
      lastname:  contactBlock.lastname,
      email:     contactBlock.email,
      phone:     contactBlock.phone,
      linkedin:  contactBlock.linkedin,
      github:    contactBlock.github,
    },
    objective: profileData?.profile?.summary || "",
    skills: {
      languages: profileData?.skills?.technical?.slice(0, 5) || [],
      frontend:  [],
      backend:   [],
      tools:     profileData?.skills?.technical?.slice(5) || [],
      soft:      profileData?.skills?.soft || [],
    },
    experience:     profileData?.experience     || [],
    education:      profileData?.education      || [],
    projects:       profileData?.projects       || [],
    certifications: profileData?.certifications || [],
    _rawMarkdown: rawText,
  };
}

/** Full fallback when JSON.parse fails entirely */
function buildFullFallback(contactBlock, profileData, roleDetails, cvText) {
  return {
    analysis: {
      strengths: [{ point: "CV Processed", detail: "CV analyzed and structured from profile data." }],
      weaknesses: [{ point: "Re-run Recommended", detail: "The AI response couldn't be parsed. Please try again.", actionableStep: "Re-submit the CV for analysis." }],
      skillsMatch: roleDetails.skills.slice(0, 3),
      missingSkills: roleDetails.skills.slice(3),
      overallScore: "70"
    },
    improvedCV: buildFallbackImprovedCV(contactBlock, profileData, cvText),
    changesMade: ["Structured from profile data due to AI parse error"],
    recommendations: [
      `Focus on developing: ${roleDetails.skills.slice(-2).join(', ')}`,
      `Highlight experience with: ${roleDetails.skills.slice(0, 2).join(', ')}`,
      "Quantify achievements with metrics",
      "Customize summary for each application"
    ]
  };
}

// Unchanged utility function
async function generateCVSuggestions(cvText, roleRequirements) {
  try {
    const prompt = `Analyze this CV and provide 5-7 improvement suggestions:

CV: ${cvText.substring(0, 2000)}
Requirements: ${JSON.stringify(roleRequirements)}

Focus on: skills alignment, experience highlighting, keyword optimization, ATS compatibility.
Respond as a numbered list.`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const text = response.choices[0]?.message?.content || '';

    const suggestions = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 10);

    return suggestions.length > 0 ? suggestions : [
      "Tailor CV to match job requirements",
      "Highlight relevant skills prominently",
      "Use keywords from job description",
      "Quantify achievements with numbers",
      "Ensure ATS-friendly formatting",
      "Add targeted professional summary"
    ];

  } catch (error) {
    console.error('Groq AI Suggestions Error:', error);
    return [
      "Tailor CV to job requirements",
      "Highlight relevant experience",
      "Use job-specific keywords",
      "Quantify achievements",
      "Ensure ATS compatibility"
    ];
  }
}

module.exports = {
  analyzeAndCustomizeCV,
  generateCVSuggestions
};