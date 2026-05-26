const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Use the auth middleware that verifies Firebase token AND looks up MongoDB user
const authenticateToken = require('../middleware/auth.middleware');

// Protected profile routes using Firebase token middleware
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;
