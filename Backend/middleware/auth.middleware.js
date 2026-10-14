const admin = require('../config/firebase');
const userModel = require('../models/user.model');
const connectDB = require('../db/db');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    try {
        // Ensure database connection is active before querying
        await connectDB();

        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied, no token provided' });
        }

        let user = null;
        let firebaseUid = null;

        // Try Firebase verification first
        try {
            if (admin && admin.apps && admin.apps.length > 0) {
                const decodedToken = await admin.auth().verifyIdToken(token);
                firebaseUid = decodedToken.uid;
                req.firebaseUser = decodedToken;
                user = await userModel.findOne({ firebaseUid });
            }
        } catch (firebaseErr) {
            // Not a Firebase token, fall back to standard JWT verification
        }

        // If not found via Firebase, verify as standard JWT
        if (!user && process.env.JWT_SECRET) {
            try {
                const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
                if (decodedJwt && (decodedJwt.id || decodedJwt._id || decodedJwt.userId)) {
                    const userId = decodedJwt.id || decodedJwt._id || decodedJwt.userId;
                    user = await userModel.findById(userId);
                } else if (decodedJwt && decodedJwt.email) {
                    user = await userModel.findOne({ email: decodedJwt.email });
                }
            } catch (jwtErr) {
                // JWT verification failed
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token. User not found in database.' });
        }

        req.user = user;
        return next();
    } catch (errors) {
        console.error('Authentication middleware error:', errors);
        return res.status(401).json({ success: false, message: 'Token is not valid or database unavailable' });
    }
};

// Export as both default function and named export for cross-compatibility
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;