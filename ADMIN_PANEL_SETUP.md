# Admin Panel Setup Guide

## Overview
The Admin Panel provides a comprehensive dashboard for managing Budgetly users, feedback, and analytics.

## Features

### 1. User Management
- View all registered users
- Search users by name or email
- View detailed user information including:
  - Name and email
  - User ID
  - Join date
  - Last login date
  - Number of calculations created
  - Number of scenarios created

### 2. Feedback Management
- View all user feedback submissions
- Search feedback by message content
- View full feedback details including:
  - Complete message
  - Submission timestamp
  - User agent information
- Delete individual feedback entries

### 3. Analytics Dashboard
- Total number of users
- Total calculations created
- Average semesters per calculation
- Average tuition amount
- More metrics coming soon

## Access Control

### Admin Access

The admin panel is restricted to a single email address for security:
- **Admin Email:** `your-admin-email@gmail.com`

Only this email address can access the admin panel at `/admin`. Any other user attempting to access the admin panel will be redirected to the dashboard with an "Access denied" message.

### Changing the Admin Email

To change the admin email:

1. Open `src/pages/Admin.tsx`
2. Find the `ADMIN_EMAIL` constant (around line 102):
   ```typescript
   const ADMIN_EMAIL = "your-admin-email@gmail.com";
   ```
3. Update it to your desired email address

### Accessing the Admin Panel

1. Sign in with the admin email account: `your-admin-email@gmail.com`
2. Navigate to `/admin` or `https://yourdomain.com/admin`
3. Any other email will be redirected to the dashboard with an error message

## Firebase Setup Requirements

### Users Collection
The admin panel expects a `users` collection in Firestore with the following structure:

```typescript
{
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  calculationsCount: number;
  scenariosCount: number;
}
```

**To create this collection:**
1. Update your sign-up process to create a user document when users register
2. Add to `src/pages/SignUp.tsx` after successful authentication:
   ```typescript
   import { doc, setDoc, serverTimestamp } from "firebase/firestore";

   // After user is created
   await setDoc(doc(db, "users", user.uid), {
     email: user.email,
     displayName: user.displayName || "",
     photoURL: user.photoURL || "",
     createdAt: serverTimestamp(),
     lastLoginAt: serverTimestamp(),
     calculationsCount: 0,
     scenariosCount: 0,
   });
   ```

### Feedback Collection
Already implemented in `src/components/Footer.tsx`. Feedback is saved to the `feedback` collection with:
- `message`: string
- `timestamp`: Timestamp
- `userAgent`: string

### Calculations Collection
Already exists in your app. Used for analytics.

## Firestore Security Rules

Update your Firestore security rules to protect admin data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can read their own data, admin can read all
    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId ||
         request.auth.token.email == 'your-admin-email@gmail.com');
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Feedback collection - anyone can create, only admin can read/delete
    match /feedback/{feedbackId} {
      allow create: if true;
      allow read, delete: if request.auth != null &&
        request.auth.token.email == 'your-admin-email@gmail.com';
    }

    // Calculations - users can only access their own
    match /calculations/{calculationId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Scenarios - users can only access their own
    match /scenarios/{scenarioId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Enhanced Security (Optional)

For better security, you can add a custom claim to admin users using Firebase Admin SDK:

1. Set up Firebase Admin SDK in a Cloud Function
2. Create a function to add admin claim:
   ```javascript
   const admin = require('firebase-admin');

   exports.setAdminClaim = functions.https.onCall(async (data, context) => {
     // Only existing admins can make new admins
     if (!context.auth.token.admin) {
       throw new functions.https.HttpsError('permission-denied', 'Only admins can create admins');
     }

     await admin.auth().setCustomUserClaims(data.uid, { admin: true });
     return { message: 'Success' };
   });
   ```

3. Update `src/pages/Admin.tsx` to check for custom claim:
   ```typescript
   // Replace ADMIN_EMAILS check with:
   const userToken = await currentUser.getIdTokenResult();
   if (!userToken.claims.admin) {
     toast.error("Access denied. Admin privileges required.");
     navigate("/dashboard");
     return;
   }
   ```

## Troubleshooting

### "No users found" in Users tab
- Make sure you've created the users collection in Firestore
- Update your sign-up process to create user documents
- Check Firebase security rules allow reading the users collection

### "Access denied" error
- Verify you're signed in with the admin email: `your-admin-email@gmail.com`
- Make sure the email in Admin.tsx matches your login email exactly
- Check browser console for detailed error messages

### Feedback not showing
- Verify feedback is being saved from the Footer component
- Check Firebase security rules allow admins to read feedback
- Ensure feedback collection exists in Firestore

## URL Access

Admin panel is available at:
- Local: `http://localhost:5173/admin`
- Production: `https://yourdomain.com/admin`

## Future Enhancements

Consider adding:
- User deletion functionality
- Export data to CSV
- Email users directly from admin panel
- More detailed analytics (user growth charts, etc.)
- Bulk operations (delete multiple feedback items)
- Activity logs
- User roles and permissions management
