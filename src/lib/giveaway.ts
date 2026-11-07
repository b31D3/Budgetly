import { httpsCallable } from "firebase/functions";
import { logEvent } from "firebase/analytics";
import { analytics, functions } from "@/lib/firebase";
import { GIVEAWAY_CONTEST_ID, GIVEAWAY_RULES_VERSION, isContestOpen, normalizeEmail } from "@/config/giveaway";

export type GiveawayEntryPayload = {
  email: string;
  eligibilityConfirmed: boolean;
  rulesAccepted: boolean;
  marketingConsent: boolean;
};

export const submitGiveawayEntry = async (payload: GiveawayEntryPayload) => {
  const submit = httpsCallable(functions, "submitGiveawayEntry");
  const result = await submit({
    ...payload,
    email: normalizeEmail(payload.email),
    contestId: GIVEAWAY_CONTEST_ID,
    rulesVersion: GIVEAWAY_RULES_VERSION,
  });

  return result.data as { status: "accepted" | "duplicate" | "closed"; message?: string };
};

export const trackGiveawayMetric = async (eventName: string, params: Record<string, string | number | boolean> = {}) => {
  const analyticsInstance = await analytics;
  if (!analyticsInstance) return;

  logEvent(analyticsInstance, eventName, {
    contest_id: GIVEAWAY_CONTEST_ID,
    ...params,
  });
};

export const giveawayStatus = {
  isOpen: isContestOpen(),
};
