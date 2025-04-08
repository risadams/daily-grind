const admin = require('firebase-admin');

// Firebase has already been initialized in server.js
const db = admin.firestore();

module.exports = {
  admin,
  db
};