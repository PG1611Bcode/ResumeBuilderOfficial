const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const authRoutes = require('./auth.route');

// Sync user from Firebase to MongoDB
router.post('/sync', userController.syncUser);

// Profile management
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// Aliases for auth endpoints mounted under /users (e.g., /users/login, /users/register, /users/auth/...)
router.use('/auth', authRoutes);
router.use('/', authRoutes);

module.exports = router;
