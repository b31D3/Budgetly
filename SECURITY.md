# Budgetly Security Guide

## Critical Security Fixes Implemented

### 1. Admin Authentication (CRITICAL - FIXED)

**Previous Vulnerability:**
- Admin email was hardcoded in client-side code
- Anyone could view source code and see admin email
- Client-side checks can be bypassed

**Current Solution:**
- Uses Firebase Custom Claims (server-side only)
- Admin status is set via Firebase Admin SDK
- Cannot be spoofed or bypassed from client-side

## Setting Up Admin Access (Secure Method)

### Step 1: Install Firebase Admin SDK

You need to set up Firebase Cloud Functions to set custom claims.

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Cloud Functions:
```bash
cd "c:\Users\beide\OneDrive\Desktop\Budgetly"
firebase init functions
```

3. Select JavaScript or TypeScript

### Step 2: Create Cloud Function to Set Admin Claim

Create a file `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// One-time function to set admin claim
// IMPORTANT: This should only be called once, then disabled
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // SECURITY: Only allow this function to run in specific conditions
  // Option 1: Only allow from specific IP (your computer)
  // Option 2: Require a secret key
  // Option 3: Manually run via Firebase Console

  const { uid, secret } = data;

  // Replace with a strong secret key
  const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-super-secret-key-12345";

  if (secret !== ADMIN_SECRET) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Invalid secret key'
    );
  }

  try {
    // Set custom admin claim
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    return {
      message: `Successfully set admin claim for user ${uid}`
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Alternative: Set admin by email (use once, then disable)
exports.setAdminByEmail = functions.https.onCall(async (data, context) => {
  const { email, secret } = data;
  const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-super-secret-key-12345";

  if (secret !== ADMIN_SECRET) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Invalid secret key'
    );
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set custom admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    return {
      message: `Successfully set admin claim for ${email}`,
      uid: user.uid
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Step 3: Deploy Cloud Function

```bash
firebase deploy --only functions
```

### Step 4: Call the Function to Set Admin (ONE TIME ONLY)

Create a temporary page or use browser console:

```javascript
const functions = firebase.functions();
const setAdmin = functions.httpsCallable('setAdminByEmail');

setAdmin({
  email: 'beidemariamshumet@gmail.com',
  secret: 'your-super-secret-key-12345'
})
.then(result => {
  console.log(result.data.message);
  // After this, you need to sign out and sign back in
})
.catch(error => {
  console.error('Error:', error);
});
```

### Step 5: Disable or Delete the Function

**IMPORTANT:** After setting the admin claim, either:
1. Delete the Cloud Function
2. Comment out the function code and redeploy
3. Add additional authentication checks

## Updated Firestore Security Rules (Server-Side Admin Check)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin (using custom claims)
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.admin == true;
    }

    // Helper to check if user owns the resource
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own data, admins can read all
      allow read: if isOwner(userId) || isAdmin();
      // Users can only write their own data
      allow write: if isOwner(userId);
      // Anyone authenticated can create (sign up)
      allow create: if request.auth != null;
    }

    // Feedback collection
    match /feedback/{feedbackId} {
      // Anyone can create feedback (including anonymous)
      allow create: if true;
      // Only admins can read and delete
      allow read, delete: if isAdmin();
    }

    // Calculations
    match /calculations/{calculationId} {
      // Users can access their own, admins can read all
      allow read: if isOwner(resource.data.userId) || isAdmin();
      // Users can only create their own
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;
      // Users can update/delete their own
      allow update, delete: if isOwner(resource.data.userId);
    }

    // Scenarios
    match /scenarios/{scenarioId} {
      // Users can access their own, admins can read all
      allow read: if isOwner(resource.data.userId) || isAdmin();
      // Users can only create their own
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;
      // Users can update/delete their own
      allow update, delete: if isOwner(resource.data.userId);
    }
  }
}
```

## Other Security Vulnerabilities & Fixes

### 2. Environment Variables (IMPORTANT)

**Check your `.env` file is in `.gitignore`:**

```bash
# .gitignore should contain:
.env
.env.local
.env.production
```

**Never commit:**
- Firebase API keys in public repos (use environment variables)
- Database credentials
- Secret keys

### 3. Input Validation

All user inputs should be validated:

**Current Risk Areas:**
- Calculator form inputs (numbers only)
- Scenario names (sanitize special characters)
- Feedback messages (limit length, sanitize)

**Recommended Fix:**
Add validation to all form inputs:

```typescript
// Example: Sanitize scenario name
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .substring(0, 100); // Limit length
};
```

### 4. Rate Limiting

**Current Vulnerability:**
- No rate limiting on feedback submissions
- No rate limiting on scenario creation

**Recommended Solution:**
Use Firebase App Check and implement rate limiting in Cloud Functions.

### 5. Data Exposure

**Fixed Issues:**
- ✅ Removed admin email from client-side code
- ✅ Use custom claims instead

**Remaining Considerations:**
- User IDs are visible (this is normal, but be aware)
- Don't store sensitive personal information in Firestore without encryption

### 6. Authentication Security

**Current Implementation:**
- ✅ Email/password authentication
- ✅ Protected routes
- ✅ Server-side validation via Firestore rules

**Recommendations:**
- Enable multi-factor authentication (MFA) for admin account
- Set up email verification requirements
- Implement account lockout after failed login attempts

## Security Testing Guide

### Test 1: Admin Access Control

**What to test:** Verify non-admin users cannot access admin panel

**Steps:**
1. Create a regular user account (not admin email)
2. Sign in with that account
3. Try to navigate to `/admin`
4. Expected: Redirected to dashboard with error message

**How to bypass (what attackers try):**
- Open browser dev tools → Application → Local Storage
- Try to modify any values
- Try to call Firebase functions directly
- Expected: Should still be blocked by Firestore rules

### Test 2: Firestore Security Rules

**What to test:** Users can only access their own data

**Steps:**
1. Sign in as User A
2. Create a calculation
3. Note the document ID in Firestore Console
4. Sign in as User B
5. Try to access User A's calculation via dev tools:
   ```javascript
   firebase.firestore()
     .collection('calculations')
     .doc('USER_A_DOCUMENT_ID')
     .get()
   ```
6. Expected: Permission denied error

### Test 3: SQL Injection / XSS

**What to test:** Input sanitization

**Steps:**
1. Try entering malicious code in forms:
   - `<script>alert('XSS')</script>` in scenario name
   - `'; DROP TABLE users; --` in feedback
   - `<img src=x onerror=alert('XSS')>` in any text field
2. Expected: Input sanitized, no code execution

### Test 4: API Key Exposure

**What to test:** Check if sensitive keys are exposed

**Steps:**
1. View page source (Ctrl+U)
2. Search for keywords: "secret", "key", "password", "admin"
3. Expected: Only public Firebase config (safe to expose)

### Test 5: Unauthorized API Calls

**What to test:** Direct Firestore access without proper auth

**Steps:**
1. Open browser console
2. Try to read protected collection:
   ```javascript
   firebase.firestore().collection('feedback').get()
     .then(snap => console.log(snap.docs.length))
   ```
3. Expected: Permission denied (unless you're admin)

### Test 6: Token Manipulation

**What to test:** Custom claims can't be forged

**Steps:**
1. Sign in as regular user
2. Get ID token:
   ```javascript
   firebase.auth().currentUser.getIdToken()
     .then(token => console.log(token))
   ```
3. Decode token at https://jwt.io
4. Check if "admin" claim exists
5. Try to modify token (won't work - signed by Firebase)
6. Expected: Modified tokens rejected by Firebase

### Test 7: CSRF Protection

**What to test:** Firebase handles CSRF automatically

**Status:** ✅ Firebase SDK includes CSRF protection

### Test 8: Brute Force Protection

**What to test:** Login attempt limits

**Steps:**
1. Try logging in with wrong password multiple times
2. Expected: After several attempts, Firebase blocks IP temporarily

## Security Checklist

Before deploying to production:

- [ ] Admin custom claims configured (not email-based)
- [ ] Firestore security rules tested and deployed
- [ ] Environment variables not committed to git
- [ ] `.env` file in `.gitignore`
- [ ] No console.log statements with sensitive data
- [ ] Input validation on all forms
- [ ] Firebase App Check enabled
- [ ] Admin account has strong password
- [ ] Admin account has 2FA enabled
- [ ] Rate limiting implemented for public endpoints
- [ ] HTTPS enforced (automatic with Firebase Hosting)
- [ ] Regular security audits scheduled

## Reporting Security Issues

If you find a security vulnerability:
1. Do not post publicly
2. Document the vulnerability
3. Create a private security advisory on GitHub
4. Or email: security@yourdomain.com

## Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Cloud Functions Security](https://firebase.google.com/docs/functions/security)
