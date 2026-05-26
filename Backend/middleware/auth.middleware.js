const admin = require('../config/firebaseAdmin');
const User = require('../models/user.model');

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find the MongoDB user by email from the Firebase token
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found in database. Please sync your account first.'
      });
    }

    // Attach the full MongoDB user document so req.user._id etc. still work
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
