# Daily Grind: MongoDB Migration Guide

This guide will help you migrate from Firebase to MongoDB for the Daily Grind application.

## Prerequisites

1. Install MongoDB Community Edition on your system:
   - **Windows Users**: Please follow the detailed instructions in [MONGODB-WINDOWS-INSTALL.md](./MONGODB-WINDOWS-INSTALL.md)
   - **Linux/Mac Users**: [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
   - Make sure MongoDB is available in your PATH

2. Install all required Node.js packages:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ..
   npm install
   ```

## Starting MongoDB Database

### Windows Users
MongoDB should run as a Windows service after installation. To verify:

1. Press Win+R, type "services.msc" and press Enter
2. Find "MongoDB Server" in the list and ensure it's running
3. If not running, right-click and select "Start"

No need to run `npm run mongodb:start` as the service should already be running.

### Linux/Mac Users
Run the following command to start MongoDB with the data directory in your project:

```bash
cd server
npm run mongodb:start:linux
```

This will start MongoDB using the `./data` directory to store your database files.

## Migration from Firebase

If you have existing data in Firebase that you want to migrate to MongoDB, follow these steps:

1. Make sure your Firebase configuration is still available in your `.env` file
2. Make sure MongoDB is installed and running (see above)
3. Run the migration script:
   ```bash
   cd server
   npm run migrate
   ```

**Important Notes:**
- The migration script will create new users with the default password: `ChangeMe123!`
- All users should reset their passwords after migration
- File attachments and profile pictures will be downloaded from Firebase Storage to the local `server/uploads` directory

## Running the Application with MongoDB

1. Ensure MongoDB is running (as a service on Windows or via the start command on Linux/Mac)

2. In one terminal, start the server:
   ```bash
   cd server
   npm run dev
   ```

3. In another terminal, start the client:
   ```bash
   npm start
   ```

Alternatively, you can run both with a single command:
```bash
npm run start:all
```

## Configuration

MongoDB connection and authentication settings are configured in:
- `.env` file in the project root
- `server/config/mongodb/connection.js` for database connection
- `server/config/auth/passport.js` for authentication

## Troubleshooting

**Connection Issues:**
- Windows: Ensure MongoDB is running in the Windows Services
- Linux/Mac: Ensure MongoDB is running via `npm run mongodb:start:linux`
- Check MongoDB connection string in `.env` file
- Default connection is `mongodb://localhost:27017/daily-grind`

**Authentication Issues:**
- JWT tokens are stored in localStorage
- After migration, users need to log in again with their new passwords
- Default migration password is `ChangeMe123!`

**Data Migration Issues:**
- Check the Firebase service account key in `.env`
- Ensure Firebase Admin SDK can access your Firebase project
- Look for error messages during the migration process

## Using MongoDB Atlas (Cloud) Instead of Local MongoDB

If you prefer not to install MongoDB locally:

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and set up a free cluster
2. Update your `.env` file with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/daily-grind?retryWrites=true&w=majority
   ```
3. Ensure your IP address is whitelisted in the MongoDB Atlas Network Access settings