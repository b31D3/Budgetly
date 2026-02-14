import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BadgeDollarSign,
  HandCoins,
  BarChart3,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// ─── Bubble config ───
const bubbles = [
  // Top area
  { size: 14, x: "15%", y: "5%",  color: "bg-red-200/60", dur: 6,  dx: 18,  dy: 12  },
  { size: 22, x: "30%", y: "8%",  color: "bg-red-300/50", dur: 8,  dx: -14, dy: 20  },
  { size: 38, x: "48%", y: "3%",  color: "bg-red-400/40", dur: 10, dx: 10,  dy: -16 },
  { size: 28, x: "62%", y: "6%",  color: "bg-red-300/45", dur: 7,  dx: -20, dy: 14  },
  { size: 16, x: "78%", y: "4%",  color: "bg-red-200/55", dur: 9,  dx: 12,  dy: 18  },
  // Left side
  { size: 10, x: "3%",  y: "22%", color: "bg-red-200/50", dur: 7,  dx: 15,  dy: -10 },
  { size: 18, x: "5%",  y: "40%", color: "bg-red-300/40", dur: 11, dx: -10, dy: 22  },
  { size: 8,  x: "4%",  y: "58%", color: "bg-red-200/50", dur: 6,  dx: 20,  dy: -15 },
  { size: 24, x: "2%",  y: "75%", color: "bg-red-300/35", dur: 9,  dx: -12, dy: 16  },
  // Right side
  { size: 12, x: "93%", y: "25%", color: "bg-red-200/50", dur: 8,  dx: -16, dy: 14  },
  { size: 20, x: "95%", y: "45%", color: "bg-red-300/40", dur: 10, dx: 14,  dy: -20 },
  { size: 9,  x: "92%", y: "62%", color: "bg-red-200/45", dur: 7,  dx: -18, dy: 12  },
  { size: 26, x: "94%", y: "80%", color: "bg-red-300/35", dur: 12, dx: 10,  dy: -18 },
  // Bottom area
  { size: 12, x: "18%", y: "90%", color: "bg-red-200/50", dur: 8,  dx: 14,  dy: -12 },
  { size: 20, x: "35%", y: "92%", color: "bg-red-300/40", dur: 9,  dx: -18, dy: -16 },
  { size: 32, x: "50%", y: "88%", color: "bg-red-400/35", dur: 11, dx: 12,  dy: -20 },
  { size: 18, x: "68%", y: "91%", color: "bg-red-300/40", dur: 7,  dx: -14, dy: -14 },
  { size: 14, x: "82%", y: "93%", color: "bg-red-200/50", dur: 10, dx: 16,  dy: -10 },
];

// ─── Floating bubbles background ───
const FloatingBubbles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {bubbles.map((b, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${b.color}`}
        style={{
          width: b.size,
          height: b.size,
          left: b.x,
          top: b.y,
        }}
        animate={{
          x: [0, b.dx, -b.dx * 0.6, b.dx * 0.3, 0],
          y: [0, b.dy, -b.dy * 0.5, b.dy * 0.7, 0],
          scale: [1, 1.15, 0.9, 1.1, 1],
        }}
        transition={{
          duration: b.dur,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// ─── Progress bar ───
const ProgressBar = ({ step }: { step: number }) => (
  <div className="mb-6">
    <p className="text-sm text-muted-foreground mb-2">Step {step} of 4</p>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${(step / 4) * 100}%` }}
      />
    </div>
    <div className="border-b border-border mt-4" />
  </div>
);

// ─── Dollar input ───
const DollarInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative w-48">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
      <span className="text-red-500 text-xs font-bold">$</span>
    </div>
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-10 rounded-full bg-red-50/40 border-red-200/60 focus:border-red-400"
    />
  </div>
);

// ─── Radio option ───
const RadioOption = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 text-sm"
  >
    <div
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        selected ? "border-red-500" : "border-red-300"
      }`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-red-500" />}
    </div>
    <span className={selected ? "text-foreground font-medium" : "text-muted-foreground"}>
      {label}
    </span>
  </button>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 2 state
  const [school, setSchool] = useState("");
  const [studentType, setStudentType] = useState<"domestic" | "international" | "">("");
  const [semestersLeft, setSemestersLeft] = useState("");

  // Step 3 state
  const [scholarship, setScholarship] = useState("");
  const [bursary, setBursary] = useState("");
  const [grant, setGrant] = useState("");
  const [hasJob, setHasJob] = useState<"yes" | "no" | "">("");
  const [hoursSchool, setHoursSchool] = useState("");
  const [hoursSummer, setHoursSummer] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [savings, setSavings] = useState("");

  // Step 4 state
  const [tuition, setTuition] = useState("");
  const [books, setBooks] = useState("");
  const [housing, setHousing] = useState<"on" | "off" | "">("");
  const [rent, setRent] = useState("");
  const [utilities, setUtilities] = useState("");
  const [groceries, setGroceries] = useState("");
  const [phone, setPhone] = useState("");
  const [transportation, setTransportation] = useState("");
  const [memberships, setMemberships] = useState("");

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const validateStep = (): boolean => {
    if (step === 2) {
      if (!school.trim()) { toast.error("Please fill in the required fields"); return false; }
      if (!studentType) { toast.error("Please fill in the required fields"); return false; }
      if (!semestersLeft) { toast.error("Please fill in the required fields"); return false; }
    }
    if (step === 3) {
      if (!hasJob) { toast.error("Please fill in the required fields"); return false; }
      if (hasJob === "yes") {
        if (!hoursSchool) { toast.error("Please fill in the required fields"); return false; }
        if (!hoursSummer) { toast.error("Please fill in the required fields"); return false; }
        if (!hourlyRate) { toast.error("Please fill in the required fields"); return false; }
      }
    }
    if (step === 4) {
      if (!tuition) { toast.error("Please fill in the required fields"); return false; }
      if (!rent) { toast.error("Please fill in the required fields"); return false; }
      if (!groceries) { toast.error("Please fill in the required fields"); return false; }
      if (!phone) { toast.error("Please fill in the required fields"); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Final step — navigate to dashboard
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 py-10 relative">
        <FloatingBubbles />

        {/* Main card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-red-400 p-8 md:p-10 shadow-sm relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Budgetly" className="h-8" />
          </div>

          <ProgressBar step={step} />

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Let's Plan Your University Budget
              </h1>
              <p className="text-muted-foreground mb-8">
                We'll guide you through four quick steps to build your complete
                financial plan.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: BadgeDollarSign,
                    title: "Add Your Income",
                    desc: "Financial aid, scholarships, part-time work, and family support",
                  },
                  {
                    icon: HandCoins,
                    title: "Track Your Expenses",
                    desc: "Tuition, housing, books, food, and personal spending",
                  },
                  {
                    icon: BarChart3,
                    title: "See Your Future",
                    desc: "View semester-by-semester projections and spot issues early",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-red-50/60 rounded-xl p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Tell Us About Your University Journey
              </h1>
              <p className="text-muted-foreground mb-8">
                This helps us create accurate projections for your entire time in
                school.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="font-semibold text-sm block mb-2">
                    What school do you attend? <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g., Simon Fraser University"
                    className="max-w-md rounded-full bg-red-50/40 border-red-200/60 focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sm block mb-2">
                    Are you a domestic or international student? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-8">
                    <RadioOption
                      label="Domestic"
                      selected={studentType === "domestic"}
                      onClick={() => setStudentType("domestic")}
                    />
                    <RadioOption
                      label="International"
                      selected={studentType === "international"}
                      onClick={() => setStudentType("international")}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-sm block mb-2">
                    How many semesters left till graduation? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semestersLeft}
                    onChange={(e) => setSemestersLeft(e.target.value)}
                    className="rounded-full bg-red-50/40 border border-red-200/60 px-4 py-2 text-sm focus:outline-none focus:border-red-400"
                  >
                    <option value="">Select......</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Add Your Income Sources
              </h1>
              <p className="text-muted-foreground mb-8">
                List all the money you'll receive. Don't worry about being exact —
                you can adjust this later.
              </p>

              <div className="space-y-8">
                {/* Financial aid */}
                <div>
                  <h3 className="font-semibold text-base underline underline-offset-4 mb-4">
                    Financial aid & assistance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much will your scholarship contribute (per semester)?
                      </label>
                      <DollarInput value={scholarship} onChange={setScholarship} placeholder="e.g., 2000" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much bursary will you receive (per semester)?
                      </label>
                      <DollarInput value={bursary} onChange={setBursary} placeholder="e.g., 500" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much grant will you receive (per semester)?
                      </label>
                      <DollarInput value={grant} onChange={setGrant} placeholder="e.g., 1000" />
                    </div>
                  </div>
                </div>

                {/* Income */}
                <div>
                  <h3 className="font-semibold text-base underline underline-offset-4 mb-4">
                    Income
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        Do you have a job? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-8">
                        <RadioOption
                          label="Yes"
                          selected={hasJob === "yes"}
                          onClick={() => setHasJob("yes")}
                        />
                        <RadioOption
                          label="No"
                          selected={hasJob === "no"}
                          onClick={() => setHasJob("no")}
                        />
                      </div>
                    </div>

                    {hasJob === "yes" && (
                      <>
                        <div>
                          <label className="font-semibold text-sm block mb-2">
                            How many hours per week do you work during school? <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            value={hoursSchool}
                            onChange={(e) => setHoursSchool(e.target.value)}
                            placeholder="e.g., 15"
                            className="w-48 rounded-full bg-red-50/40 border-red-200/60 focus:border-red-400"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-sm block mb-2">
                            How many hours per week do you work during the summer? <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            value={hoursSummer}
                            onChange={(e) => setHoursSummer(e.target.value)}
                            placeholder="e.g., 35"
                            className="w-48 rounded-full bg-red-50/40 border-red-200/60 focus:border-red-400"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-sm block mb-2">
                            What is your hourly pay rate? <span className="text-red-500">*</span>
                          </label>
                          <DollarInput value={hourlyRate} onChange={setHourlyRate} placeholder="e.g., 17" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Savings */}
                <div>
                  <h3 className="font-semibold text-base underline underline-offset-4 mb-4">
                    Savings
                  </h3>
                  <div>
                    <label className="font-semibold text-sm block mb-2">
                      How much do you have in savings?
                    </label>
                    <DollarInput value={savings} onChange={setSavings} placeholder="e.g., 5000" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4 ─── */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Add Your Expenses
              </h1>
              <p className="text-muted-foreground mb-8">
                Now let's track where your money goes. Estimates are fine — you can
                adjust later.
              </p>

              <div className="space-y-8">
                {/* School expense */}
                <div>
                  <h3 className="font-semibold text-base underline underline-offset-4 mb-4">
                    School expense
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        Tuition (per year) <span className="text-red-500">*</span>
                      </label>
                      <DollarInput value={tuition} onChange={setTuition} placeholder="e.g., 22000" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        Books & Supplies
                      </label>
                      <DollarInput value={books} onChange={setBooks} placeholder="e.g., 200" />
                    </div>
                  </div>
                </div>

                {/* Housing */}
                <div>
                  <h3 className="font-semibold text-base underline underline-offset-4 mb-4">
                    Housing
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        Where do you live or will be living?
                      </label>
                      <div className="flex gap-8">
                        <RadioOption
                          label="On campus"
                          selected={housing === "on"}
                          onClick={() => setHousing("on")}
                        />
                        <RadioOption
                          label="Off campus"
                          selected={housing === "off"}
                          onClick={() => setHousing("off")}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much do you pay for rent each month? <span className="text-red-500">*</span>
                      </label>
                      <DollarInput value={rent} onChange={setRent} placeholder="e.g., 1200" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much do you pay for utilities each month?
                      </label>
                      <DollarInput value={utilities} onChange={setUtilities} placeholder="e.g., 80" />
                    </div>
                  </div>
                </div>

                {/* Groceries, bills, transportation & memberships */}
                <div>
                  <h3 className="font-semibold text-base underline underline-offset-4 mb-4">
                    Groceries, bills, transportation & memberships
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much do you spend on groceries each month? <span className="text-red-500">*</span>
                      </label>
                      <DollarInput value={groceries} onChange={setGroceries} placeholder="e.g., 300" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much is your cell phone bill each month? <span className="text-red-500">*</span>
                      </label>
                      <DollarInput value={phone} onChange={setPhone} placeholder="e.g., 50" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much do you spend on transportation each month?
                      </label>
                      <DollarInput value={transportation} onChange={setTransportation} placeholder="e.g., 100" />
                    </div>
                    <div>
                      <label className="font-semibold text-sm block mb-2">
                        How much do your memberships & subscriptions cost each month?
                      </label>
                      <DollarInput value={memberships} onChange={setMemberships} placeholder="e.g., 30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground rounded-full px-5 py-5 text-sm font-semibold gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-5 text-sm font-semibold gap-2"
            >
              {step === 4 ? "Start planning" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
