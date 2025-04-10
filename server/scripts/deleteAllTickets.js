const mongoose = require('mongoose');
const Ticket = require('../models/ticket');
const connectToMongoDB = require('../config/mongodb/connection');

/**
 * Script to delete all tickets from the database
 * 
 * USE WITH CAUTION: This will permanently delete all tickets.
 * Intended for development/testing purposes only.
 */
async function deleteAllTickets() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB');

    console.log('Counting tickets before deletion...');
    const ticketCount = await Ticket.countDocuments({});
    console.log(`Found ${ticketCount} tickets in the database.`);

    if (ticketCount === 0) {
      console.log('No tickets to delete.');
      process.exit(0);
    }

    // Prompt for confirmation
    if (process.argv.indexOf('--force') === -1) {
      console.log('\x1b[31m%s\x1b[0m', 'WARNING: This will permanently delete all tickets from the database!');
      console.log('To proceed without confirmation, run with --force flag.');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise((resolve) => {
        readline.question('Are you sure you want to delete all tickets? Type "DELETE" to confirm: ', (answer) => {
          if (answer !== 'DELETE') {
            console.log('Operation cancelled.');
            process.exit(0);
          }
          readline.close();
          resolve();
        });
      });
    }

    // Perform the deletion
    console.log('Deleting all tickets...');
    const result = await Ticket.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} tickets.`);
    console.log('Operation complete.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting tickets:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllTickets();