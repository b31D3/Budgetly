import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getUserCalculations, type CalculationData } from "@/services/calculatorService";
import {
  addTransaction,
  getUserTransactions,
  updateTransaction,
  deleteTransaction,
  type Transaction,
} from "@/services/transactionService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AlertTriangle,
  Sliders,
  Pencil,
  Trash2,
  DollarSign,
  BarChart3,
  Bell,
  Activity,
  Clock,
  ListChecks,
  Maximize2,
  ThumbsUp,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/* ─────────────────────────────────────────────
   Helper: sidebar icon button
   ───────────────────────────────────────────── */
const SidebarIcon = ({
  icon: Icon,
  label,
  active,
  expanded,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 rounded-xl transition-all ${
      expanded ? "w-full px-3 py-2.5" : "w-11 h-11 justify-center"
    } ${
      active
        ? "bg-red-100 text-red-500 shadow-sm"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {expanded && (
      <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-red-500" : "text-foreground"}`}>
        {label}
      </span>
    )}
  </button>
);

/* ─────────────────────────────────────────────
   Helper: custom chart tooltip
   ───────────────────────────────────────────── */
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[220px]">
        <p className="font-bold text-sm mb-2.5">{d.name}</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-6">
            <span className="text-muted-foreground">Available funds:</span>
            <span className="font-semibold text-green-600">
              ${(d.income ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-muted-foreground">Expenses:</span>
            <span className="font-semibold text-red-600">
              ${(d.expenses ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-6 pt-1.5 border-t">
            <span className="font-semibold">Ending balance:</span>
            <span
              className={`font-bold ${
                d.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${(d.balance ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────────────
   Helper: semester health status
   ───────────────────────────────────────────── */
const getSemesterHealth = (balance: number, income: number) => {
  const savingsRate = income > 0 ? balance / income : 0;
  if (balance < 0)
    return {
      status: "Action needed",
      color: "bg-red-500",
      barBg: "bg-red-100",
      badgeBg: "bg-red-50",
      badgeText: "text-red-700",
      badgeIcon: "text-red-500",
      dotColor: "bg-red-500",
    };
  if (savingsRate < 0.05)
    return {
      status: "Watch",
      color: "bg-yellow-400",
      barBg: "bg-yellow-100",
      badgeBg: "bg-yellow-50",
      badgeText: "text-yellow-700",
      badgeIcon: "text-yellow-500",
      dotColor: "bg-yellow-400",
    };
  return {
    status: "Healthy",
    color: "bg-green-500",
    barBg: "bg-green-100",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
    badgeIcon: "text-green-500",
    dotColor: "bg-green-500",
  };
};

const getDateRange = (label: string) => {
  if (label.includes("Winter")) return "(Jan-Apr)";
  if (label.includes("Summer")) return "(May-Sep)";
  if (label.includes("Fall")) return "(Aug-Dec)";
  return "";
};

/* ═══════════════════════════════════════════════
   DASHBOARD COMPONENT
   ═══════════════════════════════════════════════ */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [calculations, setCalculations] = useState<CalculationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "finances" || location.pathname === "/my-finances") {
      setActiveTab("finances");
    } else {
      setActiveTab("dashboard");
    }
  }, [searchParams, location.pathname]);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(
    null
  );
  const [transactionType, setTransactionType] = useState("expense");
  const [transactionName, setTransactionName] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "expenses" | "income"
  >("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const [calcs, txns] = await Promise.all([
          getUserCalculations(currentUser.uid),
          getUserTransactions(currentUser.uid),
        ]);
        setCalculations(calcs);
        setTransactions(txns);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  /* ── Formatters ── */
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  /* ── Transaction helpers ── */
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  const spendingByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const filteredTransactions = transactions
    .filter((t) => {
      if (transactionFilter === "all") return true;
      if (transactionFilter === "expenses") return t.type === "expense";
      if (transactionFilter === "income") return t.type === "income";
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditTransaction = (transaction: (typeof transactions)[0]) => {
    setEditingTransaction(transaction.id ?? null);
    setTransactionName(transaction.name);
    setTransactionCategory(transaction.category);
    setTransactionAmount(transaction.amount.toString());
    setTransactionDate(transaction.date);
    setTransactionType(transaction.type);
    setShowAddTransaction(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      toast.success("Transaction deleted successfully!");
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  const handleAddTransaction = async () => {
    if (
      !transactionName ||
      !transactionCategory ||
      !transactionAmount ||
      !transactionDate
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      if (editingTransaction) {
        const updates = {
          name: transactionName,
          category: transactionCategory,
          amount: parseFloat(transactionAmount),
          date: transactionDate,
          type: transactionType as "income" | "expense",
        };
        await updateTransaction(editingTransaction, updates);
        setTransactions(
          transactions.map((t) =>
            t.id === editingTransaction ? { ...t, ...updates } : t
          )
        );
        toast.success("Transaction updated successfully!");
      } else {
        const txData = {
          userId: currentUser!.uid,
          name: transactionName,
          category: transactionCategory,
          amount: parseFloat(transactionAmount),
          date: transactionDate,
          type: transactionType as "income" | "expense",
        };
        const newId = await addTransaction(txData);
        setTransactions([
          ...transactions,
          { ...txData, id: newId, createdAt: new Date() },
        ]);
        toast.success("Transaction added successfully!");
      }
    } catch {
      toast.error("Failed to save transaction");
      return;
    }
    setShowAddTransaction(false);
    setEditingTransaction(null);
    setTransactionName("");
    setTransactionCategory("");
    setTransactionAmount("");
    setTransactionDate("");
    setTransactionType("expense");
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    if (dateOnly.getTime() === today.getTime()) return "Today";
    if (dateOnly.getTime() === yesterday.getTime()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "housing":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "food":
      case "food & dining":
      case "groceries":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "transportation":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
        );
      case "income":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  /* ── Derived calculation data ── */
  const latestCalculation = calculations.length > 0 ? calculations[0] : null;

  const budgetedMonthlyIncome =
    latestCalculation?.semesterData &&
    Array.isArray(latestCalculation.semesterData) &&
    latestCalculation.semesterData.length > 0
      ? latestCalculation.semesterData.reduce(
          (sum: number, s: any) => sum + (s.income || 0),
          0
        ) /
        latestCalculation.semesterData.length /
        4
      : 2000;

  const budgetedMonthlyLivingExpense = latestCalculation
    ? ((latestCalculation.housingCost || 0) / 12 +
        (latestCalculation.mealPlanCost || 0) / 12 +
        (latestCalculation.transportationCost || 0) / 12 +
        (latestCalculation.otherExpenses || 0) / 12)
    : 800;

  /* ── Timeline chart data ── */
  const timelineData =
    latestCalculation?.semesterData?.map((s: any) => ({
      name: s.semesterLabel,
      balance: s.balance || 0,
      income: s.income || 0,
      expenses: s.costs || 0,
    })) || [];

  const gradientOffset = (() => {
    if (timelineData.length === 0) return 0.5;
    const balances = timelineData.map((d: any) => d.balance);
    const max = Math.max(...balances);
    const min = Math.min(...balances);
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  })();

  /* ── Semester health data ── */
  const semesterHealthData =
    latestCalculation?.semesterData?.map((s: any) => ({
      label: s.semesterLabel,
      balance: s.balance || 0,
      income: s.income || 0,
      expenses: s.costs || 0,
      health: getSemesterHealth(s.balance || 0, s.income || 0),
      savingsRate:
        s.income > 0
          ? (((s.balance || 0) / s.income) * 100).toFixed(1)
          : "0.0",
    })) || [];

  /* ── Overall health score ── */
  const overallHealth = (() => {
    if (semesterHealthData.length === 0)
      return { score: 0, label: "N/A", color: "text-gray-500" };
    let total = 0;
    semesterHealthData.forEach((s: any) => {
      const rate = s.income > 0 ? s.balance / s.income : 0;
      if (s.balance >= 0 && rate >= 0.15) total += 100;
      else if (s.balance >= 0 && rate >= 0.05) total += 75;
      else if (s.balance >= 0) total += 50;
      else total += Math.max(0, 25 + (s.balance / 1000) * 5);
    });
    const score = Math.round(total / semesterHealthData.length);
    if (score >= 80)
      return { score, label: "EXCELLENT", color: "text-green-600" };
    if (score >= 60) return { score, label: "GOOD", color: "text-green-600" };
    if (score >= 40) return { score, label: "FAIR", color: "text-yellow-600" };
    return { score, label: "NEEDS WORK", color: "text-red-600" };
  })();

  /* ── Notifications / insights ── */
  const notifications = (() => {
    if (!latestCalculation) return [];
    const notes: Array<{
      icon: "thumbsUp" | "warning" | "info";
      title: string;
      description: string;
    }> = [];
    const { projectedBalance = 0, semesterData = [] } = latestCalculation;

    if (projectedBalance >= 0) {
      notes.push({
        icon: "thumbsUp",
        title: "On track to graduate!",
        description: `You're projected to finish with ${formatCurrency(
          projectedBalance
        )} remaining. Great planning!`,
      });
    } else {
      notes.push({
        icon: "warning",
        title: "Projected shortfall",
        description: `Current projections show a ${formatCurrency(
          Math.abs(projectedBalance)
        )} gap at graduation. Consider adjusting your plan.`,
      });
    }

    // Find tightest semester
    if (Array.isArray(semesterData) && semesterData.length > 1) {
      const sorted = [...semesterData].sort(
        (a: any, b: any) => (a.balance || 0) - (b.balance || 0)
      );
      const tightest = sorted[0];
      if (tightest && tightest.balance < 0) {
        notes.push({
          icon: "warning",
          title: "Tight semester ahead",
          description: `${tightest.semesterLabel} shows a ${formatCurrency(
            Math.abs(tightest.balance)
          )} deficit. Review your expenses for that period.`,
        });
      } else if (tightest && tightest.balance < 500) {
        notes.push({
          icon: "info",
          title: "Watch this semester",
          description: `${tightest.semesterLabel} has only ${formatCurrency(
            tightest.balance
          )} buffer. Keep an eye on spending.`,
        });
      }
    }

    return notes;
  })();

  /* ── Max balance for health bar scaling ── */
  const maxAbsBalance =
    semesterHealthData.length > 0
      ? Math.max(...semesterHealthData.map((s: any) => Math.abs(s.balance)), 1)
      : 1;

  /* ═══════════════════════════════════════
     LOADING STATE
     ═══════════════════════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading your financial overview...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     EMPTY STATE
     ═══════════════════════════════════════ */
  if (!latestCalculation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              Welcome, {currentUser?.displayName?.split(" ")[0] || "User"}!
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't created any calculations yet.
            </p>
            <Button onClick={() => navigate("/onboarding")} size="lg">
              Create Your First Calculation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50/40 flex flex-col">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      <div className="flex flex-1">
        {/* ──────────────────────────────────
            LEFT SIDEBAR (desktop only)
            ────────────────────────────────── */}
        <aside
          className={`hidden lg:flex border-r bg-white flex-col items-center py-5 gap-2 flex-shrink-0 sticky top-[64px] h-[calc(100vh-64px)] transition-all duration-200 ${
            sidebarExpanded ? "w-48 px-3" : "w-16"
          }`}
        >
          {/* Expand / Collapse toggle — top */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`mb-1 w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ${sidebarExpanded ? "self-end" : ""}`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarExpanded ? "rotate-180" : ""}`} />
          </button>

          <SidebarIcon
            icon={LayoutDashboard}
            label={t.nav.dashboard}
            active={activeTab === "dashboard"}
            expanded={sidebarExpanded}
            onClick={() => {
              setActiveTab("dashboard");
              navigate("/dashboard");
            }}
          />
          <SidebarIcon
            icon={DollarSign}
            label={t.nav.finances}
            active={activeTab === "finances"}
            expanded={sidebarExpanded}
            onClick={() => {
              setActiveTab("finances");
              navigate("/my-finances");
            }}
          />
          <SidebarIcon
            icon={Sliders}
            label={t.nav.scenarios}
            expanded={sidebarExpanded}
            onClick={() => navigate("/scenarios")}
          />
          <SidebarIcon
            icon={Pencil}
            label={t.nav.edit}
            expanded={sidebarExpanded}
            onClick={() => navigate("/edit")}
          />
          <SidebarIcon
            icon={Settings}
            label={t.nav.settings}
            expanded={sidebarExpanded}
            onClick={() => navigate("/settings")}
          />
        </aside>

        {/* ──────────────────────────────────
            MOBILE TAB BAR
            ────────────────────────────────── */}
        <div className="lg:hidden border-b border-border w-full bg-white">
          <div className="flex gap-1 justify-center overflow-x-auto px-2">
            {[
              { key: "dashboard", label: t.nav.dashboard, path: "/dashboard" },
              { key: "finances", label: t.nav.finances, path: "/my-finances" },
              { key: "scenarios", label: t.nav.scenarios, path: "/scenarios" },
              { key: "edit", label: t.nav.edit, path: "/edit" },
              { key: "settings", label: t.nav.settings, path: "/settings" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === "dashboard" || tab.key === "finances") {
                    setActiveTab(tab.key);
                  }
                  navigate(tab.path);
                }}
                className={`px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ──────────────────────────────────
            MAIN CONTENT
            ────────────────────────────────── */}
        <main className="flex-1 overflow-auto">
          {/* ════════════════════════════════
              DASHBOARD TAB
              ════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="px-4 md:px-8 lg:px-10 py-6 max-w-[1400px]">
              {/* Welcome */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {t.dashboard.welcome}!
                </h1>
                <p className="text-muted-foreground">
                  {t.dashboard.financialTimeline}
                </p>
              </div>

              {/* ── 3 Stat Boxes ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Current Balance */}
                <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-5 px-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Current balance
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-green-600">
                      {formatCurrency(latestCalculation.currentBalance || 0)}
                    </p>
                  </CardContent>
                </Card>

                {/* Remaining Semesters */}
                <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-5 px-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Remaining semester
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-foreground">
                      {latestCalculation.remainingSemesters || 0}
                    </p>
                  </CardContent>
                </Card>

                {/* Projected at Graduation */}
                <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-5 px-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Projected at graduation
                    </p>
                    <p
                      className={`text-3xl md:text-4xl font-bold ${
                        (latestCalculation.projectedBalance || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        latestCalculation.projectedBalance || 0
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* ── Financial Timeline + Notification Center ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                {/* Financial Timeline */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-bold">{t.dashboard.financialTimeline}</h2>
                  </div>

                  <Card className="bg-white shadow-sm overflow-hidden">
                    <CardContent className="pt-4 pb-2 px-2 md:px-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                          data={timelineData}
                          margin={{
                            top: 20,
                            right: 20,
                            left: 10,
                            bottom: 5,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="dashSplitFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#22c55e"
                                stopOpacity={0.35}
                              />
                              <stop
                                offset={`${gradientOffset * 100}%`}
                                stopColor="#22c55e"
                                stopOpacity={0.06}
                              />
                              <stop
                                offset={`${gradientOffset * 100}%`}
                                stopColor="#ef4444"
                                stopOpacity={0.06}
                              />
                              <stop
                                offset="100%"
                                stopColor="#ef4444"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="dashSplitStroke"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset={`${gradientOffset * 100}%`}
                                stopColor="#22c55e"
                              />
                              <stop
                                offset={`${gradientOffset * 100}%`}
                                stopColor="#ef4444"
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                            angle={-30}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                            tickFormatter={(v) =>
                              `$${(v / 1000).toFixed(0)}k`
                            }
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <ReferenceLine
                            y={0}
                            stroke="#9ca3af"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{
                              value: "$0",
                              position: "left",
                              fill: "#9ca3af",
                              fontSize: 11,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="url(#dashSplitStroke)"
                            strokeWidth={3}
                            fill="url(#dashSplitFill)"
                            dot={{
                              r: 5,
                              fill: "#fff",
                              stroke: "#22c55e",
                              strokeWidth: 2,
                            }}
                            activeDot={{ r: 7 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>

                      {/* Legend row */}
                      <div className="flex items-center gap-6 px-4 py-3 border-t mt-2">
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:underline">
                          <Maximize2 className="w-3.5 h-3.5" />
                          Expand
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                          Money Surplus
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                          Money Deficit
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notification Center */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-bold">{t.dashboard.notificationCenter}</h2>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((n, i) => (
                      <Card
                        key={i}
                        className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                          n.icon === "thumbsUp"
                            ? "bg-green-50 border-l-green-400 border-t-green-100 border-r-green-100 border-b-green-100"
                            : n.icon === "warning"
                            ? "bg-red-50 border-l-red-400 border-t-red-100 border-r-red-100 border-b-red-100"
                            : "bg-yellow-50 border-l-yellow-400 border-t-yellow-100 border-r-yellow-100 border-b-yellow-100"
                        }`}
                      >
                        <CardContent className="py-3.5 px-5">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                n.icon === "thumbsUp"
                                  ? "bg-green-200"
                                  : n.icon === "warning"
                                  ? "bg-red-200"
                                  : "bg-yellow-200"
                              }`}
                            >
                              {n.icon === "thumbsUp" && (
                                <ThumbsUp className="w-4 h-4 text-green-700" />
                              )}
                              {n.icon === "warning" && (
                                <AlertCircle className="w-4 h-4 text-red-700" />
                              )}
                              {n.icon === "info" && (
                                <AlertCircle className="w-4 h-4 text-yellow-700" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold text-sm ${
                                n.icon === "thumbsUp" ? "text-green-800" : n.icon === "warning" ? "text-red-800" : "text-yellow-800"
                              }`}>{n.title}</p>
                              <p className={`text-xs mt-1 leading-relaxed ${
                                n.icon === "thumbsUp" ? "text-green-700" : n.icon === "warning" ? "text-red-700" : "text-yellow-700"
                              }`}>
                                {n.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Quick action */}
                    <Card className="bg-white shadow-sm border border-border">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Sliders className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              Try a scenario
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              See how adjustments impact your budget.
                            </p>
                            <button
                              onClick={() => navigate("/scenarios")}
                              className="text-xs font-semibold text-red-500 mt-2 hover:underline flex items-center gap-1"
                            >
                              Open Scenarios{" "}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* ── Financial Health + Semester Breakdown ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Your Financial Health */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-bold">
                      {t.dashboard.financialHealth}
                    </h2>
                  </div>

                  <Card className="bg-white shadow-sm">
                    <CardContent className="py-5 px-5">
                      <h3 className="font-bold text-base mb-5">
                        {t.dashboard.semesterHealth}
                      </h3>

                      <div className="space-y-4">
                        {semesterHealthData.map((s: any, i: number) => {
                          const barWidth =
                            (Math.abs(s.balance) / maxAbsBalance) * 100;
                          return (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-foreground">
                                  {s.label}
                                </span>
                                <span
                                  className={`text-sm font-bold ${
                                    s.balance >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {s.balance >= 0 ? "+" : ""}
                                  {formatCurrency(s.balance)}
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${s.health.color}`}
                                  style={{
                                    width: `${Math.max(barWidth, 4)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-5 mt-6 pt-4 border-t">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          Healthy
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          Watch
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          Action needed
                        </div>
                      </div>

                      {/* Overall health */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-bold">
                          OVERALL HEALTH:{" "}
                          <span className={overallHealth.color}>
                            {overallHealth.label}
                          </span>{" "}
                          <span className="text-muted-foreground font-normal">
                            ({overallHealth.score}/100)
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Semester Breakdown */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-bold">Semester Breakdown</h2>
                  </div>

                  <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                    {semesterHealthData.map((s: any, i: number) => (
                      <Card
                        key={i}
                        className="bg-white shadow-sm border border-border hover:shadow-md transition-shadow"
                      >
                        <CardContent className="py-4 px-5">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-bold text-sm">
                                {s.label}
                              </span>{" "}
                              <span className="text-xs text-muted-foreground">
                                {getDateRange(s.label)}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${s.health.badgeBg} ${s.health.badgeText}`}
                            >
                              {s.health.status === "Healthy" && (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              {s.health.status === "Watch" && (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              {s.health.status === "Action needed" && (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {s.health.status}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground mb-1">
                            Semester balance
                          </p>

                          <div className="flex items-end justify-between">
                            <p
                              className={`text-2xl font-bold ${
                                s.balance >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {s.balance >= 0 ? "+" : ""}
                              {formatCurrency(s.balance)}
                            </p>
                            <div className="text-right">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  parseFloat(s.savingsRate) >= 0
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {parseFloat(s.savingsRate) >= 0 ? "" : ""}
                                {s.savingsRate}%
                                <span className="font-normal ml-0.5">
                                  {parseFloat(s.savingsRate) >= 0
                                    ? "Saved"
                                    : "Deficit"}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Income: {formatCurrency(s.income)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Expenses: {formatCurrency(s.expenses)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Scenarios CTA ── */}
              <div className="mb-4 flex items-center gap-4">
                <p className="text-muted-foreground text-sm">
                  Test What-if scenarios to see what you can adjust for a better financial standing
                </p>
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-5 text-sm font-semibold border-border hover:bg-gray-50 flex-shrink-0"
                  onClick={() => navigate("/scenarios")}
                >
                  <Sliders className="w-4 h-4 mr-2" />
                  Scenarios
                </Button>
              </div>

              {/* ── Financial Breakdown (full width) ── */}
              <div className="mb-8">
                {/* Financial Breakdown */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-bold">Financial Breakdown</h2>
                  </div>

                  <Card className="bg-white shadow-sm">
                    <CardContent className="py-5 px-5">
                      <h3 className="font-bold text-base mb-4">Total Cost</h3>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm border-b pb-3">
                          <span className="text-muted-foreground">
                            Tuition & Fees
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(latestCalculation.tuition || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-3">
                          <span className="text-muted-foreground">
                            Housing
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              latestCalculation.housingCost || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-3">
                          <span className="text-muted-foreground">Meals</span>
                          <span className="font-semibold">
                            {formatCurrency(
                              latestCalculation.mealPlanCost || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-3">
                          <span className="text-muted-foreground">
                            Books & Supplies
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              latestCalculation.booksCost || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-3">
                          <span className="text-muted-foreground">
                            Transportation
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              latestCalculation.transportationCost || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-3">
                          <span className="text-muted-foreground">
                            Other Expenses
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              latestCalculation.otherExpenses || 0
                            )}
                          </span>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between text-base pt-1">
                          <span className="font-bold">Total</span>
                          <span className="font-bold">
                            {formatCurrency(latestCalculation.totalCost || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Cost per metrics */}
                      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t">
                        <div className="bg-red-50/60 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Cost per credit
                          </p>
                          <p className="text-base font-bold">
                            {formatCurrency(
                              latestCalculation.costPerCredit || 0
                            )}
                          </p>
                        </div>
                        <div className="bg-red-50/60 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Average Cost per Semester
                          </p>
                          <p className="text-base font-bold">
                            {formatCurrency(
                              (latestCalculation.totalCost || 0) /
                                Math.max(
                                  latestCalculation.remainingSemesters || 1,
                                  1
                                )
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              FINANCES TAB
              ════════════════════════════════ */}
          {activeTab === "finances" && (
            <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Finances</h2>
                  <p className="text-muted-foreground text-sm">
                    Track your actual expenses and income
                  </p>
                </div>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => setShowAddTransaction(true)}
                >
                  + {t.dashboard.addTransaction}
                </Button>
              </div>

              {/* Summary Cards - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Income this month
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-2xl">$</span>
                      <p className="text-4xl font-bold text-green-600">
                        {totalIncome.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-100">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Expense this month
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 text-2xl">$</span>
                      <p className="text-4xl font-bold text-red-600">
                        -{totalExpenses.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`${
                    netAmount >= 0
                      ? "bg-green-50 border-green-100"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Net
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`${
                          netAmount >= 0 ? "text-green-600" : "text-red-600"
                        } text-2xl`}
                      >
                        $
                      </span>
                      <p
                        className={`text-4xl font-bold ${
                          netAmount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {netAmount >= 0 ? "+" : ""}
                        {netAmount.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Budgeted and Actual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    Budgeted and actual income
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-lg font-bold mb-4">
                          {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          (this month)
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Budgeted income
                            </span>
                            <p className="text-green-600 font-bold">
                              $ {budgetedMonthlyIncome.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Actual income
                            </span>
                            <p className="text-green-600 font-bold">
                              $ {totalIncome.toFixed(2)}
                            </p>
                          </div>
                          <div className="pt-2 border-t flex items-center justify-between">
                            <span className="font-semibold">
                              {totalIncome >= budgetedMonthlyIncome
                                ? "Over budget"
                                : "Under budget"}
                            </span>
                            <p
                              className={`font-bold ${
                                totalIncome >= budgetedMonthlyIncome
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ${" "}
                              {Math.abs(
                                totalIncome - budgetedMonthlyIncome
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    Budgeted and actual living expenses
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-lg font-bold mb-4">
                          {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          (this month)
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Budgeted living expenses
                            </span>
                            <p className="text-red-600 font-bold">
                              $ {budgetedMonthlyLivingExpense.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Actual living expenses
                            </span>
                            <p className="text-red-600 font-bold">
                              $ {totalExpenses.toFixed(2)}
                            </p>
                          </div>
                          <div className="pt-2 border-t flex items-center justify-between">
                            <span className="font-semibold">
                              {totalExpenses <= budgetedMonthlyLivingExpense
                                ? "Under budget"
                                : "Over budget"}
                            </span>
                            <p
                              className={`font-bold ${
                                totalExpenses <= budgetedMonthlyLivingExpense
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ${" "}
                              {Math.abs(
                                budgetedMonthlyLivingExpense - totalExpenses
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Row 3: Expenses by Category + Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-6">
                <div className="lg:col-span-3">
                  <h3 className="text-xl font-bold mb-3">
                    Expenses by category
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {Object.keys(spendingByCategory).length > 0 ? (
                          Object.entries(spendingByCategory)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount]) => (
                              <div
                                key={category}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-muted-foreground">
                                    {getCategoryIcon(category)}
                                  </div>
                                  <span className="font-medium capitalize">
                                    {category}
                                  </span>
                                </div>
                                <p className="text-red-600 font-bold">
                                  $ {amount.toFixed(2)}
                                </p>
                              </div>
                            ))
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-4">
                            No expenses yet
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-7">
                  <h3 className="text-xl font-bold mb-3">Transactions</h3>
                  <div className="flex gap-6 border-b mb-3">
                    {(["all", "expenses", "income"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTransactionFilter(filter)}
                        className={`pb-2 border-b-2 capitalize ${
                          transactionFilter === filter
                            ? "border-primary text-primary font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <Card className="bg-red-50/30">
                    <CardContent className="pt-4">
                      {filteredTransactions.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {filteredTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="bg-white rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-2"
                            >
                              <div className="flex items-start justify-between md:block">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {transaction.name}
                                  </p>
                                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                    {formatDate(transaction.date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 md:hidden">
                                  <button
                                    onClick={() =>
                                      handleEditTransaction(transaction)
                                    }
                                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                    title="Edit transaction"
                                  >
                                    <Pencil className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteTransaction(transaction.id)
                                    }
                                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                    title="Delete transaction"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between md:gap-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  {getCategoryIcon(transaction.category)}
                                  <span className="text-sm capitalize">
                                    {transaction.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`font-bold ${
                                      transaction.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    ${" "}
                                    {transaction.type === "income" ? "+" : "-"}
                                    {transaction.amount.toFixed(2)}
                                  </p>
                                  <div className="hidden md:flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        handleEditTransaction(transaction)
                                      }
                                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                      title="Edit transaction"
                                    >
                                      <Pencil className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteTransaction(transaction.id)
                                      }
                                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                      title="Delete transaction"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            {t.dashboard.noTransactions}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t.dashboard.addFirstTransaction}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              TRANSACTION MODAL
              ════════════════════════════════ */}
          <Dialog
            open={showAddTransaction}
            onOpenChange={(open) => {
              setShowAddTransaction(open);
              if (!open) {
                setEditingTransaction(null);
                setTransactionName("");
                setTransactionCategory("");
                setTransactionAmount("");
                setTransactionDate("");
                setTransactionType("expense");
              }
            }}
          >
            <DialogContent className="max-w-xl p-8">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-3xl font-bold">
                  {editingTransaction ? "Edit" : "Add"} a transaction
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="transaction-name"
                    className="text-lg font-semibold mb-2 block"
                  >
                    Transaction name
                  </Label>
                  <Input
                    id="transaction-name"
                    placeholder="e.g. Sobeys, Walmart e.t.c"
                    value={transactionName}
                    onChange={(e) => setTransactionName(e.target.value)}
                    className="h-12 text-base rounded-full border-2 border-gray-300 px-4"
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Type
                  </Label>
                  <RadioGroup
                    value={transactionType}
                    onValueChange={setTransactionType}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="income"
                        id="income"
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor="income"
                        className="text-base font-normal cursor-pointer"
                      >
                        Income
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="expense"
                        id="expense"
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor="expense"
                        className="text-base font-normal cursor-pointer"
                      >
                        Expense
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label
                    htmlFor="category"
                    className="text-lg font-semibold mb-2 block"
                  >
                    Category
                  </Label>
                  <Select
                    value={transactionCategory}
                    onValueChange={setTransactionCategory}
                  >
                    <SelectTrigger className="h-12 text-base rounded-full border-2 border-gray-300">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="groceries">Groceries</SelectItem>
                      <SelectItem value="transportation">
                        Transportation
                      </SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="amount"
                    className="text-lg font-semibold mb-2 block"
                  >
                    Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 text-lg font-semibold">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      className="h-12 text-base rounded-full border-2 border-gray-300 pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="date"
                    className="text-lg font-semibold mb-2 block"
                  >
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="h-12 text-base rounded-full border-2 border-gray-300 px-4"
                  />
                </div>

                <Button
                  onClick={handleAddTransaction}
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white text-base rounded-full mt-4"
                >
                  {editingTransaction ? "Update" : "+ Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
