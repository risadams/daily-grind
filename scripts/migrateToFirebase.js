// Script to migrate local JSON data to Firebase Firestore using Admin SDK
import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  
  if (!serviceAccount.project_id) {
    console.error('Invalid Firebase service account key. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is properly set in your .env file');
    process.exit(1);
  }
  
  initializeApp({
    credential: cert(serviceAccount)
  });

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.log('\nTo fix this, you need to:');
  console.log('1. Go to Firebase Console > Project settings > Service accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the JSON file and set its contents as FIREBASE_SERVICE_ACCOUNT_KEY in your .env file');
  console.log('   The value should be the entire JSON as a string, with quotes escaped');
  process.exit(1);
}

// Initialize Firestore
const db = getFirestore();

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const data = readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

// Migrate users data
const migrateUsers = async () => {
  try {
    const userData = readJsonFile('./data/users.json');
    
    if (!userData || !userData.users) {
      console.error('Invalid or empty users data');
      return;
    }
    
    console.log(`Migrating ${userData.users.length} users...`);
    const batch = db.batch();
    
    for (const user of userData.users) {
      const userRef = db.collection('users').doc(String(user.id));
      batch.set(userRef, {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Prepared user: ${user.firstname} ${user.lastname}`);
    }
    
    await batch.commit();
    console.log('Users migration completed!');
  } catch (error) {
    console.error('Error migrating users:', error);
  }
};

// Migrate tickets data
const migrateTickets = async () => {
  try {
    const ticketData = readJsonFile('./data/tickets.json');
    
    if (!ticketData || !ticketData.tickets) {
      console.error('Invalid or empty tickets data');
      return;
    }
    
    console.log(`Migrating ${ticketData.tickets.length} tickets...`);
    
    // Use batched writes for better performance and atomicity
    const batches = [];
    const batchSize = 500; // Firestore limit is 500 operations per batch
    
    for (let i = 0; i < ticketData.tickets.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = ticketData.tickets.slice(i, i + batchSize);
      
      for (const ticket of currentBatch) {
        const ticketRef = db.collection('tickets').doc(String(ticket.id));
        // Ensure creationDate is a Date object
        batch.set(ticketRef, {
          ...ticket,
          creationDate: new Date(ticket.creationDate)
        });
        console.log(`Prepared ticket: ${ticket.title}`);
      }
      
      batches.push(batch.commit());
    }
    
    await Promise.all(batches);
    console.log('Tickets migration completed!');
  } catch (error) {
    console.error('Error migrating tickets:', error);
  }
};

// Migrate types data
const migrateTypes = async () => {
  try {
    const typeData = readJsonFile('./data/types.json');
    
    if (!typeData || !typeData.types) {
      console.error('Invalid or empty types data');
      return;
    }
    
    console.log(`Migrating ${typeData.types.length} types...`);
    const batch = db.batch();
    
    for (const type of typeData.types) {
      const typeRef = db.collection('types').doc(String(type.id));
      batch.set(typeRef, type);
      console.log(`Prepared type: ${type.name}`);
    }
    
    await batch.commit();
    console.log('Types migration completed!');
  } catch (error) {
    console.error('Error migrating types:', error);
  }
};

// Migrate states data
const migrateStates = async () => {
  try {
    const stateData = readJsonFile('./data/states.json');
    
    if (!stateData || !stateData.states) {
      console.error('Invalid or empty states data');
      return;
    }
    
    console.log(`Migrating ${stateData.states.length} states...`);
    const batch = db.batch();
    
    for (const state of stateData.states) {
      const stateRef = db.collection('states').doc(String(state.id));
      batch.set(stateRef, state);
      console.log(`Prepared state: ${state.name}`);
    }
    
    await batch.commit();
    console.log('States migration completed!');
  } catch (error) {
    console.error('Error migrating states:', error);
  }
};

// Migrate ticket links data
const migrateTicketLinks = async () => {
  try {
    const linkData = readJsonFile('./data/ticketLinks.json');
    
    if (!linkData || !linkData.ticketLinks) {
      console.error('Invalid or empty ticket links data');
      return;
    }
    
    console.log(`Migrating ${linkData.ticketLinks.length} ticket links...`);
    const batch = db.batch();
    
    for (const link of linkData.ticketLinks) {
      const linkRef = db.collection('ticketLinks').doc(String(link.id));
      batch.set(linkRef, link);
      console.log(`Prepared ticket link: ${link.id}`);
    }
    
    await batch.commit();
    console.log('Ticket links migration completed!');
  } catch (error) {
    console.error('Error migrating ticket links:', error);
  }
};

// Run all migrations
const runMigrations = async () => {
  console.log('Starting data migration to Firebase using Admin SDK...');
  
  await migrateUsers();
  await migrateTickets();
  await migrateTypes();
  await migrateStates();
  await migrateTicketLinks();
  
  console.log('All migrations completed successfully!');
  process.exit(0);
};

// Execute migrations
runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});