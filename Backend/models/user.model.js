const mongoose = require('mongoose');
// Removed jsonwebtoken and bcrypt

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First Name must be at least 3 characters long'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Last Name must be at least 3 characters long'],
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long'],
    },
    // Firebase Auth UID
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    // Resume Information
    profile: {
        phone: {
            type: String,
            // required: true,
            // minlength: [10, 'Phone number must be at least 10 characters long'],
            trim: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        linkedIn: String,
        github: String,
        portfolio: String,
        profileImage: String, // URL to profile image
        summary: {
            type: String,
            maxlength: [500, 'Summary must be less than 500 characters']
        }
    },

    // Work Experience
    experience: [{
        company: {
            type: String,
            // required: true
        },
        position: {
            type: String,
            // required: true
        },
        startDate: {
            type: Date,
            // required: true
        },
        endDate: Date, // null if current job
        isCurrentJob: {
            type: Boolean,
            default: false
        },
        location: String,
        description: {
            type: String,
            maxlength: [1000, 'Description must be less than 1000 characters']
        },
        responsibilities: [String],
        achievements: [String]
    }],

    // Education
    education: [{
        institution: {
            type: String,
            required: true
        },
        degree: {
            type: String,
            required: true
        },
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        gpa: Number,
        location: String,
        description: String
    }],

    // Skills
    skills: {
        technical: [String],
        soft: [String],
        languages: [{
            language: String,
            proficiency: {
                type: String,
                enum: ['Beginner', 'Intermediate', 'Advanced', 'Native']
            }
        }]
    },

    // Projects
    projects: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            maxlength: [500, 'Project description must be less than 500 characters']
        },
        technologies: [String],
        startDate: Date,
        endDate: Date,
        projectUrl: String,
        githubUrl: String,
        images: [String] // URLs to project images
    }],

    // Certifications
    certifications: [{
        name: {
            type: String,
            required: true
        },
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String
    }],

    // Awards and Achievements
    awards: [{
        title: {
            type: String,
            // required: true
        },
        issuer: String,
        date: Date,
        description: String
    }],

    // Volunteer Experience
    volunteer: [{
        organization: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String
    }],

    // Interests/Hobbies
    interests: [String],
}, {
    timestamps: true
});

// Removed generateAuthToken, comparePassword, and hashPassword

// Additional helper methods for resume building
userSchema.methods.getResumeData = function() {
    return {
        personalInfo: {
            fullname: this.fullname,
            email: this.email,
            phone: this.profile?.phone,
            address: this.profile?.address,
            linkedIn: this.profile?.linkedIn,
            github: this.profile?.github,
            portfolio: this.profile?.portfolio,
            summary: this.profile?.summary
        },
        experience: this.experience,
        education: this.education,
        skills: this.skills,
        projects: this.projects,
        certifications: this.certifications,
        awards: this.awards,
        volunteer: this.volunteer,
        interests: this.interests
    };
};

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
