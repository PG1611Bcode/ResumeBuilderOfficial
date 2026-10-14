const { GoogleGenAI } = require('@google/genai');

const roleDatabase = {
  // --- Google ---
  "google_Software Engineer": {
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Distributed Systems", "Algorithms", "System Design", "Cloud Computing"],
    experience: 2,
    jobDescription: "Design, develop, test, deploy, maintain, and enhance large-scale distributed software applications. Collaborate with cross-functional teams to build cutting-edge web and backend services."
  },
  "google_Data Analyst": {
    skills: ["Python", "SQL", "BigQuery", "Data Visualization", "Statistics", "Machine Learning", "Tableau", "Looker"],
    experience: 2,
    jobDescription: "Extract and analyze complex datasets from BigQuery and internal data stores to drive key product and business decisions. Build executive dashboards and automated reporting pipelines."
  },
  "google_Product Manager": {
    skills: ["Product Strategy", "Agile & Scrum", "User Research", "Data Analytics", "Roadmap Planning", "Go-to-Market Strategy", "Cross-Functional Leadership"],
    experience: 3,
    jobDescription: "Define product vision and strategic direction, prioritize features based on user metrics and market signals, and partner with engineering and design to ship impactful products."
  },
  "google_Cloud Architect": {
    skills: ["Google Cloud Platform (GCP)", "Kubernetes (GKE)", "Terraform", "Microservices", "Cloud Networking", "IAM & Security", "System Architecture"],
    experience: 4,
    jobDescription: "Architect enterprise cloud infrastructure on Google Cloud Platform, establish CI/CD best practices, design high-availability networks, and enforce zero-trust security postures."
  },

  // --- Amazon ---
  "amazon_Software Developer": {
    skills: ["Java", "AWS", "Microservices", "Docker", "Kubernetes", "System Design", "DynamoDB", "CI/CD"],
    experience: 2,
    jobDescription: "Build highly scalable, fault-tolerant services using Java and AWS primitives. Own features from architectural conception to production deployment and operational excellence."
  },
  "amazon_Data Scientist": {
    skills: ["Python", "Machine Learning", "Deep Learning", "AWS SageMaker", "PyTorch/TensorFlow", "Statistics", "Big Data", "Spark"],
    experience: 3,
    jobDescription: "Develop cutting-edge predictive algorithms and deploy scalable ML models using Amazon SageMaker. Analyze petabyte-scale data to optimize logistics, customer personalization, and recommendation systems."
  },
  "amazon_Operations Manager": {
    skills: ["Operations Management", "Supply Chain Optimization", "Process Improvement", "Team Leadership", "Analytics & SQL", "Lean Six Sigma"],
    experience: 4,
    jobDescription: "Lead fulfillment center operations, oversee cross-functional teams, implement Lean Six Sigma process improvements, and meet aggressive delivery SLAs while driving safety and performance."
  },
  "amazon_Cloud Support Engineer": {
    skills: ["AWS Services (EC2, S3, RDS, VPC)", "Linux Administration", "Bash/Python Scripting", "Networking & DNS", "Troubleshooting"],
    experience: 2,
    jobDescription: "Diagnose and resolve complex architectural and performance issues for enterprise customers leveraging AWS services. Automate recurring diagnostics and enhance monitoring."
  },

  // --- Microsoft ---
  "microsoft_Product Manager": {
    skills: ["Product Management", "Azure", "Agile", "Strategic Planning", "Customer Research", "B2B SaaS Strategy", "Data-Driven Prioritization"],
    experience: 3,
    jobDescription: "Lead product life cycles for enterprise cloud and AI solutions within Azure and Microsoft 365. Define specs, prioritize backlogs, and collaborate with globally distributed engineering teams."
  },
  "microsoft_Cloud Engineer": {
    skills: ["Azure", "PowerShell", "ARM / Bicep Templates", "Azure DevOps", "Networking", "Azure Active Directory", "Kubernetes (AKS)"],
    experience: 2,
    jobDescription: "Design, deploy, and maintain mission-critical infrastructure on Microsoft Azure. Implement Infrastructure as Code (IaC) and streamline deployment pipelines via Azure DevOps."
  },
  "microsoft_Business Analyst": {
    skills: ["Business Analysis", "Requirements Gathering", "Process Mapping", "SQL", "Power BI", "Stakeholder Communication", "Excel Modeling"],
    experience: 2,
    jobDescription: "Bridge the gap between business stakeholders and technical teams. Analyze operational workflows, document functional requirements, and deliver interactive Power BI dashboards."
  },
  "microsoft_Software Engineer": {
    skills: ["C#", ".NET Core", "TypeScript", "React", "Azure Cloud", "RESTful APIs", "Relational Databases", "Unit Testing"],
    experience: 2,
    jobDescription: "Develop robust enterprise software and cloud applications using C#, .NET Core, and modern web frameworks. Build scalable APIs and adhere to high code quality and security standards."
  },

  // --- Meta ---
  "meta_Software Engineer": {
    skills: ["React", "JavaScript", "Python", "GraphQL", "C++", "Distributed Systems", "Full Stack Development", "System Design"],
    experience: 2,
    jobDescription: "Build user-facing interfaces and backend infrastructure serving billions of users across Meta technologies. Solve complex distributed systems and performance optimization challenges."
  },
  "meta_Frontend Engineer": {
    skills: ["React", "JavaScript (ES6+)", "TypeScript", "Relay / GraphQL", "CSS Architecture", "Web Performance", "Accessibility (a11y)"],
    experience: 2,
    jobDescription: "Craft high-performance, accessible, and responsive user experiences with React and GraphQL. Drive web performance and implement seamless design systems across web and mobile platforms."
  },
  "meta_Data Scientist": {
    skills: ["Python", "SQL", "Product Analytics", "A/B Testing", "Experimental Design", "Causal Inference", "Statistical Modeling"],
    experience: 3,
    jobDescription: "Partner with engineering and product leaders to design A/B experiments, measure user engagement metrics, and discover quantitative insights that shape Meta's core applications."
  },

  // --- Apple ---
  "apple_iOS Engineer": {
    skills: ["Swift", "SwiftUI", "Objective-C", "iOS SDK", "CoreData", "Combine", "XCTest", "App Store Guidelines"],
    experience: 2,
    jobDescription: "Design and implement world-class native iOS applications with pixel-perfect attention to detail, smooth 60fps animations, memory efficiency, and intuitive Apple Human Interface Guidelines."
  },
  "apple_Software Development Engineer": {
    skills: ["C++", "Objective-C / Swift", "Python", "Algorithms", "Concurrency", "Operating Systems", "Hardware-Software Co-Design"],
    experience: 3,
    jobDescription: "Develop core system services, frameworks, and APIs powering iOS, macOS, watchOS, and cloud platforms. Optimize system-level performance, security, and battery consumption."
  },

  // --- Netflix ---
  "netflix_Senior Software Engineer": {
    skills: ["Java", "Go", "Spring Boot", "Microservices", "gRPC", "Kafka", "AWS", "High-Throughput Distributed Systems"],
    experience: 4,
    jobDescription: "Architect and scale resilient microservices delivering high-definition streaming experiences to hundreds of millions of subscribers worldwide with five-nines availability."
  },
  "netflix_UI Engineer": {
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Rendering Optimization", "Web Workers", "Component Architecture"],
    experience: 3,
    jobDescription: "Build television, web, and mobile viewing interfaces engineered for extreme responsiveness, instant playback start times, and effortless content discovery."
  },

  // --- KPMG ---
  "kpmg_Technology Consultant": {
    skills: ["Digital Transformation", "ERP Systems (SAP/Oracle)", "Business Process Re-engineering", "Cloud Strategy", "IT Governance", "Project Management"],
    experience: 2,
    jobDescription: "Advise enterprise clients on modernizing legacy technology ecosystems, adopting cloud solutions, optimizing IT architecture, and achieving strategic digital transformation goals."
  },
  "kpmg_Cyber Security Consultant": {
    skills: ["Information Security", "NIST Framework", "ISO 27001", "Vulnerability Assessment", "Identity & Access Management (IAM)", "Incident Response"],
    experience: 2,
    jobDescription: "Assess cybersecurity postures, conduct risk assessments, identify regulatory compliance gaps, and implement robust security controls for Fortune 500 clients."
  },

  // --- Deloitte ---
  "deloitte_Technology Analyst": {
    skills: ["Systems Integration", "SQL & Database Design", "Java / Python", "Agile Delivery", "API Development", "Business Analysis"],
    experience: 1,
    jobDescription: "Collaborate on large-scale technology transformation engagements. Support systems integration, design automated test suites, analyze data models, and deliver client presentations."
  },
  "deloitte_Cloud Engineer": {
    skills: ["AWS / Azure / GCP", "Terraform", "DevOps Pipelines", "Linux Administration", "Containerization (Docker)", "Cloud Migration"],
    experience: 2,
    jobDescription: "Help clients migrate workloads to modern public cloud environments. Implement automated CI/CD pipelines, configure cloud landing zones, and ensure operational resilience."
  },

  // --- TCS (Tata Consultancy Services) ---
  "tcs_Systems Engineer": {
    skills: ["Core Java / J2EE", "Spring Boot", "SQL & Relational Databases", "HTML/CSS/JavaScript", "REST APIs", "Git Version Control"],
    experience: 1,
    jobDescription: "Participate in the full software development lifecycle for global enterprise clients. Develop backend services, write unit tests, and resolve production support defects."
  },
  "tcs_Full Stack Developer": {
    skills: ["React / Angular", "Node.js / Java", "MongoDB / PostgreSQL", "Docker", "Microservices Architecture", "Agile Methodology"],
    experience: 2,
    jobDescription: "Build end-to-end enterprise web applications. Develop responsive frontends, integrate with RESTful and GraphQL APIs, and deploy cloud-native microservices."
  },

  // --- Infosys ---
  "infosys_Specialist Programmer": {
    skills: ["Data Structures & Algorithms", "Java / Python / C++", "Microservices", "Design Patterns", "Cloud Native Engineering", "Kafka"],
    experience: 2,
    jobDescription: "Solve high-complexity algorithmic challenges and build mission-critical enterprise systems. Write clean, modular, and optimized code with rigorous automated testing."
  },
  "infosys_Technology Analyst": {
    skills: ["Java / Python", "Spring Boot", "SQL Server / Oracle", "Cloud Fundamentals (AWS/Azure)", "Jenkins CI/CD", "Production Support"],
    experience: 2,
    jobDescription: "Manage software deliveries, interface with client stakeholders to gather specifications, and develop scalable application components adhering to global standards."
  },

  // --- Accenture ---
  "accenture_Associate Software Engineer": {
    skills: ["Java / .NET", "Python", "SQL", "Cloud Concepts", "Software Testing", "Agile & DevOps Principles"],
    experience: 1,
    jobDescription: "Design, code, and test application components for enterprise digital applications. Work closely with senior engineers to implement new business features and fix technical issues."
  },
  "accenture_Cloud Migration Specialist": {
    skills: ["Cloud Architecture", "AWS / Azure", "Kubernetes", "Infrastructure as Code", "Terraform", "Disaster Recovery Planning"],
    experience: 3,
    jobDescription: "Guide clients through large-scale migrations from on-premises data centers to hybrid and public clouds, ensuring zero business disruption and optimal resource utilization."
  },

  // --- JPMorgan Chase ---
  "jpmorgan_Software Engineer": {
    skills: ["Java 17+", "Spring Boot", "Kafka", "Microservices", "Oracle / PostgreSQL", "AWS / Cloud Native", "Distributed Caching (Redis)"],
    experience: 2,
    jobDescription: "Develop secure, low-latency, and high-volume financial transaction processing platforms. Build distributed systems meeting strict banking compliance and resiliency standards."
  },
  "jpmorgan_Quantitative Analyst": {
    skills: ["Python", "C++", "Stochastic Calculus", "Financial Modeling", "Risk Analytics", "Time Series Analysis", "Monte Carlo Simulations"],
    experience: 3,
    jobDescription: "Develop quantitative models to price derivatives, forecast portfolio risk, and backtest algorithmic trading strategies in partnership with trading desks."
  },

  // --- Goldman Sachs ---
  "goldman sachs_Software Engineering Analyst": {
    skills: ["Java", "Python", "C++", "Distributed Systems", "SQL / NoSQL", "Data Modeling", "High-Throughput Architecture"],
    experience: 2,
    jobDescription: "Create next-generation financial technology infrastructure. Solve hard problems around scale, speed, data integrity, and ultra-low latency execution across global financial markets."
  },

  // --- Uber ---
  "uber_Backend Engineer": {
    skills: ["Go", "Java", "Kafka", "Distributed Systems", "gRPC", "MySQL / Cassandra", "Redis", "High-Concurrency Architecture"],
    experience: 2,
    jobDescription: "Build real-time dispatch, routing, and pricing systems operating at massive global scale with sub-second response times and high availability."
  },

  // --- Salesforce ---
  "salesforce_Software Engineer": {
    skills: ["Java", "Apex", "Lightning Web Components (LWC)", "REST APIs", "Multi-tenant Architecture", "PostgreSQL", "Cloud Computing"],
    experience: 2,
    jobDescription: "Develop multi-tenant cloud applications on the Salesforce core platform. Design extensible APIs and build responsive Lightning Web Components for millions of users."
  }
};

/**
 * Standard lookup function (case-insensitive and format-lenient)
 */
function getRoleRequirements(companyId, role) {
  if (!companyId || !role) return null;

  const normalizedCompany = companyId.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  // Exact match
  const exactKey = `${normalizedCompany}_${role.trim()}`;
  if (roleDatabase[exactKey]) return roleDatabase[exactKey];

  // Case-insensitive key match
  for (const [key, value] of Object.entries(roleDatabase)) {
    const [c, r] = key.split('_');
    if (c.toLowerCase() === normalizedCompany && r.toLowerCase() === normalizedRole) {
      return value;
    }
  }

  // Partial match: company matches and role matches loosely
  for (const [key, value] of Object.entries(roleDatabase)) {
    const [c, r] = key.split('_');
    if (c.toLowerCase() === normalizedCompany && (r.toLowerCase().includes(normalizedRole) || normalizedRole.includes(r.toLowerCase()))) {
      return value;
    }
  }

  return null;
}

/**
 * Dynamic AI-powered role requirements generator
 * Generates accurate, tailored ATS requirements for ANY company and role
 */
async function getDynamicRoleRequirements(company, role, customJobDescription = '') {
  const existing = getRoleRequirements(company, role);
  if (existing && !customJobDescription) {
    return {
      ...existing,
      company,
      role
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = `You are an elite Tech Executive Recruiter and ATS (Applicant Tracking System) Specialist.
Analyze the target company "${company}" and target job role "${role}".
${customJobDescription ? `JOB DESCRIPTION PROVIDED BY USER:\n"${customJobDescription}"\n` : ''}

Generate the authoritative, industry-standard ATS job requirements for this position.
Include:
1. skills: Array of 8 to 12 exact, high-priority ATS technical keywords, frameworks, and methodologies required for this role at ${company}.
2. experience: Recommended years of professional experience (integer between 1 and 6).
3. jobDescription: 2 to 3 sentences summarizing the exact day-to-day responsibilities, mission, and expectations at ${company}.

Respond ONLY with a valid JSON object (no markdown, no backticks, no comments):
{
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6", "Skill7", "Skill8"],
  "experience": 2,
  "jobDescription": "..."
}`;

      let text = '';
      try {
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (geminiErr) {
        console.warn('Gemini 2.5 flash fallback for role generation:', geminiErr.message);
        const response = await client.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      if (text && text.trim().length > 0) {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/```json\s*/i, '').replace(/```$/i, '').trim();
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/```\s*/i, '').replace(/```$/i, '').trim();
        }

        const parsed = JSON.parse(cleaned);
        if (parsed.skills && Array.isArray(parsed.skills)) {
          return {
            skills: parsed.skills,
            experience: Number(parsed.experience) || (existing?.experience || 2),
            jobDescription: parsed.jobDescription || customJobDescription || `Develop and deliver high-impact solutions for the ${role} position at ${company}.`,
            company,
            role
          };
        }
      }
    } catch (aiError) {
      console.warn('⚠️ AI dynamic role generation encountered an error, using heuristic fallback:', aiError.message);
    }
  }

  // Algorithmic intelligent fallback if AI is unavailable or no key
  if (existing) {
    return {
      ...existing,
      jobDescription: customJobDescription || existing.jobDescription,
      company,
      role
    };
  }

  return generateHeuristicRoleRequirements(company, role, customJobDescription);
}

/**
 * Intelligent heuristic fallback that deduces skills and requirements based on role keywords
 */
function generateHeuristicRoleRequirements(company, role, customJobDescription) {
  const roleLower = (role || '').toLowerCase();
  let defaultSkills = ["Problem Solving", "System Architecture", "Collaboration", "Git", "Agile"];
  let defaultExp = 2;

  if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
    defaultSkills = ["JavaScript (ES6+)", "TypeScript", "React", "HTML5 & CSS3", "State Management (Redux/Zustand)", "RESTful APIs", "Web Performance", "Git"];
  } else if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('api')) {
    defaultSkills = ["Node.js", "Express / NestJS", "PostgreSQL / MongoDB", "REST APIs", "Microservices Architecture", "Docker", "Redis", "Unit Testing"];
  } else if (roleLower.includes('full stack') || roleLower.includes('web developer')) {
    defaultSkills = ["JavaScript", "TypeScript", "React", "Node.js", "SQL & NoSQL Databases", "REST APIs", "Docker", "Git"];
  } else if (roleLower.includes('data scientist') || roleLower.includes('machine learning') || roleLower.includes('ai')) {
    defaultSkills = ["Python", "Machine Learning", "Deep Learning", "TensorFlow / PyTorch", "SQL", "Pandas & NumPy", "Data Visualization", "Statistics"];
  } else if (roleLower.includes('data analyst') || roleLower.includes('business analyst') || roleLower.includes('analytics')) {
    defaultSkills = ["SQL", "Python", "Tableau / Power BI", "Data Modeling", "Excel Advanced", "Statistics", "A/B Testing", "Requirements Gathering"];
  } else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('sre') || roleLower.includes('infrastructure')) {
    defaultSkills = ["Cloud Computing (AWS / Azure / GCP)", "Docker & Kubernetes", "CI/CD Pipelines", "Terraform", "Linux Administration", "Bash / Python", "Monitoring (Prometheus/Grafana)"];
  } else if (roleLower.includes('product manager') || roleLower.includes('project manager')) {
    defaultSkills = ["Product Strategy", "Agile / Scrum", "User Experience (UX)", "Data Analytics", "Roadmap Execution", "Stakeholder Management", "A/B Testing"];
  } else if (roleLower.includes('security') || roleLower.includes('cyber')) {
    defaultSkills = ["Network Security", "Vulnerability Assessment", "Identity & Access Management (IAM)", "SIEM & SOC", "Cloud Security", "OWASP Top 10", "Python"];
  } else if (roleLower.includes('qa') || roleLower.includes('test')) {
    defaultSkills = ["Automated Testing", "Selenium / Cypress / Playwright", "JavaScript / Python", "API Testing (Postman)", "Test Strategy & Planning", "CI/CD Integration"];
  } else if (roleLower.includes('consultant')) {
    defaultSkills = ["Business Transformation", "Process Mapping", "Requirements Analysis", "Stakeholder Communication", "Project Delivery", "Data Analysis", "Strategic Presentation"];
  } else {
    defaultSkills = ["Software Engineering Principles", "Algorithms & Data Structures", "Database Management", "Clean Code & Design Patterns", "REST APIs", "Git Version Control", "CI/CD"];
  }

  if (roleLower.includes('senior') || roleLower.includes('lead') || roleLower.includes('principal')) {
    defaultExp = 5;
  } else if (roleLower.includes('junior') || roleLower.includes('associate') || roleLower.includes('intern')) {
    defaultExp = 1;
  }

  return {
    skills: defaultSkills,
    experience: defaultExp,
    jobDescription: customJobDescription || `Drive key initiatives as a ${role} at ${company}. Collaborate across cross-functional engineering and product teams to deliver high quality, scalable, and reliable technical solutions.`,
    company,
    role
  };
}

function getAllCompanies() {
  const companies = {};
  Object.keys(roleDatabase).forEach(key => {
    const [companyId, role] = key.split('_');
    if (!companies[companyId]) {
      companies[companyId] = [];
    }
    companies[companyId].push(role);
  });
  return companies;
}

module.exports = { 
  getRoleRequirements,
  getDynamicRoleRequirements,
  getAllCompanies,
  roleDatabase
};
