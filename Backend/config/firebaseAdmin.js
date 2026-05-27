const admin = require('firebase-admin');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
}
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Prevent re-initialization error if the file is imported multiple times
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
