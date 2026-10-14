const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const CourseRecommendation = require('../models/courseRecommendation.model');
const connectDB = require('../db/db');
const { GoogleGenAI } = require('@google/genai');

// Helper function to normalize difficulty values
function normalizeDifficulty(difficulty) {
  if (!difficulty) return 'Beginner';
  const lower = difficulty.toLowerCase();
  if (lower.includes('beginner')) return 'Beginner';
  if (lower.includes('intermediate')) return 'Intermediate';
  if (lower.includes('advanced')) return 'Advanced';
  return 'Beginner';
}

// Generate tailored fallback resources dynamically based on target skills, company, and role
function generateTailoredFallbackResources(missingSkills, company, role) {
  const skills = (missingSkills && missingSkills.length > 0) ? missingSkills : ['Programming', 'System Architecture', 'Modern Frameworks'];
  const primarySkill = skills[0] || 'Technical Skills';
  const secondarySkill = skills[1] || 'Core Architecture';
  const tertiarySkill = skills[2] || 'Best Practices';

  return [
    {
      title: `${primarySkill} - Complete Zero to Hero Mastery Course`,
      platform: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${primarySkill} full course tutorial`)}`,
      skillGap: primarySkill,
      duration: '12+ hours',
      difficulty: 'Beginner',
      isPaid: false,
      price: 'Free',
      rating: 4.8,
      description: `Comprehensive video tutorial series covering foundational to advanced concepts for ${primarySkill}, aligned with ${company || 'industry'} standards.`,
      channelName: 'freeCodeCamp.org'
    },
    {
      title: `Hands-on ${secondarySkill} Interactive Roadmap & Challenges`,
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/learn',
      skillGap: secondarySkill,
      duration: 'Self-paced (20 hrs)',
      difficulty: 'Intermediate',
      isPaid: false,
      price: 'Free',
      rating: 4.9,
      description: `Interactive coding challenges, real-world project builds, and automated tests for ${secondarySkill}.`,
      channelName: null
    },
    {
      title: `${tertiarySkill} Developer Guide & Community Curated Resources`,
      platform: 'GitHub',
      url: `https://github.com/search?q=${encodeURIComponent(`${tertiarySkill} awesome learning resources`)}`,
      skillGap: tertiarySkill,
      duration: 'Self-paced',
      difficulty: 'Intermediate',
      isPaid: false,
      price: 'Free',
      rating: 4.7,
      description: `Production-ready boilerplates, reference implementations, and design pattern cheat-sheets for ${tertiarySkill}.`,
      channelName: 'GitHub Education'
    },
    {
      title: `Production ${primarySkill} for ${role || 'Engineers'} at Scale`,
      platform: 'Udemy',
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(`${primarySkill} professional bootcamp`)}`,
      skillGap: primarySkill,
      duration: '35 hours',
      difficulty: 'Intermediate',
      isPaid: true,
      price: '₹499',
      rating: 4.6,
      description: `End-to-end industry bootcamp with capstone projects and interview prep for ${company || 'top tech companies'}.`,
      channelName: null
    },
    {
      title: `${secondarySkill} Specialization & Professional Certification`,
      platform: 'Coursera',
      url: `https://www.coursera.org/search?query=${encodeURIComponent(secondarySkill)}`,
      skillGap: secondarySkill,
      duration: '4-6 weeks',
      difficulty: 'Advanced',
      isPaid: true,
      price: '₹1,499',
      rating: 4.8,
      description: `Accredited certification designed by top university professors and industry engineers to master ${secondarySkill}.`,
      channelName: null
    }
  ];
}

// Generate course recommendations
router.post('/recommend-courses', auth, async (req, res) => {
  try {
    await connectDB();
    const { missingSkills, company = 'Tech Company', role = 'Target Role', userCV } = req.body;

    if (!missingSkills || missingSkills.length === 0) {
      return res.json({
        success: true,
        message: 'No skill gaps found! Your CV matches the role perfectly.',
        recommendations: []
      });
    }

    console.log(`🎓 Generating course recommendations for ${role} at ${company}:`, missingSkills);

    let courses = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY is not set. Generating high-quality dynamic fallback course recommendations.');
      courses = generateTailoredFallbackResources(missingSkills, company, role);
    } else {
      try {
        const client = new GoogleGenAI({ apiKey });
        const prompt = `You are a world-class tech career mentor and curriculum expert.
A candidate is applying for a "${role}" position at "${company}".
Their CV is missing these critical skills/keywords: ${missingSkills.join(', ')}.

Generate EXACTLY 5 high-impact, realistic learning resources (3 FREE + 2 PAID) specifically targeted at mastering these missing skills.

PRIORITIZE FREE RESOURCES (Top 3):
- YouTube playlists/tutorials (e.g., freeCodeCamp, Traversy Media, Fireship, NeetCode)
- Interactive platforms (e.g. freeCodeCamp, GitHub repos, MDN/official docs)
- Community learning channels (e.g. Telegram / GitHub awesome lists)

PAID RESOURCES (Bottom 2):
- Udemy / Coursera / Educative / Pluralsight / O'Reilly

For EACH resource provide:
1. title: Specific, catchy title
2. platform: YouTube, freeCodeCamp, GitHub, Udemy, Coursera, etc.
3. url: Valid, direct search or platform link
4. skillGap: Exactly which missing skill it addresses
5. duration: Estimated time (e.g., "12 hours", "4 weeks")
6. difficulty: MUST BE EXACTLY ONE OF: "Beginner", "Intermediate", or "Advanced"
7. isPaid: boolean (false for first 3, true for last 2)
8. price: "Free" for free, or Indian Rupees format (e.g., "₹499", "₹1,499", "₹2,499")
9. rating: number between 4.3 and 4.9
10. description: 1-2 practical sentences explaining how it bridges the gap
11. channelName: string or null (e.g., "freeCodeCamp.org" for YouTube)

Respond ONLY with a valid JSON array of 5 objects (no markdown, no backticks, no prose):
[
  {
    "title": "...",
    "platform": "...",
    "url": "...",
    "skillGap": "...",
    "duration": "...",
    "difficulty": "Beginner",
    "isPaid": false,
    "price": "Free",
    "rating": 4.8,
    "description": "...",
    "channelName": "..."
  }
]`;

        let rawText = '';
        try {
          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
          });
          rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (modelError) {
          console.warn('gemini-2.5-flash failed, attempting fallback with gemini-1.5-flash:', modelError.message);
          const response = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
          });
          rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        if (rawText && rawText.trim().length > 0) {
          let cleaned = rawText.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/```json\s*/i, '').replace(/```$/i, '').trim();
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```\s*/i, '').replace(/```$/i, '').trim();
          }

          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            courses = parsed.map(c => ({
              title: c.title || `${c.skillGap || 'Skill'} Course`,
              platform: c.platform || 'Online',
              url: c.url || `https://www.google.com/search?q=${encodeURIComponent((c.title || c.skillGap || 'Course') + ' tutorial')}`,
              skillGap: c.skillGap || missingSkills[0] || 'Technical Skill',
              duration: c.duration || 'Self-paced',
              difficulty: normalizeDifficulty(c.difficulty),
              channelName: c.channelName || null,
              isPaid: Boolean(c.isPaid === true || c.isPaid === 'true'),
              price: c.price || (c.isPaid ? '₹999' : 'Free'),
              rating: parseFloat(c.rating) || 4.7,
              description: c.description || 'Comprehensive learning resource tailored to bridge your skill gap.'
            }));

            const freeCourses = courses.filter(c => !c.isPaid).slice(0, 3);
            const paidCourses = courses.filter(c => c.isPaid).slice(0, 2);
            courses = [...freeCourses, ...paidCourses];
          }
        }
      } catch (aiError) {
        console.error('⚠️ AI course recommendation generation error:', aiError.message);
        console.log('🔄 Engaging dynamic fallback recommendation generator...');
        courses = null;
      }
    }

    // If courses is still null or empty, use our dynamic tailored fallback
    if (!courses || courses.length === 0) {
      courses = generateTailoredFallbackResources(missingSkills, company, role);
    }

    // Safely save to database if user is authenticated
    let recommendationId = null;
    if (req.user && req.user._id) {
      try {
        const recommendation = new CourseRecommendation({
          userId: req.user._id,
          company,
          role,
          missingSkills,
          recommendations: courses
        });
        await recommendation.save();
        recommendationId = recommendation._id;
        console.log('✅ Saved course recommendations to database');
      } catch (dbSaveError) {
        console.warn('Could not persist recommendations to DB (non-fatal):', dbSaveError.message);
      }
    }

    return res.json({
      success: true,
      message: `Found ${courses.length} targeted learning resources for ${role}!`,
      recommendations: courses,
      recommendationId
    });

  } catch (error) {
    console.error('❌ Critical error in /recommend-courses:', error);
    // Provide safe fallback response even in worst-case error
    const fallback = generateTailoredFallbackResources(req.body?.missingSkills, req.body?.company, req.body?.role);
    return res.json({
      success: true,
      message: 'Generated recommended learning roadmap',
      recommendations: fallback,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get saved recommendations
router.get('/my-recommendations', auth, async (req, res) => {
  try {
    await connectDB();
    if (!req.user || !req.user._id) {
      return res.json({ success: true, recommendations: [] });
    }

    const recommendations = await CourseRecommendation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
});

module.exports = router;
