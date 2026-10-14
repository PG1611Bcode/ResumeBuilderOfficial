const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF - TEXT-BASED PDFs ONLY
 * Provides helpful guidance for image-based PDFs
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log('📄 Extracting text from PDF...');
    
    const data = await pdfParse(pdfBuffer);
    
    if (!data.text || data.text.trim().length < 50) {
      throw new Error(
        '⚠️ Unable to extract text from this PDF.\n\n' +
        '🔍 Your PDF appears to be image-based (scanned document).\n\n' +
        '✅ To fix this, please convert your resume:\n' +
        '1. Open PDF in your browser (Chrome/Edge)\n' +
        '2. Select all text (Ctrl+A)\n' +
        '3. If you CAN select text → Try re-uploading\n' +
        '4. If you CANNOT select text → It\'s an image PDF\n\n' +
        '📝 For image PDFs, convert using:\n' +
        '• Open in Microsoft Word → Save As PDF\n' +
        '• Open in Google Docs → Download as PDF\n' +
        '• Or use smallpdf.com to convert\n\n' +
        '💡 Tip: Create your resume directly in Word/Google Docs for best results!'
      );
    }
    
    console.log('✓ Successfully extracted', data.text.length, 'characters from PDF');
    return data.text;
    
  } catch (error) {
    console.error('❌ PDF extraction failed:', error.message);
    throw error;
  }
}

module.exports = {
  extractTextFromPDF
};
 