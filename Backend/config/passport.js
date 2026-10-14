const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const userModel = require('../models/user.model');
const userService = require('../services/user.service');

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/users/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        
        // Check if user already exists with this Google ID or email
        let user = await userModel.findOne({
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (user) {
            // Update Google ID if user exists but doesn't have it
            if (!user.googleId) {
                user.googleId = profile.id;
                user.provider = 'google';
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        user = await userService.createOAuthUser({
            googleId: profile.id,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName || '',
            email: profile.emails[0].value,
            provider: 'google'
        });

        done(null, user);
    } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
    }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/users/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        
        // Check if user already exists with this GitHub ID or email
        let user = await userModel.findOne({
            $or: [
                { githubId: profile.id },
                { email: profile.emails && profile.emails[0] ? profile.emails[0].value : null }
            ]
        });

        if (user) {
            // Update GitHub ID if user exists but doesn't have it
            if (!user.githubId) {
                user.githubId = profile.id;
                user.provider = 'github';
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.local`;
        const displayName = profile.displayName || profile.username;
        const nameParts = displayName.split(' ');

        user = await userService.createOAuthUser({
            githubId: profile.id,
            firstname: nameParts[0] || profile.username,
            lastname: nameParts.slice(1).join(' ') || '',
            email: email,
            provider: 'github'
        });

        done(null, user);
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        done(error, null);
    }
}));

module.exports = passport;