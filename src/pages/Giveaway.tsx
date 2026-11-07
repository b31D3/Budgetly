import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Gift, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  GIVEAWAY_CONTEST,
  GIVEAWAY_RULES_VERSION,
  isContestConfigurationReady,
  isContestOpen,
  normalizeEmail,
} from "@/config/giveaway";
import { submitGiveawayEntry, trackGiveawayMetric } from "@/lib/giveaway";

const steps = [
  "Visit the giveaway page.",
  "Read the rules and submit a free entry.",
  "One eligible entrant will be selected through a random draw after the contest closes.",
  "The selected entrant must confirm eligibility and answer a mathematical skill-testing question before receiving the prize.",
];

const ruleBullets = [
  "Organizer: Budgetly",
  "Eligibility: 19+ years old, resident of New Brunswick, and presently enrolled at a post-secondary institution.",
  "Contest opens only after required details are finalized and reviewed.",
  "One free entry per person for the contest period.",
  "The odds of winning depend on the number of eligible entries received.",
  "Creating a Budgetly account, completing financial forecasts, answering surveys, or participating in research interviews does not improve your odds.",
  "The selected entrant must answer a mathematical skill-testing question and confirm eligibility before the prize is awarded.",
  "Prize delivery occurs within 14 calendar days after winner verification.",
];

const Giveaway = () => {
  const [email, setEmail] = useState("");
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  const contestReady = useMemo(() => isContestConfigurationReady(), []);
  const contestOpen = useMemo(() => isContestOpen(), []);

  useEffect(() => {
    void trackGiveawayMetric("giveaway_page_view", {
      open: contestOpen,
      contest_ready: contestReady,
    });
  }, [contestOpen, contestReady]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!eligibilityConfirmed) {
      setError("You must confirm that you meet the contest eligibility requirements.");
      return;
    }

    if (!rulesAccepted) {
      setError("You must acknowledge the official contest rules and privacy notice.");
      return;
    }

    if (!contestReady) {
      setError("This contest is not yet open. Required details must be finalized before launch.");
      return;
    }

    if (!contestOpen) {
      setError("This giveaway is currently closed or not yet open.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitGiveawayEntry({
        email: normalizedEmail,
        eligibilityConfirmed,
        rulesAccepted,
        marketingConsent,
      });

      if (response.status === "duplicate") {
        setStatusMessage("Thanks! Your entry has been recorded for this giveaway. One entry per person is allowed.");
        setIsSubmitted(true);
        toast.success("Entry received");
        return;
      }

      if (response.status === "closed") {
        setError("This giveaway is no longer accepting entries.");
        return;
      }

      setStatusMessage("Success! Your free entry has been received. We’ll contact the selected entrant if they are chosen.");
      setIsSubmitted(true);
      setEmail("");
      setEligibilityConfirmed(false);
      setRulesAccepted(false);
      setMarketingConsent(false);
      toast.success("Entry submitted successfully");
      void trackGiveawayMetric("giveaway_entry_submitted", { marketing_consent: marketingConsent });
    } catch (submissionError: unknown) {
      const errorMessage = submissionError instanceof Error ? submissionError.message : "Unable to submit your entry right now. Please try again later.";
      setError(errorMessage);
      toast.error("Unable to submit entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Budgetly
          </Link>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Student giveaway
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Trophy className="h-3.5 w-3.5" />
                Free entry
              </div>

              <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
                WIN A $30 GIFT CARD
              </h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
                Take control of your financial future with Budgetly—and enter our free student giveaway.
              </p>

              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm font-semibold text-primary">
                NO PURCHASE OR BUDGETLY ACCOUNT NECESSARY.
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="#entry-form">
                  <Button size="lg" className="w-full rounded-xl px-6 py-6 text-base font-semibold shadow-lg shadow-primary/10">
                    Enter Giveaway — Free
                  </Button>
                </a>
                <Link to="/signup?source=giveaway">
                  <Button variant="outline" size="lg" className="w-full rounded-xl px-6 py-6 text-base font-semibold">
                    Explore Budgetly
                  </Button>
                </Link>
              </div>

              {!contestReady && (
                <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
                  This giveaway is not yet active. Required contest details must be finalized and reviewed before opening.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-border bg-card p-5 md:p-8">
              <h2 className="mb-5 text-xl font-bold text-foreground">How it works</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-card p-5 md:p-8">
              <h2 className="mb-4 text-xl font-bold text-foreground">Official contest rules</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="font-semibold text-foreground">Quick overview</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {ruleBullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRules((value) => !value)}
                  className="w-full justify-between rounded-xl border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
                >
                  <span>{showRules ? "Hide full rules" : "Read full rules"}</span>
                  {showRules ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {showRules && (
                  <div className="space-y-4 rounded-2xl border border-border bg-background p-4 text-muted-foreground">
                    <div>
                      <p className="font-semibold text-foreground">Organizer</p>
                      <p>{GIVEAWAY_CONTEST.organizerLegalName || "TBD – finalize before launch"}</p>
                      <p>{GIVEAWAY_CONTEST.organizerContactEmail || "TBD – finalize before launch"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Eligibility</p>
                      <p>Entrants must be at least {GIVEAWAY_CONTEST.minimumAge || "19"} years old, reside in {GIVEAWAY_CONTEST.eligibleLocation || "New Brunswick, Canada"}, and be currently enrolled in a post-secondary institution.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Timing</p>
                      <p>Opening date: {GIVEAWAY_CONTEST.openingDateTime ? new Date(GIVEAWAY_CONTEST.openingDateTime).toLocaleString("en-CA", { timeZone: GIVEAWAY_CONTEST.timeZone }) : "TBD – finalize before launch"}</p>
                      <p>Closing date: {GIVEAWAY_CONTEST.closingDateTime ? new Date(GIVEAWAY_CONTEST.closingDateTime).toLocaleString("en-CA", { timeZone: GIVEAWAY_CONTEST.timeZone }) : "TBD – finalize before launch"}</p>
                      <p>Draw date: {GIVEAWAY_CONTEST.drawDateTime ? new Date(GIVEAWAY_CONTEST.drawDateTime).toLocaleString("en-CA", { timeZone: GIVEAWAY_CONTEST.timeZone }) : "TBD – finalize before launch"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Prize</p>
                      <p>{GIVEAWAY_CONTEST.prizeDescription || "Prize details TBD"} with an approximate value of {GIVEAWAY_CONTEST.prizeValue || "CAD $30"}.</p>
                      <p>Total number of prizes: {GIVEAWAY_CONTEST.prizeCount || 1}.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Winner selection and verification</p>
                      <p>One eligible entry will be selected through a random draw after the contest closes. The selected entrant must confirm their eligibility and correctly answer a mathematical skill-testing question before receiving the prize.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Privacy and data handling</p>
                      <p>We collect only the data required to administer the giveaway: email address, eligibility declaration, contest-rules acknowledgment, and marketing-consent status. We retain records for the contest period and any required legal retention period.</p>
                      <Link to={GIVEAWAY_CONTEST.privacyPolicyUrl || "/privacy-policy"} className="text-primary underline">
                        Privacy policy
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside id="entry-form" className="lg:pt-2">
            <Card className="sticky top-4 overflow-hidden border-primary/10 shadow-lg shadow-primary/5">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Free student giveaway</p>
                    <h2 className="text-xl font-bold">Enter now</h2>
                  </div>
                </div>

                {!contestReady ? (
                  <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-100">
                    Contest configuration is incomplete. Launch details must be finalized before entries can open.
                  </div>
                ) : !contestOpen ? (
                  <div className="mb-4 rounded-xl border border-muted bg-muted/40 p-3 text-sm text-muted-foreground">
                    This contest is currently closed or not accepting entries.
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="giveaway-email">Email address</Label>
                    <Input
                      id="giveaway-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="student@unb.ca"
                      autoComplete="email"
                      aria-describedby="giveaway-email-help"
                    />
                    <p id="giveaway-email-help" className="text-xs text-muted-foreground">
                      We use this only for contest administration and winner verification.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-3">
                    <label className="flex items-start gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={eligibilityConfirmed}
                        onCheckedChange={(checked) => setEligibilityConfirmed(Boolean(checked))}
                      />
                      <span>
                        I confirm I am at least 19 years old, I live in New Brunswick, and I am currently enrolled at a post-secondary institution.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={rulesAccepted}
                        onCheckedChange={(checked) => setRulesAccepted(Boolean(checked))}
                      />
                      <span>
                        I acknowledge the official contest rules and privacy notice and agree to the contest terms.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={marketingConsent}
                        onCheckedChange={(checked) => setMarketingConsent(Boolean(checked))}
                      />
                      <span>Optional: I would like to hear about Budgetly updates and student finance tips.</span>
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-100">
                      {error}
                    </div>
                  )}

                  {isSubmitted && statusMessage && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-100" aria-live="polite">
                      {statusMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full rounded-xl py-6 text-base font-semibold"
                    disabled={isSubmitting || !contestReady || !contestOpen}
                  >
                    {isSubmitting ? "Submitting..." : "Enter Giveaway — Free"}
                  </Button>

                  <div className="rounded-2xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Privacy notice
                    </div>
                    <p className="mt-2">
                      We collect your email and eligibility declaration only to manage contest entries, verify eligibility, and communicate with the selected entrant. Marketing consent is optional and separate from participation.
                    </p>
                    <p className="mt-2 text-xs">
                      Rules version: {GIVEAWAY_RULES_VERSION}
                    </p>
                  </div>
                </form>

                {isSubmitted && (
                  <div className="mt-5 space-y-3 border-t border-border pt-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Explore Budgetly
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Budgetly helps students forecast their financial future, identify potential shortfalls, and test major financial decisions before they happen.
                    </p>
                    <Link to="/signup?source=giveaway">
                      <Button variant="outline" className="w-full rounded-xl">
                        Explore Budgetly
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Giveaway;
