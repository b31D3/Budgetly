/**
 * Firebase Cloud Functions for Budgetly
 *
 * SETUP INSTRUCTIONS:
 * 1. Run: firebase init functions
 * 2. Copy this code to functions/index.js
 * 3. Install dependencies: cd functions && npm install
 * 4. Set environment variable: firebase functions:config:set admin.secret="YOUR_SECRET_KEY"
 * 5. Deploy: firebase deploy --only functions
 *
 * SECURITY WARNING:
 * - After setting admin claim, DISABLE or DELETE these functions
 * - Never leave setAdminByEmail publicly accessible
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Set admin custom claim by email
 *
 * USAGE (one time only):
 * 1. Call this function with your admin email and secret
 * 2. Sign out and sign back in
 * 3. DELETE or DISABLE this function
 *
 * Example call from browser:
 * const setAdmin = firebase.functions().httpsCallable('setAdminByEmail');
 * setAdmin({ email: 'youremail@gmail.com', secret: 'your-secret' })
 */
exports.setAdminByEmail = functions.https.onCall(async (data, context) => {
  const { email, secret } = data;

  // Validate inputs
  if (!email || !secret) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and secret are required'
    );
  }

  // Get secret from environment config
  const adminSecret = functions.config().admin?.secret || process.env.ADMIN_SECRET;

  // Verify secret key
  if (secret !== adminSecret) {
    console.error('Invalid secret attempt for email:', email);
    throw new functions.https.HttpsError(
      'permission-denied',
      'Invalid secret key'
    );
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Check if already admin
    const currentClaims = (await admin.auth().getUser(user.uid)).customClaims || {};
    if (currentClaims.admin) {
      return {
        message: `User ${email} is already an admin`,
        uid: user.uid,
        alreadyAdmin: true
      };
    }

    // Set custom admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    // Log success
    console.log(`Admin claim set for user: ${email} (${user.uid})`);

    return {
      message: `Successfully set admin claim for ${email}`,
      uid: user.uid,
      success: true
    };
  } catch (error) {
    console.error('Error setting admin claim:', error);

    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError(
        'not-found',
        'No user found with this email. Please create account first.'
      );
    }

    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Remove admin claim (optional - for safety)
 *
 * Use this if you accidentally set admin on wrong account
 */
exports.removeAdminClaim = functions.https.onCall(async (data, context) => {
  const { email, secret } = data;

  // Validate inputs
  if (!email || !secret) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and secret are required'
    );
  }

  // Get secret from environment config
  const adminSecret = functions.config().admin?.secret || process.env.ADMIN_SECRET;

  // Verify secret key
  if (secret !== adminSecret) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Invalid secret key'
    );
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Remove admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: false });

    console.log(`Admin claim removed for user: ${email} (${user.uid})`);

    return {
      message: `Successfully removed admin claim from ${email}`,
      uid: user.uid,
      success: true
    };
  } catch (error) {
    console.error('Error removing admin claim:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Check if a user has admin claim (for debugging)
 *
 * This function is safe to keep enabled
 */
exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
  // Must be authenticated to check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be signed in to check admin status'
    );
  }

  try {
    const user = await admin.auth().getUser(context.auth.uid);
    const claims = user.customClaims || {};

    return {
      uid: context.auth.uid,
      email: user.email,
      isAdmin: claims.admin === true,
      claims: claims
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * OPTIONAL: Automatically create user document on signup
 *
 * This creates a Firestore document when a user signs up
 * Useful for the admin panel's Users tab
 */
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      calculationsCount: 0,
      scenariosCount: 0
    });

    console.log(`User document created for: ${user.email}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

/**
 * OPTIONAL: Update last login time
 *
 * This is a security audit feature
 */
exports.updateLastLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not signed in');
  }

  try {
    await admin.firestore().collection('users').doc(context.auth.uid).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    // User document might not exist yet - that's ok
    console.log('Could not update last login:', error.message);
    return { success: false };
  }
});
