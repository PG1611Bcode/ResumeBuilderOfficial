const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/user.model');

// Sync Firebase User with MongoDB
router.post('/sync', verifyToken, async (req, res) => {
    try {
        const { uid, email, name, picture } = req.user;
        
        let user = await User.findOne({ email });
        
        if (!user) {
            // Split name if available, otherwise default to User
            const nameParts = name ? name.split(' ') : ['User'];
            user = new User({
                email,
                fullname: {
                    firstname: nameParts[0],
                    lastname: nameParts.slice(1).join(' ') || ''
                },
                emailVerified: true,
                isFirstTimeUser: true,
                registrationCompleted: true
            });
            await user.save();
        }

        res.json({ success: true, user, isFirstTimeUser: user.isFirstTimeUser });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync user' });
    }
});

// Delete User Account (Sync with Firebase delete)
router.delete('/delete-account', verifyToken, async (req, res) => {
    try {
        const { confirmationText } = req.body;
        const userEmail = req.user.email;

        if (confirmationText !== 'DELETE') {
            return res.status(400).json({
                success: false,
                message: 'Please type "DELETE" to confirm account deletion'
            });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await User.findByIdAndDelete(user._id);

        res.json({ success: true, message: 'Account deleted successfully from database' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ success: false, message: 'Account deletion failed' });
    }
});

module.exports = router;