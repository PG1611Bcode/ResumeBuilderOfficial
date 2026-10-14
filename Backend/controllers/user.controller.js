const userModel = require('../models/user.model');
const admin = require('../config/firebase');
const connectDB = require('../db/db');

module.exports.syncUser = async (req, res) => {
    try {
        await connectDB();
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });
        
        let decodedToken = null;
        if (admin && admin.apps && admin.apps.length > 0) {
            decodedToken = await admin.auth().verifyIdToken(token);
        } else {
            return res.status(500).json({ message: 'Firebase Admin not initialized' });
        }
        
        let user = await userModel.findOne({ firebaseUid: decodedToken.uid });
        if (!user) {
            // Create user
            user = await userModel.create({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email || decodedToken.uid + '@placeholder.com',
                fullname: {
                    firstname: decodedToken.name?.split(' ')[0] || 'User',
                    lastname: decodedToken.name?.split(' ').slice(1).join(' ') || ''
                }
            });
        }

        // Return user data
        const resumeData = user.getResumeData();
        res.json({ 
            success: true, 
            user: { ...user.toObject(), ...resumeData }
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ message: 'Failed to sync user', error: error.message });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user._id;
        const profileData = req.body;

        const updateData = {
            fullname: profileData.fullname,

            'profile.phone': profileData.profile?.phone,
            'profile.address': profileData.profile?.address,
            'profile.linkedIn': profileData.profile?.linkedIn,
            'profile.github': profileData.profile?.github,
            'profile.portfolio': profileData.profile?.portfolio,
            'profile.summary': profileData.profile?.summary,

            experience: profileData.experience || [],
            education: profileData.education || [],
            projects: profileData.projects || [],
            certifications: profileData.certifications || [],
            awards: profileData.awards || [],
            volunteer: profileData.volunteer || [],
            interests: profileData.interests || [],

            'skills.technical': profileData.skills?.technical || [],
            'skills.soft': profileData.skills?.soft || [],
            'skills.languages': (profileData.skills?.languages || []).map(lang => {
                if (typeof lang === 'string') {
                    return { language: lang, proficiency: 'Intermediate' };
                }
                return lang;
            })
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: false }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports.getProfile = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user._id;
        const user = await userModel.findById(userId).select('+provider');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Use the getResumeData method to return data in the expected format
        const resumeData = user.getResumeData();
        
        res.json({ 
            success: true, 
            user: {
                ...user.toObject(), // Include all user fields
                ...resumeData // Add the personalInfo structure that Profile.jsx expects
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
