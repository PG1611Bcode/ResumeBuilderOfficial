# ✨ ResuMate AI — The Ultimate AI-Powered Resume Builder & Career Suite 🚀

[![Vite](https://img.shields.io/badge/Vite-7.1.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.17.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-0.24.1-1A73E8?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**ResuMate AI** is an elite, full-stack monorepo application designed to supercharge the job application process. By combining a React 19 + Tailwind v4 frontend with a robust Node.js/Express + MongoDB backend, ResuMate AI provides job-seekers with an intelligent suite of tools that parses resumes, highlights skill gaps, curates personalized learning pathways, creates custom cover letters, and generates beautiful exportable PDFs.

---

## 🔗 Live Links & Preview

*   **Live Demo:** `https://resume-builder-official.vercel.app/` 🚀
<!-- *   **Production API:** `[Insert Production API Link Here]` 🌐 -->



---

## 🌟 Key Features

### 🧠 1. Deep AI Resume Parsing & Automated Enhancement
*   **Multi-Format Uploads:** Upload resumes in PDF (`.pdf`), Word (`.docx`, `.doc`), or plain text (`.txt`) formats.
*   **Intelligent Parsing:** The system parses resume structures into categorized datasets (skills, experience, education, contact info) using `pdf-parse` and `mammoth`.
*   **AI Rewrite & Optimizations:** Rewrites resume descriptions and structure using state-of-the-art LLMs (OpenAI GPT-4, Google Gemini, and Llama 3 via Groq) to maximize impact.

### 🎯 2. Company-Specific ATS & Job-Match Scoring
*   **Role-Targeted Scoring:** Scores your CV against elite job roles at companies like Google, Amazon, and Microsoft (e.g., Software Engineer, Data Scientist, Product Manager, Cloud Engineer).
*   **Visual Alignment Indicators:** Dynamic, color-coded scoring circles (🟢 Excellent Match, 🟡 Good Match, 🔴 Needs Improvement) showing matching vs. missing skills.
*   **Granular Strength/Weakness Breakdowns:** Get instant lists of CV highlights and clear actionable steps to overcome deficiencies.

### 🎓 3. Skill-Gap Detection & Personalized Learning Roads
*   **Automated Skill-Gap Identification:** Detects the exact tech skills your resume lacks for a target role.
*   **Tailored Course Recommendations:** Curates a custom learning list of **5 targeted resources** (3 free resources like YouTube, Telegram, freeCodeCamp, or GitHub repos + 2 premium courses on Udemy/Coursera) mapped specifically to your skill gaps using Groq's Llama model.

### 📝 4. AI-Tailored Cover Letter Suite
*   **Highly Tailored Letters:** Generates customized cover letters that perfectly align your background to a specific company, role, and job description.
*   **Version Control & Regeneration:** Allows you to regenerate letters, manage multiple versions, edit drafts, and store histories.
*   **Professional PDF Export:** Outputs polished, properly spaced, justified, and styled PDFs ready for application using `pdfkit`.

### 🎨 5. Exquisite Professional Resume Templates
*   **5 Elite Designs:** Renders parsed and optimized resume text in 5 stunning, recruiter-tested templates: **Classic**, **Modern** (with gorgeous linear gradients), **Creative** (with vibrant borders), **Minimal** (elegant serif typography), and **Technical** (hacker-style monospace console).
*   **Live Hyperlink Previews:** Converts contact URLs, emails, LinkedIn profiles, and GitHub handles to clickable hyperlinks within the generated resume.
*   **PDF Exports & Email Sharing:** Download files directly as print-ready A4 PDFs client-side or email them directly to recruiters from the dashboard.

### 🔐 6. Secure Authentication & Profile Syncing
*   **Hybrid Authentication:** Offers secure local credentials (hashed with Bcrypt and secured via JWT cookies) alongside social sign-ins (Google & GitHub OAuth) verified securely through the Firebase Admin SDK.
*   **Unified Profile Management:** Keep your educational, professional, and technical skills updated and synced in your dashboard to serve as the single source of truth for resume tailoring.

---

## 🛠️ Tech Stack

### Frontend Architecture
*   **Framework:** React 19 (Vite-powered, ES Modules)
*   **Styling:** Tailwind CSS v4 (native nesting, lightning-fast rendering)
*   **Routing:** React Router DOM v7
*   **Authentication:** Firebase Client SDK (OAuth) & Cookie-based JWT
*   **PDF Engines:** `html2pdf.js`, `jspdf`, `react-to-pdf`

### Backend Services
*   **Server Environment:** Node.js & Express v5
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **OAuth Security:** Firebase Admin SDK (token verification)
*   **Document Parsers:** `pdf-parse` (PDF extraction), `mammoth` (Word text extraction), `multer` (multipart memory storage uploads)
*   **PDF Generation:** `pdfkit` (for cover letters) & HTML-to-PDF rendering engines
*   **Mailing Service:** Nodemailer SMTP Integration

### AI & Core API Integrations
*   **Google AI:** `@google/generative-ai` (Gemini SDK)
*   **OpenAI:** `openai` (GPT SDK)
*   **Groq Cloud:** `groq-sdk` (Llama-3.3-70b for hyper-fast learning paths)

---

## 📂 Repository Structure

```text
├── Backend/                 # Express backend server, database schemas, and AI controllers
│   ├── config/              # Configuration (Firebase Admin, service accounts)
│   ├── controllers/         # Request handling logic (auth, user)
│   ├── db/                  # MongoDB database connection helper
│   ├── middleware/          # JWT authentication and route guard middleware
│   ├── models/              # Mongoose schemas (User, CVHistory, CoverLetter, CourseRecommendation)
│   ├── routes/              # Express API endpoints
│   ├── services/            # Core business services (AI integrations, Emailing, Role mapping)
│   ├── server.js            # Server entrypoint
│   └── app.js               # Express application initialization
│
├── Frontent/                # React Vite frontend application (Tailwind CSS v4)
│   ├── src/
│   │   ├── components/      # Reusable UI widgets (Navbar, Route guards, ForgotPassword)
│   │   ├── Context/         # React Context for authentication
│   │   ├── Pages/           # Application pages (Dashboard, Profile, CVHistoryDetail, History, Auth)
│   │   ├── config/          # Firebase Client configuration
│   │   ├── styles/          # Custom styling modules
│   │   ├── App.jsx          # Route configuration
│   │   └── main.jsx         # App bootstrapping
│   └── index.html           # Main HTML document
│
├── vercel.json              # Unified Vercel serverless monorepo deployment config
└── package.json             # Root monorepo scripts
```

> [!NOTE]
> The frontend directory is named `Frontent` in the codebase. Ensure you use this exact casing when running terminal commands locally!

---

## ⚙️ Getting Started (Local Setup)

Follow these exact steps to clone, configure, and boot up both the frontend and backend development environments:

### 1. Prerequisites
Make sure you have [Node.js (v18+)](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) (local or Atlas) installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/[Your-Username]/ResumeBuilder.git
cd ResumeBuilder
```

### 3. Setup the Backend Server
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory:
   ```bash
   # On macOS/Linux:
   touch .env
   # On Windows (PowerShell):
   New-Item .env
   ```
4. Configure your `.env` variables (see the [Environment Variables](#-environment-variables) section below).
5. Add your Firebase Admin service account key JSON in `Backend/config/serviceAccountKey.json`.
6. Launch the backend server in development mode:
   ```bash
   node server.js
   ```
   *The server will start running on port `4000` (or the port defined in your `.env` file).*

### 4. Setup the Frontend Client
1. Open a new terminal window in the root directory and navigate to the `Frontent` directory (note the spelling!):
   ```bash
   cd Frontent
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will boot up at `http://localhost:5173`.*

---

## 🔑 Environment Variables

The backend relies on the following environment variables to run. Create a `.env` file inside the `/Backend` directory and define these keys:

| Variable Name | Type | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| **`PORT`** | Number | The port the backend server listens on. | `4000` |
| **`DB_CONNECT`** | String | MongoDB Atlas or local MongoDB connection URI. | `mongodb+srv://...` |
| **`JWT_SECRET`** | String | Secret key used for signing JWT login tokens. | *Your custom random string* |
| **`SESSION_SECRET`** | String | Secret key for Express-Session cookies. | *Your custom session string* |
| **`BASE_URL`** | String | The base URL of the backend API. | `http://localhost:4000` |
| **`FIREBASE_SERVICE_ACCOUNT`** | String | Stringified JSON of your Firebase Admin Service Account Key. | `{"type": "service_account", ...}` |
| **`OPENAI_API_KEY`** | String | API key for OpenAI engines (resume rewrite). | `sk-proj-...` |
| **`GROQ_API_KEY`** | String | API key for Groq Cloud (course matching & paths). | `gsk_...` |
| **`EMAIL_HOST`** | String | SMTP email host used to email resumes. | `smtp.gmail.com` |
| **`EMAIL_PORT`** | Number | SMTP email server port. | `587` |
| **`EMAIL_USER`** | String | Sender email username. | `your-email@gmail.com` |
| **`EMAIL_PASSWORD`** | String | SMTP service App Password (not your raw password). | `abcd efgh ijkl mnop` |
| **`EMAIL_FROM`** | String | "From" field shown in sent emails. | `your-email@gmail.com` |
| **`GOOGLE_CLIENT_ID`** | String | Google OAuth Client ID (from Google Console). | `466713238951-...` |
| **`GOOGLE_CLIENT_SECRET`**| String | Google OAuth Client Secret. | `GOCSPX-...` |
| **`GOOGLE_CALLBACK_URL`**| String | Redirect URL matching Google credentials console. | `http://localhost:4000/users/auth/google/callback` |
| **`GITHUB_CLIENT_ID`** | String | GitHub OAuth Application Client ID. | `Ov23li...` |
| **`GITHUB_CLIENT_SECRET`**| String | GitHub OAuth Application Client Secret. | `d3c92e...` |

> [!TIP]
> You can generate a strong `JWT_SECRET` key by running this quick Node.js command in your terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 🚀 Deployment (Vercel)

This repository is pre-configured to build and deploy effortlessly on Vercel as a single monorepo unit. The routing behavior defined in `vercel.json` maps incoming `/api/*` and `/users/*` requests to the Node serverless function (`Backend/app.js`) and routes all UI requests to `Frontent/dist/index.html`.

To deploy via Vercel CLI:
1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the root folder and follow the prompts.
3. Configure all variables listed above in the Vercel Project Dashboard under **Environment Variables**.
