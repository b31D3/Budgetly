export const GIVEAWAY_CONTEST_ID = "budgetly-student-giveaway";
export const GIVEAWAY_RULES_VERSION = "2026-11-05";

export const GIVEAWAY_CONTEST = {
  contestName: "Budgetly Student Giveaway",
  organizerLegalName: "Budgetly",
  organizerContactEmail: "hello@budgetly.finance",
  openingDateTime: "2026-11-06T00:00:00-04:00",
  closingDateTime: "2026-11-17T23:59:59-04:00",
  drawDateTime: "2026-11-19T12:00:00-04:00",
  timeZone: "America/Moncton",
  prizeDescription: "CAD $30 gift card",
  retailer: "Retailer to be confirmed before launch",
  prizeValue: "CAD $30",
  prizeCount: 1,
  eligibleLocation: "New Brunswick, Canada",
  minimumAge: 19,
  eligibility: "Currently enrolled post-secondary students",
  entryLimit: "One entry per person",
  responseDeadlineDays: 5,
  prizeDeliveryDays: 14,
  privacyPolicyUrl: "/privacy-policy",
};

const requiredFields = [
  GIVEAWAY_CONTEST.contestName,
  GIVEAWAY_CONTEST.organizerLegalName,
  GIVEAWAY_CONTEST.organizerContactEmail,
  GIVEAWAY_CONTEST.openingDateTime,
  GIVEAWAY_CONTEST.closingDateTime,
  GIVEAWAY_CONTEST.drawDateTime,
  GIVEAWAY_CONTEST.prizeDescription,
  GIVEAWAY_CONTEST.retailer,
  GIVEAWAY_CONTEST.eligibleLocation,
  GIVEAWAY_CONTEST.privacyPolicyUrl,
] as const;

export const isContestConfigurationReady = () =>
  requiredFields.every((value) => typeof value === "string" && value.trim().length > 0);

export const parseContestTimestamp = (value: string) => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time);
};

export const isContestOpen = (now = new Date()) => {
  if (!isContestConfigurationReady()) return false;

  const opening = parseContestTimestamp(GIVEAWAY_CONTEST.openingDateTime);
  const closing = parseContestTimestamp(GIVEAWAY_CONTEST.closingDateTime);

  if (!opening || !closing) return false;
  return now >= opening && now < closing;
};

export const isContestClosed = (now = new Date()) => {
  if (!isContestConfigurationReady()) return false;

  const closing = parseContestTimestamp(GIVEAWAY_CONTEST.closingDateTime);
  if (!closing) return false;

  return now >= closing;
};

export const formatContestDate = (value: string) => {
  if (!value) return "TBD – finalize before launch";

  const date = parseContestTimestamp(value);
  if (!date) return "TBD – finalize before launch";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: GIVEAWAY_CONTEST.timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isEligibleEntry = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
