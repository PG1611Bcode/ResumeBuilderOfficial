const express = require('express');
const router = express.Router();
const CoverLetter = require('../models/coverLetter.model');
const { generateCoverLetter, regenerateCoverLetter } = require('../services/coverLetter.service');
const auth = require('../middleware/auth.middleware');
const connectDB = require('../db/db');
const PDFDocument = require('pdfkit');

// Generate a new cover letter
router.post('/generate', auth, async (req, res) => {
  try {
    await connectDB();
    const { userInfo, company, role, jobDescription, template } = req.body;

    // Validation
    if (!userInfo || !company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userInfo, company, and role are required'
      });
    }

    console.log(`📝 Generating cover letter for ${company} - ${role}`);

    // Generate cover letter content using AI
    const content = await generateCoverLetter({
      userInfo,
      company,
      role,
      jobDescription,
      template: template || 'professional'
    });

    // Save to database
    let coverLetter = null;
    if (req.user && req.user._id) {
      coverLetter = new CoverLetter({
        userId: req.user._id,
        company,
        role,
        content,
        userInfo,
        jobDescription,
        template: template || 'professional'
      });

      await coverLetter.save();
      console.log('✅ Cover letter saved to database');
    }

    res.json({
      success: true,
      message: 'Cover letter generated successfully',
      data: {
        id: coverLetter ? coverLetter._id : Date.now().toString(),
        content: content,
        company: company,
        role: role,
        template: template || 'professional',
        createdAt: coverLetter ? coverLetter.createdAt : new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error generating cover letter:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Regenerate an existing cover letter (new version)
router.post('/regenerate/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    // Find the original cover letter
    const originalLetter = await CoverLetter.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!originalLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    console.log(`🔄 Regenerating cover letter for ${originalLetter.company} - ${originalLetter.role}`);

    // Generate new version
    const newContent = await regenerateCoverLetter(
      originalLetter.content,
      originalLetter.userInfo,
      originalLetter.company,
      originalLetter.role
    );

    // Create new version using the model method
    const newVersion = await originalLetter.regenerate(newContent);

    console.log(`✅ Generated version ${newVersion.version}`);

    res.json({
      success: true,
      message: 'Cover letter regenerated successfully',
      data: {
        id: newVersion._id,
        content: newVersion.content,
        company: newVersion.company,
        role: newVersion.role,
        template: newVersion.template,
        version: newVersion.version,
        createdAt: newVersion.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error regenerating cover letter:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's cover letter history
router.get('/history', auth, async (req, res) => {
  try {
    await connectDB();
    const limit = parseInt(req.query.limit) || 20;

    const history = await CoverLetter.getUserHistory(req.user._id, limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error('❌ Error fetching cover letter history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cover letter history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a specific cover letter by ID
router.get('/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    res.json({
      success: true,
      data: coverLetter
    });

  } catch (error) {
    console.error('❌ Error fetching cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Download cover letter as a professional PDF
router.get('/download/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 72, bottom: 72, left: 72, right: 72 }
    });

    const filename = `CoverLetter_${coverLetter.company}_${coverLetter.role}.pdf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- PDF Content Generation ---
    const { name = 'Candidate', email = '', phone = '' } = coverLetter.userInfo || {};

    // Header: Your contact information
    doc.font('Helvetica-Bold').fontSize(16).text(name, { align: 'left' });
    doc.font('Helvetica').fontSize(10).text(`${email} ${phone ? `| ${phone}` : ''}`, { align: 'left' });
    doc.moveDown(2);

    // Main content
    const lines = (coverLetter.content || '').split('\n').filter(line => line.trim() !== '');

    doc.font('Helvetica').fontSize(11);

    lines.forEach(line => {
      if (line.toLowerCase().startsWith('dear') || line.toLowerCase().startsWith('sincerely')) {
        doc.moveDown(1);
        doc.text(line, { align: 'left' });
        doc.moveDown(0.5);
      } else if (line.trim() === name || line.trim() === email || line.trim() === phone) {
        // Skip repeated footer lines
      } else {
        doc.text(line, { align: 'justify', lineGap: 4 });
        doc.moveDown(1);
      }
    });

    doc.end();
    console.log(`✅ PDF generated and streamed: ${filename}`);

  } catch (error) {
    console.error('❌ Error downloading cover letter PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a cover letter
router.delete('/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const result = await CoverLetter.deleteOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    res.json({
      success: true,
      message: 'Cover letter deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;