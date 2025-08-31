# Firebase Setup Guide

This guide will help you set up Firebase Auth and Firestore for the LocalPro app.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "localpro-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Enable Firestore Database

1. In the Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. In the Firebase Console, click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "localpro-web")
6. Click "Register app"
7. Copy the Firebase configuration object

## 5. Update Firebase Configuration

1. Open `lib/firebase.ts`
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 6. Set Up Firestore Security Rules

In the Firestore Database section, go to "Rules" and update with these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all documents
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read/write their own reviews
    match /reviews/{reviewId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 7. Add Sample Data (Optional)

You can add sample data to test the app. In the Firestore Console:

### Services Collection
Add documents with fields:
- `name` (string)
- `icon` (string)
- `rating` (number)
- `providers` (number)
- `color` (string)
- `description` (string, optional)

### Providers Collection
Add documents with fields:
- `name` (string)
- `service` (string)
- `rating` (number)
- `reviews` (number)
- `avatar` (string)
- `email` (string)

## 8. Test the Setup

1. Run the app: `npm start`
2. Try to sign up with a new account
3. Check if the user is created in Firebase Auth
4. Check if the user profile is created in Firestore

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens when the app is already initialized
   - The current setup should handle this automatically

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Make sure authentication is properly set up

3. **"Network request failed"**
   - Check your internet connection
   - Verify the Firebase configuration is correct

### Security Notes:

- The current setup uses test mode for Firestore
- For production, update the security rules to be more restrictive
- Consider implementing proper user roles and permissions
- Enable additional authentication methods as needed

## Next Steps

1. Implement proper error handling
2. Add loading states for better UX
3. Implement offline support with Firestore cache
4. Add push notifications
5. Implement user profile management
6. Add booking and review functionality
