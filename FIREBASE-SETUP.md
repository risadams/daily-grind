# Firebase Configuration for Daily Grind

This document provides instructions for setting up and configuring Firebase for the Daily Grind application.

## Setup Instructions

1. **Install Firebase CLI**
   ```
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```
   firebase init
   ```
   - Select Firestore, Hosting, and Authentication
   - Choose your Firebase project
   - Accept the default file locations

## Firebase Security Rules

The application requires proper Firestore security rules to function correctly. You can deploy the included `firestore.rules` file using:

```
firebase deploy --only firestore:rules
```

### Default Security Rules

We've configured the security rules to:
- Allow authenticated users to read all data
- Restrict write operations based on user roles and ownership
- Protect sensitive data from unauthorized access

## Environment Variables

Make sure your `.env` file contains all the necessary Firebase configuration variables:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Migrating Data to Firebase

To migrate your local JSON data to Firebase:

1. Generate a Firebase service account key:
   - Go to Firebase Console > Project settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file securely

2. Add the service account key to your `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```
   The value should be the entire JSON content as a string with quotes escaped.

3. Run the migration script:
   ```
   npm run migrate-to-firebase
   ```

## Troubleshooting

### "Missing or insufficient permissions" Error

If you see this error:
1. Make sure you're properly authenticated in your app
2. Check that your Firestore security rules are correctly deployed
3. Verify that the authenticated user has the required permissions

### Data Not Loading

If data isn't loading:
1. Check the browser console for errors
2. Verify your Firebase configuration in `.env`
3. Make sure Firestore is properly initialized in your app
4. Check that your collections exist in the Firebase Console