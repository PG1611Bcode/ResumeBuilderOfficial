const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
  let serviceAccount = null;
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    try {
      serviceAccount = require(serviceAccountPath);
    } catch (e) {
      console.warn('Could not read serviceAccountKey.json:', e.message);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      serviceAccount = raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    } catch (e) {
      console.warn('Could not parse FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully.');
  } else {
    console.warn('⚠️ Firebase Admin SDK could not be initialized: serviceAccountKey.json is missing and FIREBASE_SERVICE_ACCOUNT is not set.');
  }
}

module.exports = admin;
