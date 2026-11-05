# Student Giveaway Setup Guide

## Files added

- `src/pages/Giveaway.tsx` – public giveaway landing page and free entry form
- `src/lib/giveaway.ts` – frontend helper for calling the secure Cloud Function
- `src/config/giveaway.ts` – contest configuration and launch checks
- `functions/giveawayFunctions.js` – server-side callable functions for entry submission and winner draw
- `firestore.rules` – Firestore access controls for giveaway data

## Required configuration before launch

Update the values in `src/config/giveaway.ts` before opening the contest:

- `contestName`
- `organizerLegalName`
- `organizerContactEmail`
- `openingDateTime`
- `closingDateTime`
- `drawDateTime`
- `prizeDescription`
- `retailer`
- `privacyPolicyUrl`

The page will not open until these required values are finalized and the dates are set.

## Firebase setup

1. In your Firebase project, enable Cloud Firestore.
2. Ensure Firebase Functions is initialized for the project.
3. Deploy the function file from `functions/giveawayFunctions.js` using:
   `firebase deploy --only functions`
4. Deploy the Firestore rules using:
   `firebase deploy --only firestore:rules`
5. Confirm that your web app has the Firebase project environment variables configured in `.env` or your hosting environment.
6. Ensure your admin user has the `admin` custom claim via a secure backend admin function or script.

## Security notes

- Public visitors can submit entries but cannot read contest entries.
- The backend uses a server-side atomic duplicate check keyed to the normalized email hash.
- Rate limiting is applied at the callable-function level.
- Winner selection is only allowed for authenticated admin users.
- Winner data is not publicly exposed.

## Testing checklist

- Entry form works without a Budgetly account.
- Duplicate email submissions return a neutral response.
- Invalid email format is rejected.
- Submissions before opening and after closing are blocked.
- Marketing consent defaults to unchecked.
- Firestore rules reject public reads and writes outside the approved giveaway entry creation path.
- Draw is blocked unless the contest is closed and the user has admin privileges.
- Admin redraw process is preserved for disqualification or non-response scenarios.

## Firebase billing/costs

This feature uses the standard Firebase pay-as-you-go model:

- Firestore reads/writes for contest entry storage and draw audits
- Cloud Functions invocations for entry submission and winner selection
- Optional Firebase Analytics events for aggregate traffic measurement

If you are using the free Firebase Spark plan, some project features and usage limits may not be available. Most contest traffic should remain low-cost for a single small giveaway, but production use should be verified against your project plan.

## Legal/operational items to finalize

Before launch, confirm:

- final organizer legal name and contact email
- official prize retailer and redemption terms
- exact contest dates and time zone
- final eligibility wording and student verification process
- winner verification and skill-testing question process
- privacy retention period for contest records
- whether marketing emails require separate consent management outside this form
- campaign attribution method if you want to track poster QR performance
