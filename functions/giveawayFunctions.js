const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { randomUUID, createHash } = require('node:crypto');

initializeApp();

const db = getFirestore();
const auth = getAuth();

const CONTEST_ID = 'budgetly-student-giveaway';
const RULES_VERSION = '2026-11-05';
const TIME_ZONE = 'America/Moncton';
const rateLimits = new Map();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getContestConfig = () => ({
  contestId: CONTEST_ID,
  contestName: 'Budgetly Student Giveaway',
  organizerLegalName: 'Budgetly',
  organizerContactEmail: 'hello@budgetly.finance',
  openingDateTime: '',
  closingDateTime: '',
  drawDateTime: '',
  timeZone: TIME_ZONE,
  prizeDescription: 'CAD $30 gift card',
  prizeValue: 'CAD $30',
  prizeCount: 1,
  eligibleLocation: 'New Brunswick, Canada',
  minimumAge: 19,
  eligibility: 'Currently enrolled post-secondary students',
  entryLimit: 'One entry per person',
  responseDeadlineDays: 5,
  prizeDeliveryDays: 14,
  privacyPolicyUrl: '/privacy-policy',
  rulesVersion: RULES_VERSION,
});

const isContestOpen = (now = new Date()) => {
  const config = getContestConfig();
  if (!config.openingDateTime || !config.closingDateTime) {
    return false;
  }
  const start = new Date(config.openingDateTime).getTime();
  const end = new Date(config.closingDateTime).getTime();
  return Number.isFinite(start) && Number.isFinite(end) && now >= start && now < end;
};

const enforceRateLimit = (identifier) => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 5;
  const current = rateLimits.get(identifier) || [];
  const valid = current.filter((ts) => ts > now - windowMs);
  valid.push(now);
  if (valid.length > limit) {
    rateLimits.set(identifier, valid);
    return false;
  }
  rateLimits.set(identifier, valid);
  return true;
};

const isAdminUser = async (uid) => {
  const user = await auth.getUser(uid);
  const claims = user.customClaims || {};
  return claims.admin === true;
};

const getClientIdentifier = (context) => {
  const forwarded = context?.rawRequest?.headers?.['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return context?.rawRequest?.ip || 'anonymous';
};

exports.submitGiveawayEntry = onCall({
  region: 'us-central1',
  maxInstances: 10,
}, async (request) => {
  const payload = request.data || {};
  const clientIdentifier = getClientIdentifier(request);

  if (!enforceRateLimit(clientIdentifier)) {
    throw new HttpsError('resource-exhausted', 'Too many requests. Please try again in a few minutes.');
  }

  if (!payload.email || !payload.eligibilityConfirmed || !payload.rulesAccepted) {
    throw new HttpsError('invalid-argument', 'Missing required information.');
  }

  const contestConfig = getContestConfig();
  const normalizedEmail = normalizeEmail(payload.email);

  if (!validateEmail(normalizedEmail)) {
    throw new HttpsError('invalid-argument', 'Please enter a valid email address.');
  }

  if (!contestConfig || !isContestOpen(new Date())) {
    throw new HttpsError('failed-precondition', 'This giveaway is not currently accepting entries.');
  }

  const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');
  const entryRef = db.collection('giveawayEntries').doc(emailHash);

  const result = await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(entryRef);
    if (existing.exists) {
      return { status: 'duplicate', message: 'Entry already received.' };
    }

    const entryId = randomUUID();
    const entryRecord = {
      entryId,
      contestId: contestConfig.contestId,
      normalizedEmail,
      emailHash,
      eligibilityDeclaration: {
        age19Plus: Boolean(payload.eligibilityConfirmed),
        residentNewBrunswick: Boolean(payload.eligibilityConfirmed),
        currentlyEnrolledPostSecondary: Boolean(payload.eligibilityConfirmed),
      },
      eligibilityConfirmed: Boolean(payload.eligibilityConfirmed),
      rulesAccepted: Boolean(payload.rulesAccepted),
      acceptedContestRulesVersion: payload.rulesVersion || RULES_VERSION,
      marketingConsent: Boolean(payload.marketingConsent),
      entryValidationStatus: 'accepted',
      submittedAt: FieldValue.serverTimestamp(),
      source: request.rawRequest?.headers?.['user-agent'] || 'public',
    };

    transaction.set(entryRef, entryRecord);
    return { status: 'accepted', entryId };
  });

  if (result.status === 'duplicate') {
    return { status: 'duplicate', message: 'Thanks! Your entry has been recorded for this giveaway.' };
  }

  return { status: 'accepted', entryId: result.entryId };
});

exports.drawGiveawayWinner = onCall({
  region: 'us-central1',
  maxInstances: 5,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required to access this action.');
  }

  const isAdmin = await isAdminUser(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }

  const contestConfig = getContestConfig();
  const now = new Date();

  if (!contestConfig || !isContestOpen(now)) {
    const closing = contestConfig?.closingDateTime ? new Date(contestConfig.closingDateTime) : null;
    if (!closing || now < closing) {
      throw new HttpsError('failed-precondition', 'The contest must be closed before a draw can happen.');
    }
  }

  const entriesSnapshot = await db.collection('giveawayEntries')
    .where('contestId', '==', contestConfig.contestId)
    .where('entryValidationStatus', '==', 'accepted')
    .where('eligibilityConfirmed', '==', true)
    .where('rulesAccepted', '==', true)
    .get();

  const eligibleEntries = entriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (eligibleEntries.length === 0) {
    throw new HttpsError('failed-precondition', 'No eligible entries are available for selection.');
  }

  const drawIndex = cryptoRandomInt(0, eligibleEntries.length - 1);
  const selectedEntry = eligibleEntries[drawIndex];

  const drawId = randomUUID();
  const drawRecord = {
    drawId,
    contestId: contestConfig.contestId,
    drawTimestamp: FieldValue.serverTimestamp(),
    eligibleEntryCount: eligibleEntries.length,
    selectedEntryId: selectedEntry.entryId,
    selectedNormalizedEmailHash: selectedEntry.emailHash,
    drawStatus: 'pending_verification',
    createdBy: request.auth.uid,
  };

  await db.collection('giveawayDraws').doc(drawId).set(drawRecord);
  await db.collection('giveawayEntries').doc(selectedEntry.id).update({
    winnerSelected: true,
    winnerSelectionStatus: 'pending_verification',
    selectedAt: FieldValue.serverTimestamp(),
    selectedDrawId: drawId,
  });

  return {
    status: 'selected',
    drawId,
    eligibleEntryCount: eligibleEntries.length,
    selectedEntryId: selectedEntry.entryId,
  };
});

function cryptoRandomInt(min, max) {
  const range = max - min + 1;
  const bytesNeeded = 4;
  const maxValue = 2 ** (bytesNeeded * 8) - 1;
  const randomBytes = require('node:crypto').randomBytes(bytesNeeded);
  const randomValue = randomBytes.readUInt32BE(0);
  return min + (randomValue % range);
}

exports.redrawGiveawayWinner = onCall({
  region: 'us-central1',
  maxInstances: 5,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required to access this action.');
  }

  const isAdmin = await isAdminUser(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }

  const { previousDrawId } = request.data || {};
  if (!previousDrawId) {
    throw new HttpsError('invalid-argument', 'A previous draw ID is required for a redraw.');
  }

  const drawDoc = await db.collection('giveawayDraws').doc(previousDrawId).get();
  if (!drawDoc.exists) {
    throw new HttpsError('not-found', 'The prior draw could not be found.');
  }

  const drawData = drawDoc.data();
  if (drawData.drawStatus === 'completed') {
    throw new HttpsError('failed-precondition', 'This draw cannot be repeated unless the documented redraw process is followed.');
  }

  const entriesSnapshot = await db.collection('giveawayEntries')
    .where('contestId', '==', CONTEST_ID)
    .where('entryValidationStatus', '==', 'accepted')
    .where('eligibilityConfirmed', '==', true)
    .where('rulesAccepted', '==', true)
    .get();

  const eligibleEntries = entriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((entry) => entry.entryId !== drawData.selectedEntryId);

  if (eligibleEntries.length === 0) {
    throw new HttpsError('failed-precondition', 'No alternate eligible entries are available for redraw.');
  }

  const drawIndex = cryptoRandomInt(0, eligibleEntries.length - 1);
  const selectedEntry = eligibleEntries[drawIndex];

  const redrawId = randomUUID();
  await db.collection('giveawayDraws').doc(redrawId).set({
    redrawId,
    previousDrawId,
    contestId: CONTEST_ID,
    drawTimestamp: FieldValue.serverTimestamp(),
    eligibleEntryCount: eligibleEntries.length,
    selectedEntryId: selectedEntry.entryId,
    selectedNormalizedEmailHash: selectedEntry.emailHash,
    drawStatus: 'pending_verification',
    createdBy: request.auth.uid,
  });

  await db.collection('giveawayEntries').doc(selectedEntry.id).update({
    winnerSelected: true,
    winnerSelectionStatus: 'pending_verification',
    selectedAt: FieldValue.serverTimestamp(),
    selectedDrawId: redrawId,
  });

  return {
    status: 'redrawn',
    redrawId,
    eligibleEntryCount: eligibleEntries.length,
    selectedEntryId: selectedEntry.entryId,
  };
});
