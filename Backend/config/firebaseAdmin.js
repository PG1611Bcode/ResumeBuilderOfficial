const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Prevent re-initialization error if the file is imported multiple times
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
