# Installing MongoDB on Windows

Since MongoDB isn't recognized on your system, you need to install it first. Follow these steps to set up MongoDB on your Windows machine:

## Step 1: Download MongoDB Community Edition

1. Go to the [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Select the following options:
   - Version: MongoDB Community Server (latest version)
   - Platform: Windows
   - Package: MSI
3. Click the "Download" button

## Step 2: Install MongoDB

1. Run the downloaded MSI installer
2. Choose "Complete" installation type
3. **Important**: Check the box that says "Install MongoDB as a Service"
4. You may leave the default data directory (C:\data\db) or specify a custom path
5. Complete the installation

## Step 3: Verify Installation

1. Open Command Prompt as administrator
2. MongoDB should now be installed as a Windows service and running
3. To verify, run:
   ```
   "C:\Program Files\MongoDB\Server\<version>\bin\mongo.exe"
   ```
   (Replace `<version>` with the installed MongoDB version, like 7.0)

## Step 4: Add MongoDB to your PATH

To avoid the "not recognized as an internal or external command" error:

1. Right-click on "This PC" or "My Computer" and select "Properties"
2. Click on "Advanced system settings"
3. Click the "Environment Variables" button
4. Under "System variables", find the "Path" variable and click "Edit"
5. Click "New" and add the MongoDB bin directory path:
   ```
   C:\Program Files\MongoDB\Server\<version>\bin
   ```
   (Replace `<version>` with your installed version)
6. Click "OK" on all dialogs to save changes
7. Close and reopen any command prompt windows

## Step 5: Update Project Configuration

For our Daily Grind application, we'll also modify the MongoDB start script to make it work better with Windows:

1. Open server/package.json and modify the mongodb:start script
2. Update the application to use MongoDB running as a Windows service

## Alternative: Using MongoDB Atlas

If you prefer not to install MongoDB locally, you can use MongoDB Atlas (cloud-hosted MongoDB):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and set up a free tier cluster
3. Configure network access to allow connections from your IP address
4. Create a database user for authentication
5. Get your connection string and update the .env file with:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   ```