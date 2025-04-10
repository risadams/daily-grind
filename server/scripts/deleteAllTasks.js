const mongoose = require('mongoose');
const Task = require('../models/task');
const connectToMongoDB = require('../config/mongodb/connection');

/**
 * Script to delete all tasks from the database
 * 
 * USE WITH CAUTION: This will permanently delete all tasks.
 * Intended for development/testing purposes only.
 */
async function deleteAllTasks() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB');

    console.log('Counting tasks before deletion...');
    const taskCount = await Task.countDocuments({});
    console.log(`Found ${taskCount} tasks in the database.`);

    if (taskCount === 0) {
      console.log('No tasks to delete.');
      process.exit(0);
    }

    // Prompt for confirmation
    if (process.argv.indexOf('--force') === -1) {
      console.log('\x1b[31m%s\x1b[0m', 'WARNING: This will permanently delete all tasks from the database!');
      console.log('To proceed without confirmation, run with --force flag.');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise((resolve) => {
        readline.question('Are you sure you want to delete all tasks? Type "DELETE" to confirm: ', (answer) => {
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
    console.log('Deleting all tasks...');
    const result = await Task.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} tasks.`);
    console.log('Operation complete.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting tasks:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllTasks();