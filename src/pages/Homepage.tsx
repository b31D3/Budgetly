import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Clock,
  BarChart3,
  BadgeDollarSign,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  HeartPulse,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

// ─── Homepage floating bubbles ───
const homeBubbles = [
  // Top-left
  { size: 40, x: "5%",  y: "3%",  color: "bg-red-300/30", dur: 10, dx: 30,  dy: 20  },
  { size: 20, x: "12%", y: "6%",  color: "bg-red-200/40", dur: 7,  dx: -20, dy: 25  },
  { size: 55, x: "2%",  y: "15%", color: "bg-red-400/20", dur: 12, dx: 25,  dy: -18 },
  // Top-right
  { size: 35, x: "88%", y: "2%",  color: "bg-red-300/30", dur: 9,  dx: -25, dy: 22  },
  { size: 18, x: "93%", y: "8%",  color: "bg-red-200/35", dur: 8,  dx: 15,  dy: 28  },
  { size: 48, x: "90%", y: "18%", color: "bg-red-400/20", dur: 11, dx: -20, dy: -15 },
  // Left edge scattered
  { size: 24, x: "1%",  y: "35%", color: "bg-red-200/35", dur: 8,  dx: 22,  dy: -20 },
  { size: 32, x: "3%",  y: "55%", color: "bg-red-300/25", dur: 10, dx: -18, dy: 30  },
  { size: 16, x: "2%",  y: "72%", color: "bg-red-200/40", dur: 7,  dx: 28,  dy: -12 },
  // Right edge scattered
  { size: 28, x: "95%", y: "38%", color: "bg-red-200/35", dur: 9,  dx: -24, dy: 18  },
  { size: 22, x: "96%", y: "58%", color: "bg-red-300/25", dur: 11, dx: 16,  dy: -25 },
  { size: 36, x: "93%", y: "78%", color: "bg-red-400/20", dur: 8,  dx: -22, dy: 20  },
  // Mid-page accents (wider drift)
  { size: 45, x: "20%", y: "45%", color: "bg-red-300/15", dur: 14, dx: 35,  dy: -25 },
  { size: 50, x: "75%", y: "50%", color: "bg-red-300/15", dur: 13, dx: -30, dy: 28  },
  // Bottom area
  { size: 30, x: "10%", y: "88%", color: "bg-red-200/30", dur: 9,  dx: 20,  dy: -22 },
  { size: 42, x: "50%", y: "92%", color: "bg-red-300/20", dur: 12, dx: -28, dy: -18 },
  { size: 25, x: "85%", y: "90%", color: "bg-red-200/35", dur: 8,  dx: 18,  dy: -26 },
];

const HomeBubbles = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    {homeBubbles.map((b, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${b.color}`}
        style={{ width: b.size, height: b.size, left: b.x, top: b.y }}
        animate={{
          x: [0, b.dx, -b.dx * 0.6, b.dx * 0.4, 0],
          y: [0, b.dy, -b.dy * 0.5, b.dy * 0.7, 0],
          scale: [1, 1.2, 0.85, 1.15, 1],
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

// ─── Mock data for hero chart ───
const semesterChartData = [
  { name: "Summer 2025", balance: 1200 },
  { name: "Fall 2025", balance: -1800 },
  { name: "Winter 2026", balance: -2100 },
  { name: "Summer 2026", balance: 4100 },
  { name: "Fall 2026", balance: 200 },
  { name: "Winter 2027", balance: -1200 },
];

// Calculate the gradient offset so green is above 0 and red is below 0
const dataMax = Math.max(...semesterChartData.map((d) => d.balance));
const dataMin = Math.min(...semesterChartData.map((d) => d.balance));
const gradientOffset = dataMax / (dataMax - dataMin);

// Custom dot renderer — green for positive, red for negative, highlight the peak
const renderDot = (props: any) => {
  const { cx, cy, payload, index } = props;
  const isPositive = payload.balance >= 0;
  const color = isPositive ? "#22c55e" : "#ef4444";
  const isPeak = index === 3; // Summer 2026 — the highest point
  return (
    <g key={`dot-${index}`}>
      {isPeak && (
        <circle cx={cx} cy={cy} r={12} fill={color} opacity={0.15} />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isPeak ? 7 : 5}
        fill="#fff"
        stroke={color}
        strokeWidth={isPeak ? 3 : 2}
        style={{ filter: isPeak ? "drop-shadow(0 2px 4px rgba(34,197,94,0.4))" : undefined }}
      />
    </g>
  );
};

// Custom tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const isPositive = value >= 0;
  return (
    <div className="bg-white rounded-xl border border-border px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
        {isPositive ? "+" : ""}${Math.abs(value).toLocaleString()}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">Semester balance</p>
    </div>
  );
};


const semesterCards = [
  { term: "Winter 2026", label: "(Jan-Apr)", balance: -2100, income: 15520, expenses: 15775 },
  { term: "Summer 2026", label: "(May-Sep)", balance: 4100, income: 15300, expenses: 13175 },
  { term: "Fall 2026", label: "(Aug-Dec)", balance: 200, income: 12913, expenses: 15175 },
];

// ─── Feature cards data ───
const features = [
  {
    icon: Clock,
    title: "Semester-by-Semester View",
    description: "Plot every semester from now to graduation. See shortfalls before they hit.",
  },
  {
    icon: BarChart3,
    title: "Visual Financial Planning",
    description: "Complex budgets made simple with clear, visual breakdowns.",
  },
  {
    icon: BadgeDollarSign,
    title: "Track All Income Sources",
    description: "All your income sources in one dashboard; aid, work, scholarships, family support.",
  },
  {
    icon: AlertCircle,
    title: "Early Shortfall Detection",
    description: "See shortfalls coming months ahead. Adjust before it's too late.",
  },
];

// ─── Cost table data ───
const costRows = [
  { label: "Tuition & Fees", amount: "$22,000" },
  { label: "Housing", amount: "$5,040" },
  { label: "Meals", amount: "$1,800" },
  { label: "Books & Supplies", amount: "$200" },
  { label: "Transportation", amount: "$0" },
  { label: "Other Expenses", amount: "$576" },
];

const Homepage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    navigate(currentUser ? "/dashboard" : "/signup");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <HomeBubbles />
      <Navbar />

      {/* ════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════ */}
      <section className="w-full pt-8 pb-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
            Know your numbers
            <br />
            Plan your <span className="text-red-500">semesters</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-5">
            Plan each term. Spot shortfalls early. Graduate stress-free.
          </p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Button onClick={handleStartPlanning} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-5 text-sm font-semibold">
              Start planning
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6 py-5 text-sm font-semibold"
              onClick={() => document.getElementById("demo-video")?.scrollIntoView({ behavior: "smooth" })}
            >
              Watch demo
            </Button>
          </div>

          {/* Hero visual — chart + semester cards */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
            {/* Chart */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-border p-4 pb-8 shadow-md flex flex-col">
              <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={semesterChartData} margin={{ top: 10, right: 20, left: 5, bottom: 60 }} style={{ overflow: "visible" }}>
                    <defs>
                      {/* Fill: green above zero, red below zero */}
                      <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset={gradientOffset} stopColor="#22c55e" stopOpacity={0.06} />
                        <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.06} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                      </linearGradient>
                      {/* Stroke: green above zero, red below zero */}
                      <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset={gradientOffset} stopColor="#16a34a" />
                        <stop offset={gradientOffset} stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v.toLocaleString()}`}
                      width={72}
                      padding={{ top: 20, bottom: 20 }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#d1d5db", strokeDasharray: "4 4" }} />
                    <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1.5} />
                    <ReferenceLine
                      x="Summer 2026"
                      stroke="#22c55e"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                    />
                    <Area
                      type="natural"
                      dataKey="balance"
                      stroke="url(#splitStroke)"
                      strokeWidth={3}
                      fill="url(#splitFill)"
                      dot={renderDot}
                      activeDot={{ r: 8, fill: "#fff", strokeWidth: 3 }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-1 tracking-wide">Semesters</p>
            </div>

            {/* Semester cards */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {semesterCards.map((card, i) => {
                const isPositive = card.balance >= 0;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-border px-4 py-4 shadow-sm text-left flex-1 flex flex-col justify-center"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div>
                        <span className="font-semibold text-sm">{card.term}</span>
                        <span className="text-xs text-muted-foreground ml-1">{card.label}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                        }`}
                      >
                        {isPositive ? "Healthy" : "Shortfall"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Semester balance</p>
                    <p
                      className={`text-lg font-bold ${
                        isPositive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}${Math.abs(card.balance).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>
                        <span className="text-green-500 mr-0.5">&#9650;</span>Income $
                        {card.income.toLocaleString()}
                      </span>
                      <span>
                        <span className="text-red-400 mr-0.5">&#9660;</span>Expenses $
                        {card.expenses.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PLAN WITH CONFIDENCE
         ════════════════════════════════════════════ */}
      <section className="w-full py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Plan with confidence</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to stay financially on track through graduation
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-red-50/60 rounded-2xl p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white">
                <f.icon className="w-5 h-5 text-red-500" strokeWidth={2.25} />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ENTER YOUR FINANCIAL PICTURE
         ════════════════════════════════════════════ */}
      <section className="w-full py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Enter Your Financial Picture</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start by adding your income and expense. From Financial aid to,
            <br className="hidden md:block" /> Part-time jobs, tuition & book
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Cost table mockup */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-lg">Total Cost</h3>
            </div>
            <div className="px-6 py-2">
              {costRows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium">{row.amount}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 border-t-2 border-border font-bold">
                <span>Total</span>
                <span>$29,616</span>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 flex gap-6 text-xs">
              <div>
                <span className="text-muted-foreground">Cost per credit</span>
                <p className="font-semibold">$733.34</p>
              </div>
              <div>
                <span className="text-muted-foreground">Average cost per semester</span>
                <p className="font-semibold">$14,888</p>
              </div>
            </div>
          </div>

          {/* Right side — benefits */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-base">Quick setup in under 2 minutes</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-base">
                Add one-time or recurring income
                <br /> or expenses
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-base">Adjust anytime as things change</p>
            </div>
            <Button onClick={handleStartPlanning} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-base font-semibold mt-4">
              Start planning
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CREATE & COMPARE WHAT-IF SCENARIOS
         ════════════════════════════════════════════ */}
      <section className="w-full py-20 px-4 bg-gray-50/60 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Create & Compare What-If Scenarios
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test decisions before committing. See how work hours, roommates,
            <br className="hidden md:block" /> or spending changes affect your budget.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left — benefits */}
          <div className="space-y-5">
            {[
              "Create unlimited scenarios",
              "Compare side-by-side outcomes",
              "Test major financial decisions",
              "Visualize trade-offs instantly",
              "Make confident choices with data",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-base">{text}</p>
              </div>
            ))}
            <Button onClick={handleStartPlanning} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-base font-semibold mt-4">
              Start planning
            </Button>
          </div>

          {/* Right — scenario cards mockup */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5" />
              <h3 className="font-bold">Your scenarios</h3>
            </div>

            {/* Current plan */}
            <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Current plan</span>
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  BASELINE
                </span>
              </div>
              <span className="text-green-600 font-bold">+$3,460</span>
            </div>

            {/* Scenario cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">Buy a car - $300/mo</h4>
                <p className="text-xs text-muted-foreground mb-3">Monthly expenses: +$300</p>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-red-500 font-bold text-lg">-7,340</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-red-400 h-1.5 rounded-full" style={{ width: "30%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">View details</p>
              </div>
              <div className="border border-border rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">Summer part-time job</h4>
                <p className="text-xs text-muted-foreground mb-3">Monthly income: +$1100</p>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-green-600 font-bold text-lg">+7,860</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-green-400 h-1.5 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">View details</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TRACK YOUR FINANCIAL HEALTH
         ════════════════════════════════════════════ */}
      <section className="w-full py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Track Your Financial Health</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Instant overview of your financial health. See which semesters need
            <br className="hidden md:block" /> attention and where to take action.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left — health dashboard mockup */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <HeartPulse className="w-5 h-5 text-red-500" />
              <h3 className="font-bold">Your financial health</h3>
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-5 ml-7">
              Semester health
            </p>

            {/* Health bars */}
            {[
              { term: "Winter 2026", value: 80, amount: "+$2,100", color: "bg-green-400" },
              { term: "Summer 2026", value: 65, amount: "+$4,100", color: "bg-green-400" },
              { term: "Fall 2026", value: 15, amount: "+$200", color: "bg-yellow-400" },
              { term: "Winter 2026", value: 5, amount: "$100", color: "bg-red-400" },
            ].map((bar, i) => (
              <div key={i} className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{bar.term}</span>
                  <span className="text-muted-foreground text-xs">{bar.amount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${bar.color}`}
                    style={{ width: `${bar.value}%` }}
                  ></div>
                </div>
              </div>
            ))}

            <div className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium">Winter 2025</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span> Healthy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Watch
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Action needed
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">OVERALL HEALTH: </span>
              <span className="text-xs font-bold text-green-600">GOOD </span>
              <span className="text-xs text-muted-foreground">(72/100)</span>
            </div>
          </div>

          {/* Right — benefits */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-base">Overall health score at a glance</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-base">Early warnings before problems arise</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-base">Actionable insights for each term</p>
            </div>
            <Button onClick={handleStartPlanning} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-base font-semibold mt-4">
              Start planning
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SEE BUDGETLY IN ACTION
         ════════════════════════════════════════════ */}
      <section id="demo-video" className="w-full py-20 px-4 bg-gray-50/60 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">See Budgetly in Action</h2>
          <p className="text-muted-foreground text-lg">
            Watch this quick walkthrough to see how easy it is to plan your
            <br className="hidden md:block" /> entire college budget
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/bwLlJI63yGA"
              title="Budgetly Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
