const admin = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Attach the decoded token to the request object
        req.user = decodedToken; 
        // decodedToken contains: uid, email, name, picture, etc.
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return res.status(403).json({ message: 'Unauthorized - Invalid token' });
    }
};

module.exports = verifyToken;
