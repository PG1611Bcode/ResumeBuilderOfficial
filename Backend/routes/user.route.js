const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const { authenticateToken } = require('../middleware/auth.middleware')

// Sync user from Firebase to MongoDB
router.post('/sync', userController.syncUser)

router.get('/profile', authenticateToken, userController.getProfile)
router.put('/profile', authenticateToken, userController.updateProfile)

module.exports = router;
