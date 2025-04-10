const mongoose = require('mongoose');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const connectToMongoDB = require('../config/mongodb/connection');
const User = require('../models/user');
const Ticket = require('../models/ticket');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream/promises');

// Default password for migrated users
const DEFAULT_PASSWORD = 'ChangeMe123!';

// Initialize Firebase Admin (using service account key if available)
try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    console.warn('Firebase service account key not found in env variables. Migration may fail.');
    serviceAccount = require('../../firebase-service-account.json');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

// Connect to MongoDB
connectToMongoDB()
  .then(() => {
    console.log('Connected to MongoDB successfully. Starting migration...');
    migrateData();
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

// Main migration function
async function migrateData() {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // 1. Migrate users
    const userMapping = await migrateUsers();
    
    // 2. Migrate tickets
    await migrateTickets(userMapping);
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Migrate users from Firebase Auth to MongoDB
async function migrateUsers() {
  console.log('Starting user migration...');
  
  // Map to store Firebase UID to MongoDB _id mapping
  const userMapping = {};
  
  try {
    // List Firebase users
    const listUsersResult = await admin.auth().listUsers();
    const firebaseUsers = listUsersResult.users;
    
    console.log(`Found ${firebaseUsers.length} users in Firebase`);
    
    // Process each user
    for (const firebaseUser of firebaseUsers) {
      // Check if user already exists in MongoDB (by email)
      let mongoUser = await User.findOne({ email: firebaseUser.email });
      
      if (mongoUser) {
        console.log(`User ${firebaseUser.email} already exists in MongoDB, skipping`);
        userMapping[firebaseUser.uid] = mongoUser._id;
        continue;
      }
      
      // Create new user in MongoDB
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      
      mongoUser = new User({
        email: firebaseUser.email,
        password: hashedPassword,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date(firebaseUser.metadata.creationTime)
      });
      
      // Save user to MongoDB
      await mongoUser.save();
      console.log(`Migrated user ${mongoUser.email} to MongoDB`);
      
      // Store mapping of Firebase UID to MongoDB _id
      userMapping[firebaseUser.uid] = mongoUser._id;
      
      // Download profile picture if exists
      if (firebaseUser.photoURL) {
        try {
          const filename = `${Date.now()}-${firebaseUser.uid}-profile.jpg`;
          const filepath = path.join(__dirname, '../uploads', filename);
          
          const response = await axios.get(firebaseUser.photoURL, { responseType: 'stream' });
          await pipeline(response.data, fs.createWriteStream(filepath));
          
          // Update user with new local photo URL
          mongoUser.photoURL = `/uploads/${filename}`;
          await mongoUser.save();
          
          console.log(`Downloaded profile picture for ${mongoUser.email}`);
        } catch (err) {
          console.warn(`Failed to download profile picture for ${mongoUser.email}:`, err.message);
        }
      }
    }
    
    console.log(`Migrated ${Object.keys(userMapping).length} users to MongoDB`);
    return userMapping;
  } catch (error) {
    console.error('User migration failed:', error);
    throw error;
  }
}

// Migrate tickets from Firestore to MongoDB
async function migrateTickets(userMapping) {
  console.log('Starting ticket migration...');
  
  try {
    // Get tickets from Firestore
    const ticketsSnapshot = await admin.firestore().collection('tickets').get();
    const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${tickets.length} tickets in Firestore`);
    
    // Process each ticket
    for (const ticket of tickets) {
      // Check if ticket already exists in MongoDB
      const existingTicket = await Ticket.findOne({ 
        title: ticket.title,
        description: ticket.description
      });
      
      if (existingTicket) {
        console.log(`Ticket "${ticket.title}" already exists in MongoDB, skipping`);
        continue;
      }
      
      // Map Firebase UIDs to MongoDB _ids
      const createdBy = userMapping[ticket.createdBy] || null;
      const assignedTo = ticket.assignedTo ? userMapping[ticket.assignedTo] : null;
      
      if (!createdBy) {
        console.warn(`Creator user not found for ticket "${ticket.title}", skipping`);
        continue;
      }
      
      // Create new ticket in MongoDB
      const newTicket = new Ticket({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        createdBy: createdBy,
        assignedTo: assignedTo,
        createdAt: ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000) : new Date(),
        updatedAt: ticket.updatedAt ? new Date(ticket.updatedAt.seconds * 1000) : new Date(),
        attachments: []
      });
      
      // Process attachments if they exist
      if (ticket.attachments && ticket.attachments.length > 0) {
        for (const attachment of ticket.attachments) {
          try {
            const filename = `${Date.now()}-${path.basename(attachment.fileUrl)}`;
            const filepath = path.join(__dirname, '../uploads', filename);
            
            const response = await axios.get(attachment.fileUrl, { responseType: 'stream' });
            await pipeline(response.data, fs.createWriteStream(filepath));
            
            newTicket.attachments.push({
              fileName: attachment.fileName || filename,
              fileUrl: `/uploads/${filename}`,
              uploadedAt: attachment.uploadedAt 
                ? new Date(attachment.uploadedAt.seconds * 1000) 
                : new Date()
            });
            
            console.log(`Downloaded attachment for ticket "${ticket.title}"`);
          } catch (err) {
            console.warn(`Failed to download attachment for ticket "${ticket.title}":`, err.message);
          }
        }
      }
      
      // Save ticket to MongoDB
      await newTicket.save();
      console.log(`Migrated ticket "${newTicket.title}" to MongoDB`);
    }
    
    console.log('Ticket migration completed');
  } catch (error) {
    console.error('Ticket migration failed:', error);
    throw error;
  }
}