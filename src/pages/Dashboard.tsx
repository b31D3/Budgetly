import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getUserCalculations, type CalculationData } from "@/services/calculatorService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertTriangle, Sliders, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [calculations, setCalculations] = useState<CalculationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "finances") {
      setActiveTab("finances");
    }
  }, [searchParams]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [transactionName, setTransactionName] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionFilter, setTransactionFilter] = useState<"all" | "expenses" | "income">("all");
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    name: string;
    category: string;
    amount: number;
    date: string;
    type: "income" | "expense";
  }>>([]);

  useEffect(() => {
    const fetchCalculations = async () => {
      if (!currentUser) {
        console.log("No current user, skipping fetch");
        setLoading(false);
        return;
      }

      console.log("Fetching calculations for user:", currentUser.uid);

      try {
        const data = await getUserCalculations(currentUser.uid);
        console.log("Fetched calculations:", data);
        console.log("Number of calculations:", data.length);
        setCalculations(data);
      } catch (error) {
        console.error("Error fetching calculations:", error);
        toast.error("Failed to load calculations");
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, [currentUser]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate transaction totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  // Calculate spending by category
  const spendingByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Filter transactions based on active filter
  const filteredTransactions = transactions
    .filter((t) => {
      if (transactionFilter === "all") return true;
      if (transactionFilter === "expenses") return t.type === "expense";
      if (transactionFilter === "income") return t.type === "income";
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Add transaction handler
  const handleAddTransaction = () => {
    if (!transactionName || !transactionCategory || !transactionAmount || !transactionDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      name: transactionName,
      category: transactionCategory,
      amount: parseFloat(transactionAmount),
      date: transactionDate,
      type: transactionType as "income" | "expense",
    };

    setTransactions([...transactions, newTransaction]);
    toast.success("Transaction added successfully!");
    setShowAddTransaction(false);

    // Reset form
    setTransactionName("");
    setTransactionCategory("");
    setTransactionAmount("");
    setTransactionDate("");
    setTransactionType("expense");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "housing":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "food":
      case "food & dining":
      case "groceries":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "transportation":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        );
      case "income":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const latestCalculation = calculations.length > 0 ? calculations[0] : null;

  console.log("Latest calculation:", latestCalculation);

  // Calculate monthly budgeted income and living expenses from semester data
  const budgetedMonthlyIncome = latestCalculation?.semesterData && Array.isArray(latestCalculation.semesterData) && latestCalculation.semesterData.length > 0
    ? latestCalculation.semesterData.reduce((sum: number, s: any) => sum + (s.income || 0), 0) / latestCalculation.semesterData.length / 4 // Divide by 4 months per semester
    : 2000;

  // Calculate monthly living expenses (excluding tuition and books)
  // Expense structure: housing (rent), utilities, groceries, cell phone, transportation, memberships
  // All expenses are stored as annual values and divided by 12 months for monthly average
  const budgetedMonthlyLivingExpense = latestCalculation
    ? ((latestCalculation.housingCost || 0) / 12 +  // Annual housing (rent) cost / 12 months
       (latestCalculation.mealPlanCost || 0) / 12 +  // Annual groceries / 12 months
       (latestCalculation.transportationCost || 0) / 12 +  // Annual transportation / 12 months
       (latestCalculation.otherExpenses || 0) / 12)  // Annual other expenses (utilities, cell phone, memberships) / 12 months
    : 800;

  // Prepare chart data
  const chartData = latestCalculation?.semesterData && Array.isArray(latestCalculation.semesterData)
    ? [
        {
          name: "Semester",
          Actual: latestCalculation.currentBalance || 0,
          Ideal: latestCalculation.currentBalance || 0,
        },
        ...latestCalculation.semesterData
          .filter((s: any) => !s.isSummer)
          .map((semester: any, index: number) => ({
            name: semester.semesterLabel?.split(" ")[0] || `S${index + 1}`,
            Actual: semester.balance || 0,
            Ideal: (latestCalculation.currentBalance || 0) - ((semester.costs || 0) * (index + 1) * 0.5),
          })),
        {
          name: "Graduation",
          Actual: latestCalculation.projectedBalance || 0,
          Ideal: 0,
        },
      ]
    : [];

  // Get key insight
  const getKeyInsight = () => {
    if (!latestCalculation) return null;

    const { projectedBalance = 0, remainingSemesters = 0, semesterData = [] } = latestCalculation;

    // Find when balance hits zero
    const zeroBalanceIndex = Array.isArray(semesterData) ? semesterData.findIndex((s: any) => s.balance < 0) : -1;
    const zeroBalanceSemester = zeroBalanceIndex !== -1 && Array.isArray(semesterData) && semesterData.length > 0
      ? semesterData[zeroBalanceIndex]?.semesterLabel
      : null;

    if (projectedBalance >= 0) {
      return {
        message: `You're on track to graduate with a surplus of ${formatCurrency(projectedBalance)}. Great financial planning! This positive balance gives you flexibility for unexpected expenses or opportunities. Consider setting aside some of this surplus for post-graduation needs like moving expenses, professional certifications, or building an emergency fund.`,
        type: "positive",
      };
    } else {
      return {
        message: `Your current path shows you'll be ${formatCurrency(Math.abs(projectedBalance))} short by graduation.${zeroBalanceSemester ? ` Your balance hits zero in ${zeroBalanceSemester}.` : ""} Consider testing scenarios to find ways to improve your outcome. You might explore options like increasing work hours during breaks, applying for additional scholarships or grants, reducing housing costs by finding roommates, or adjusting your course load to spread expenses over more time.`,
        type: "negative",
      };
    }
  };

  const keyInsight = getKeyInsight();

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

  if (!latestCalculation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Welcome, {currentUser?.displayName?.split(" ")[0] || "User"}!</h2>
            <p className="text-muted-foreground mb-6">You haven't created any calculations yet.</p>
            <Button onClick={() => navigate("/calculator")} size="lg">
              Create Your First Calculation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto">
          <div className="flex gap-8 justify-center">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "dashboard"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("finances")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "finances"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My finances
            </button>
            <button
              onClick={() => navigate("/scenarios")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground`}
            >
              <Sliders className="w-5 h-5" />
              Scenarios
            </button>
            <button
              onClick={() => navigate("/calculator")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit inputs
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === "dashboard" && (
        <div className="container mx-auto px-12 py-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1">Welcome back!</h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Current Balance */}
            <Card className="bg-red-50 border-red-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  CURRENT BALANCE
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-2xl">$</span>
                  <p className="text-4xl font-bold text-foreground">
                    {formatCurrency(latestCalculation.currentBalance || 0).replace('$', '')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Remaining Semesters */}
            <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  REMAINING SEMESTER(S)
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {latestCalculation.remainingSemesters || 0}
                </p>
              </CardContent>
            </Card>

            {/* Projected at Graduation */}
            <Card className="bg-red-50 border-red-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  PROJECTED AT GRADUATION
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-2xl">$</span>
                  <p className={`text-4xl font-bold ${(latestCalculation.projectedBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(latestCalculation.projectedBalance || 0).replace('$', '').replace('-', '-')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Chart and Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cash Flow Chart - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardContent className="pt-4 flex flex-col">
                  <h3 className="text-xl font-bold mb-4">Your cash flow to graduation</h3>

                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={latestCalculation.semesterData?.map((s: any) => ({
                        semester: s.semesterLabel,
                        availableFunds: s.income + (s.balance > 0 ? s.balance : 0),
                        expenses: s.costs,
                        balance: s.balance,
                      })) || []}
                      margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="semester"
                        label={{ value: 'Semester', position: 'insideBottom', offset: -20, style: { fontSize: 16, fontWeight: 'bold', fill: '#374151' } }}
                        tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                        axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                        tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        label={{ value: 'Money ($)', angle: -90, position: 'insideLeft', offset: -30, style: { fontSize: 16, fontWeight: 'bold', fill: '#374151' } }}
                        tick={{ fill: '#374151', fontSize: 14, fontWeight: 600 }}
                        axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                        tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          const formattedValue = `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                          let label = name;
                          if (name === 'availableFunds') label = 'Available Funds';
                          if (name === 'expenses') label = 'Expenses';
                          if (name === 'balance') label = 'Ending Balance';
                          return [formattedValue, label];
                        }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "3px solid #3b82f6",
                          borderRadius: "12px",
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px', color: '#1f2937' }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "50px", fontSize: "14px", fontWeight: 600, paddingLeft: "60px" }}
                        iconType="circle"
                        iconSize={12}
                      />
                      <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="5 5" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="availableFunds"
                        stroke="#10b981"
                        strokeWidth={4}
                        dot={{ fill: "#10b981", r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                        activeDot={{ r: 8 }}
                        name="Available Funds"
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={4}
                        dot={{ fill: "#ef4444", r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                        activeDot={{ r: 8 }}
                        name="Expenses"
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        dot={{ fill: "#3b82f6", r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                        activeDot={{ r: 8 }}
                        name="Ending Balance"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Chart explanation */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-3">
                    <h5 className="font-bold text-heading text-sm mb-2">📖 How to Read This Chart:</h5>
                    <ul className="text-xs text-body space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">💚</span>
                        <span><span className="font-bold text-green-600">Green</span> = Total money available at semester start</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">❤️</span>
                        <span><span className="font-bold text-red-600">Red</span> = Expenses for that semester</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">💙</span>
                        <span><span className="font-bold text-blue-600">Blue</span> = Money left after expenses (below $0 = need loans)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">📊</span>
                        <span>Hover over any point for exact amounts</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insight and Action Items - Takes up 1 column */}
            <div>
              {keyInsight && (
                <Card className="bg-amber-50 border-amber-200 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <h3 className="text-lg font-bold">Key insight</h3>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed mb-4">
                      {keyInsight.message}
                    </p>
                    <div className="space-y-3">
                      <p className="font-semibold text-sm">Test what-if scenarios</p>
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full bg-red-500 hover:bg-red-600"
                        onClick={() => navigate("/scenarios")}
                      >
                        <Sliders className="w-5 h-5 mr-2" />
                        Scenarios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Items & Alerts */}
              <Card className="shadow-sm mt-[50px]">
                <CardContent className="pt-4">
                  <h3 className="text-lg font-bold mb-3">Action Items</h3>

                  <div className="space-y-3">
                    {/* Dynamic alerts based on financial situation */}
                    {latestCalculation.projectedBalance < 0 && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Projected Shortfall</p>
                            <p className="text-xs text-red-700 mt-1">
                              You're projected to be {formatCurrency(Math.abs(latestCalculation.projectedBalance))} short. Consider increasing work hours or applying for more aid.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {latestCalculation.currentBalance < 1000 && (
                      <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-900">Low Starting Balance</p>
                            <p className="text-xs text-amber-700 mt-1">
                              Consider building up your savings before the semester starts.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {latestCalculation.projectedBalance >= 0 && (
                      <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-green-900">On Track!</p>
                            <p className="text-xs text-green-700 mt-1">
                              You're projected to graduate with a positive balance. Keep up the great work!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action suggestions */}
                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Suggestions</p>

                      <button
                        className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors"
                        onClick={() => navigate("/calculator")}
                      >
                        <p className="text-sm font-medium">Test Different Scenarios</p>
                        <p className="text-xs text-muted-foreground">See how changes affect your outcome</p>
                      </button>

                      <button
                        className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors"
                        onClick={() => navigate("/calculator")}
                      >
                        <p className="text-sm font-medium">Update Your Calculation</p>
                        <p className="text-xs text-muted-foreground">Keep your numbers current</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {/* Progress Tracking */}
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <h3 className="text-lg font-bold mb-3">Progress Tracking</h3>

                {/* Semesters Progress */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Semesters Remaining</span>
                      <span className="font-semibold">{latestCalculation.remainingSemesters || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{
                          width: `${Math.max(0, 100 - ((latestCalculation.remainingSemesters || 0) / 8 * 100))}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial Health Score */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Financial Health</span>
                      <span className="font-semibold">
                        {(() => {
                          const score = latestCalculation.projectedBalance >= 0
                            ? Math.min(100, 70 + (latestCalculation.projectedBalance / 1000) * 3)
                            : Math.max(0, 70 + (latestCalculation.projectedBalance / 1000) * 5);
                          return Math.round(score);
                        })()}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          (() => {
                            const score = latestCalculation.projectedBalance >= 0
                              ? Math.min(100, 70 + (latestCalculation.projectedBalance / 1000) * 3)
                              : Math.max(0, 70 + (latestCalculation.projectedBalance / 1000) * 5);
                            return score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                          })()
                        }`}
                        style={{
                          width: `${(() => {
                            const score = latestCalculation.projectedBalance >= 0
                              ? Math.min(100, 70 + (latestCalculation.projectedBalance / 1000) * 3)
                              : Math.max(0, 70 + (latestCalculation.projectedBalance / 1000) * 5);
                            return Math.round(score);
                          })()}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Graduation Countdown */}
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Graduation</p>
                    <p className="text-lg font-bold">
                      {(() => {
                        const yearsLeft = (latestCalculation.remainingSemesters || 0) / 2;
                        const graduationDate = new Date();
                        graduationDate.setFullYear(graduationDate.getFullYear() + Math.floor(yearsLeft));
                        const month = graduationDate.toLocaleDateString('en-US', { month: 'long' });
                        return `${month} ${graduationDate.getFullYear()}`;
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Breakdown */}
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <h3 className="text-lg font-bold mb-3">Financial Breakdown</h3>

                <div className="space-y-4">
                  {/* Total Costs */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Total Costs</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tuition & Fees</span>
                        <span className="font-medium">{formatCurrency(latestCalculation.tuition || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Housing</span>
                        <span className="font-medium">{formatCurrency(latestCalculation.housingCost || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Meals</span>
                        <span className="font-medium">{formatCurrency(latestCalculation.mealPlanCost || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Books & Supplies</span>
                        <span className="font-medium">{formatCurrency(latestCalculation.booksCost || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Transportation</span>
                        <span className="font-medium">{formatCurrency(latestCalculation.transportationCost || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Other Expenses</span>
                        <span className="font-medium">{formatCurrency(latestCalculation.otherExpenses || 0)}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(latestCalculation.totalCost || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost per metrics */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Cost/Credit</p>
                        <p className="text-lg font-bold">{formatCurrency(latestCalculation.costPerCredit || 0)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Cost/Year</p>
                        <p className="text-lg font-bold">{formatCurrency(latestCalculation.costPerYear || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Other tabs content */}
      {activeTab === "finances" && (
        <div className="container mx-auto px-12 py-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">My finances</h2>
              <p className="text-muted-foreground text-sm">Track your actual expenses and income</p>
            </div>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setShowAddTransaction(true)}
            >
              + Add transaction
            </Button>
          </div>

          {/* Summary Cards - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Income this month */}
            <Card className="bg-green-50 border-green-100">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Income this month</p>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">$</span>
                  <p className="text-4xl font-bold text-green-600">{totalIncome.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Expense this month */}
            <Card className="bg-red-50 border-red-100">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Expense this month</p>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-2xl">$</span>
                  <p className="text-4xl font-bold text-red-600">-{totalExpenses.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Net */}
            <Card className={`${netAmount >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Net</p>
                <div className="flex items-center gap-2">
                  <span className={`${netAmount >= 0 ? "text-green-600" : "text-red-600"} text-2xl`}>$</span>
                  <p className={`text-4xl font-bold ${netAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {netAmount >= 0 ? "+" : ""}{netAmount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Budgeted and Actual - Income and Expense Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Budgeted and Actual Income */}
            <div>
              <h3 className="text-xl font-bold mb-3">Budgeted and actual income</h3>

              <Card>
                <CardContent className="pt-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-lg font-bold mb-4">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} (this month)</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Budgeted income</span>
                        <p className="text-green-600 font-bold">$ {budgetedMonthlyIncome.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Actual income</span>
                        <p className="text-green-600 font-bold">$ {totalIncome.toFixed(2)}</p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="font-semibold">{totalIncome >= budgetedMonthlyIncome ? "Over budget" : "Under budget"}</span>
                        <p className={`font-bold ${totalIncome >= budgetedMonthlyIncome ? "text-green-600" : "text-red-600"}`}>
                          $ {Math.abs(totalIncome - budgetedMonthlyIncome).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budgeted and Actual Living Expenses */}
            <div>
              <h3 className="text-xl font-bold mb-3">Budgeted and actual living expenses</h3>

              <Card>
                <CardContent className="pt-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-lg font-bold mb-4">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} (this month)</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Budgeted living expenses</span>
                        <p className="text-red-600 font-bold">$ {budgetedMonthlyLivingExpense.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Actual living expenses</span>
                        <p className="text-red-600 font-bold">$ {totalExpenses.toFixed(2)}</p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="font-semibold">{totalExpenses <= budgetedMonthlyLivingExpense ? "Under budget" : "Over budget"}</span>
                        <p className={`font-bold ${totalExpenses <= budgetedMonthlyLivingExpense ? "text-green-600" : "text-red-600"}`}>
                          $ {Math.abs(budgetedMonthlyLivingExpense - totalExpenses).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Row 3: Expenses by Category (30%) and Transactions (70%) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-6">
            {/* Expenses by category - 30% */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-bold mb-3">Expenses by category</h3>

              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {Object.keys(spendingByCategory).length > 0 ? (
                      Object.entries(spendingByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="text-muted-foreground">
                                {getCategoryIcon(category)}
                              </div>
                              <span className="font-medium capitalize">{category}</span>
                            </div>
                            <p className="text-red-600 font-bold">$ {amount.toFixed(2)}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">No expenses yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions - 70% */}
            <div className="lg:col-span-7">
              <h3 className="text-xl font-bold mb-3">Transactions</h3>

              {/* Tabs */}
              <div className="flex gap-6 border-b mb-3">
                <button
                  onClick={() => setTransactionFilter("all")}
                  className={`pb-2 border-b-2 ${
                    transactionFilter === "all"
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTransactionFilter("expenses")}
                  className={`pb-2 border-b-2 ${
                    transactionFilter === "expenses"
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setTransactionFilter("income")}
                  className={`pb-2 border-b-2 ${
                    transactionFilter === "income"
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Transaction List */}
              <Card className="bg-red-50/30">
                <CardContent className="pt-4">
                  {filteredTransactions.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-semibold text-foreground">{transaction.name}</p>
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {getCategoryIcon(transaction.category)}
                              <span className="text-sm capitalize">{transaction.category}</span>
                            </div>
                            <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                              $ {transaction.type === "income" ? "+" : "-"}{transaction.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Click "+ Add transaction" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Add a transaction</h2>
            <button
              onClick={() => setShowAddTransaction(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Transaction Name */}
            <div>
              <Label htmlFor="transaction-name" className="text-lg font-semibold mb-2 block">
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

            {/* Type */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Type</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={setTransactionType}
                className="flex gap-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" className="w-5 h-5" />
                  <Label htmlFor="income" className="text-base font-normal cursor-pointer">
                    Income
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" className="w-5 h-5" />
                  <Label htmlFor="expense" className="text-base font-normal cursor-pointer">
                    Expense
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-lg font-semibold mb-2 block">
                Category
              </Label>
              <Select value={transactionCategory} onValueChange={setTransactionCategory}>
                <SelectTrigger className="h-12 text-base rounded-full border-2 border-gray-300">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-lg font-semibold mb-2 block">
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

            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-lg font-semibold mb-2 block">
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

            {/* Add Button */}
            <Button
              onClick={handleAddTransaction}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white text-base rounded-full mt-4"
            >
              + Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
