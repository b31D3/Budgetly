import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Briefcase, DollarSign, X, Sliders } from "lucide-react";
import {
  getUserScenarios,
  saveScenario,
  deleteScenario,
  updateScenario,
  type ScenarioData,
} from "@/services/scenarioService";
import { getUserCalculations, type CalculationData } from "@/services/calculatorService";
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

const Scenarios = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [latestCalculation, setLatestCalculation] = useState<CalculationData | null>(null);

  // Form states
  const [scenarioName, setScenarioName] = useState("");
  const [monthlyIncomeChange, setMonthlyIncomeChange] = useState(0);
  const [monthlyExpenseChange, setMonthlyExpenseChange] = useState(0);
  const [oneTimeEventName, setOneTimeEventName] = useState("");
  const [oneTimeEventAmount, setOneTimeEventAmount] = useState("");
  const [oneTimeEventEffect, setOneTimeEventEffect] = useState<"income" | "expense">("expense");
  const [oneTimeEventSemester, setOneTimeEventSemester] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const [scenariosData, calculationsData] = await Promise.all([
          getUserScenarios(currentUser.uid),
          getUserCalculations(currentUser.uid),
        ]);
        setScenarios(scenariosData);
        setLatestCalculation(calculationsData.length > 0 ? calculationsData[0] : null);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load scenarios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const calculateScenarioImpact = (
    incomeChange: number,
    expenseChange: number,
    oneTimeEvent?: { amount: number; effect: "income" | "expense"; semester: string }
  ): number => {
    if (!latestCalculation) return 0;

    // Start with the projected balance from the calculator (balance at graduation)
    const baseProjectedBalance = latestCalculation.projectedBalance || 0;

    // FIXED: Use 36 months (6 semesters) unless otherwise specified
    // User specified: 36 months = 6 semesters
    const totalMonths = 36;

    // Calculate monthly net change (positive = more money, negative = less money)
    // If income increases by $100 and expenses stay same: +$100/month net change
    // If income stays same and expenses increase by $50: -$50/month net change
    const monthlyNetChange = incomeChange - expenseChange;

    // Calculate total impact over 36 months (6 semesters)
    const totalMonthlyImpact = monthlyNetChange * totalMonths;

    // Add one-time event impact
    let oneTimeImpact = 0;
    if (oneTimeEvent && oneTimeEvent.amount > 0) {
      oneTimeImpact = oneTimeEvent.effect === "income"
        ? oneTimeEvent.amount
        : -oneTimeEvent.amount;
    }

    // MATH EXPLANATION:
    // Example: Baseline = $5,112, Car loan = $340/month expense
    // monthlyNetChange = 0 - 340 = -$340
    // totalMonthlyImpact = -340 × 36 months = -$12,240
    // newBalance = 5,112 + (-12,240) = -$7,128
    //
    // This matches your expected result!

    // New projected balance = base projected balance + monthly changes + one-time events
    return baseProjectedBalance + totalMonthlyImpact + oneTimeImpact;
  };

  const handleCreateScenario = async () => {
    if (!currentUser || !scenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }

    try {
      const oneTimeEvent = oneTimeEventName.trim() && parseFloat(oneTimeEventAmount) > 0 && oneTimeEventSemester
        ? {
            name: oneTimeEventName,
            amount: parseFloat(oneTimeEventAmount),
            effect: oneTimeEventEffect,
            semester: oneTimeEventSemester,
          }
        : undefined;

      const projectedBalance = calculateScenarioImpact(
        monthlyIncomeChange,
        monthlyExpenseChange,
        oneTimeEvent
      );

      await saveScenario({
        userId: currentUser.uid,
        name: scenarioName,
        monthlyIncomeChange,
        monthlyExpenseChange,
        oneTimeEvent,
        projectedBalance,
      });

      // Refresh scenarios
      const updatedScenarios = await getUserScenarios(currentUser.uid);
      setScenarios(updatedScenarios);

      // Reset form
      setScenarioName("");
      setMonthlyIncomeChange(0);
      setMonthlyExpenseChange(0);
      setOneTimeEventName("");
      setOneTimeEventAmount("");
      setOneTimeEventSemester("");
      setShowCreateDialog(false);

      toast.success("Scenario created successfully!");
    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error("Failed to create scenario");
    }
  };

  const handleViewDetails = (scenario: ScenarioData) => {
    setSelectedScenario(scenario);
    setScenarioName(scenario.name);
    setMonthlyIncomeChange(scenario.monthlyIncomeChange);
    setMonthlyExpenseChange(scenario.monthlyExpenseChange);
    if (scenario.oneTimeEvent) {
      setOneTimeEventName(scenario.oneTimeEvent.name);
      setOneTimeEventAmount(scenario.oneTimeEvent.amount.toString());
      setOneTimeEventEffect(scenario.oneTimeEvent.effect);
      setOneTimeEventSemester(scenario.oneTimeEvent.semester);
    } else {
      setOneTimeEventName("");
      setOneTimeEventAmount("");
      setOneTimeEventSemester("");
    }
    setShowDetailDialog(true);
  };

  const handleUpdateScenario = async () => {
    if (!selectedScenario || !currentUser) return;

    try {
      const oneTimeEvent = oneTimeEventName.trim() && parseFloat(oneTimeEventAmount) > 0 && oneTimeEventSemester
        ? {
            name: oneTimeEventName,
            amount: parseFloat(oneTimeEventAmount),
            effect: oneTimeEventEffect,
            semester: oneTimeEventSemester,
          }
        : undefined;

      const projectedBalance = calculateScenarioImpact(
        monthlyIncomeChange,
        monthlyExpenseChange,
        oneTimeEvent
      );

      await updateScenario(selectedScenario.id!, {
        name: scenarioName,
        monthlyIncomeChange,
        monthlyExpenseChange,
        oneTimeEvent,
        projectedBalance,
      });

      const updatedScenarios = await getUserScenarios(currentUser.uid);
      setScenarios(updatedScenarios);
      setShowDetailDialog(false);
      toast.success("Scenario updated successfully!");
    } catch (error) {
      console.error("Error updating scenario:", error);
      toast.error("Failed to update scenario");
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await deleteScenario(scenarioId);
      const updatedScenarios = await getUserScenarios(currentUser!.uid);
      setScenarios(updatedScenarios);
      setShowDetailDialog(false);
      toast.success("Scenario deleted");
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast.error("Failed to delete scenario");
    }
  };

  const generateScenarioChartData = (scenario: ScenarioData) => {
    if (!latestCalculation?.semesterData) return [];

    const baseData = latestCalculation.semesterData;
    const monthlyChange = scenario.monthlyIncomeChange - scenario.monthlyExpenseChange;

    return baseData.map((semester: any, index: number) => {
      // Calculate accumulated change up to this semester
      const monthsElapsed = index * 4;
      const accumulatedChange = monthlyChange * monthsElapsed;

      // Add one-time event if it affects this semester
      let oneTimeImpact = 0;
      if (scenario.oneTimeEvent && semester.semesterLabel === scenario.oneTimeEvent.semester) {
        oneTimeImpact = scenario.oneTimeEvent.effect === "income"
          ? scenario.oneTimeEvent.amount
          : -scenario.oneTimeEvent.amount;
      }

      return {
        name: semester.semesterLabel,
        Current: semester.balance || 0,
        Scenario: (semester.balance || 0) + accumulatedChange + oneTimeImpact,
      };
    });
  };

  const getScenarioStatus = (projectedBalance: number): { label: string; color: string } => {
    if (projectedBalance >= 1000) return { label: "Great!", color: "bg-green-100 text-green-700 border-green-200" };
    if (projectedBalance >= 0) return { label: "Good", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (projectedBalance >= -2000) return { label: "Short", color: "bg-red-100 text-red-700 border-red-200" };
    return { label: "Critical", color: "bg-red-200 text-red-900 border-red-300" };
  };

  const getBestScenario = (): ScenarioData | null => {
    if (scenarios.length === 0) return null;
    return scenarios.reduce((best, current) =>
      current.projectedBalance > best.projectedBalance ? current : best
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
          <p>Loading scenarios...</p>
        </div>
      </div>
    );
  }

  const bestScenario = getBestScenario();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex gap-2 md:gap-8 md:justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-4 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/my-finances")}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-4 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Finances</span>
            </button>
            <button
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-4 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base border-primary text-primary font-medium"
            >
              <Sliders className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Scenarios</span>
            </button>
            <button
              onClick={() => navigate("/edit")}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-4 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-4 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your scenarios</h1>
            <p className="text-muted-foreground">
              Test different financial decisions to find your best path to graduation
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            + Create new scenario
          </Button>
        </div>

        {/* Current Plan Card */}
        {latestCalculation && (
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-background to-accent/5">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">Current plan</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      Baseline
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your current financial projection based on calculator inputs
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Projected balance at graduation</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-4xl font-bold ${
                        (latestCalculation.projectedBalance || 0) >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {(latestCalculation.projectedBalance || 0) >= 0 ? "+" : ""}
                      {formatCurrency(latestCalculation.projectedBalance || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scenarios Grid */}
        {scenarios.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No scenarios yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Create new scenario" to test different financial decisions
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => {
              const status = getScenarioStatus(scenario.projectedBalance);
              const isBest = bestScenario?.id === scenario.id;

              // Calculate difference from current projection
              const baseProjectedBalance = latestCalculation?.projectedBalance || 0;
              const difference = scenario.projectedBalance - baseProjectedBalance;
              const isImprovement = difference > 0;

              return (
                <Card
                  key={scenario.id}
                  className={`${
                    scenario.projectedBalance >= 0 ? "bg-green-50" : "bg-red-50"
                  } border transition-shadow hover:shadow-md`}
                >
                  <CardContent className="pt-6 pb-6">
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                          isBest
                            ? "bg-green-100 text-green-700 border-green-200"
                            : status.color
                        }`}
                      >
                        {isBest ? "Best option" : status.label}
                      </span>
                    </div>

                    {/* Scenario Name */}
                    <h3 className="text-xl font-bold mb-4">{scenario.name}</h3>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {scenario.monthlyIncomeChange !== 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4" />
                          <span>
                            {scenario.monthlyIncomeChange > 0 ? "Extra" : "Reduce"}{" "}
                            {formatCurrency(Math.abs(scenario.monthlyIncomeChange))}/month income
                          </span>
                        </div>
                      )}
                      {scenario.monthlyExpenseChange !== 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {scenario.monthlyExpenseChange > 0 ? "Increase" : "Save"}{" "}
                            {formatCurrency(Math.abs(scenario.monthlyExpenseChange))}/month
                            {scenario.monthlyExpenseChange < 0 &&
                              ` (${formatCurrency(Math.abs(scenario.monthlyExpenseChange) * 12)}/yr)`}
                          </span>
                        </div>
                      )}
                      {scenario.oneTimeEvent && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {formatCurrency(scenario.oneTimeEvent.amount)} {scenario.oneTimeEvent.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Projected Balance with Comparison */}
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-500 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">$</span>
                          </div>
                          <div>
                            <span
                              className={`text-3xl font-bold ${
                                scenario.projectedBalance >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {scenario.projectedBalance >= 0 ? "+" : ""}
                              {formatCurrency(scenario.projectedBalance).replace("$", "")}
                            </span>
                            <p className="text-sm text-muted-foreground">At graduation</p>
                          </div>
                        </div>
                      </div>

                      {/* Comparison Bar */}
                      <div className={`pt-3 border-t ${isImprovement ? "border-green-200" : "border-red-200"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">vs. Current plan</span>
                          <div className="flex items-center gap-1">
                            {isImprovement ? (
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className={`text-sm font-bold ${isImprovement ? "text-green-600" : "text-red-600"}`}>
                              {isImprovement ? "+" : ""}{formatCurrency(difference)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(scenario)}
                      >
                        View details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteScenario(scenario.id!)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Scenario Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">Create new scenario</DialogTitle>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Scenario Name */}
            <div>
              <Label htmlFor="scenario-name" className="text-base font-semibold">
                Scenario name
              </Label>
              <Input
                id="scenario-name"
                placeholder="e.g., Work more hours in the summer"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Adjust Income */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Adjust income</Label>
                <span className="text-sm font-medium">
                  {monthlyIncomeChange >= 0 ? "+" : ""}${monthlyIncomeChange}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Monthly income change</p>
              <Slider
                value={[monthlyIncomeChange]}
                onValueChange={(value) => setMonthlyIncomeChange(value[0])}
                min={-500}
                max={1000}
                step={10}
                className="w-full"
              />
            </div>

            {/* Adjust Expense */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Adjust expense</Label>
                <span className="text-sm font-medium">
                  {monthlyExpenseChange >= 0 ? "+" : ""}${monthlyExpenseChange}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Monthly expense change</p>
              <Slider
                value={[monthlyExpenseChange]}
                onValueChange={(value) => setMonthlyExpenseChange(value[0])}
                min={-500}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            {/* One Time Events */}
            <div className="border rounded-lg p-4 bg-red-50">
              <Label className="text-base font-semibold">One time events (optional)</Label>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <Input
                  placeholder="Event name"
                  value={oneTimeEventName}
                  onChange={(e) => setOneTimeEventName(e.target.value)}
                />

                <Select value={oneTimeEventEffect} onValueChange={(value: "income" | "expense") => setOneTimeEventEffect(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Effect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={oneTimeEventSemester} onValueChange={setOneTimeEventSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                    <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                    <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                    <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                    <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                    <SelectItem value="Spring 2027">Spring 2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-lg font-bold">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={oneTimeEventAmount}
                    onChange={(e) => setOneTimeEventAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleCreateScenario}
              className="bg-red-500 hover:bg-red-600 text-white px-8"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scenario Detail/Edit Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Scenario details</DialogTitle>
          </DialogHeader>

          {selectedScenario && (
            <div className="py-4">
              {/* Line Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cash flow projection</h3>
                <div className="bg-accent/5 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={generateScenarioChartData(selectedScenario)} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        label={{ value: 'Semester', position: 'insideBottom', offset: -25, style: { fontSize: 16, fontWeight: 'bold', fill: '#374151' } }}
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
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "40px" }} />
                      <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="Current"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        name="Current Plan"
                      />
                      <Line
                        type="monotone"
                        dataKey="Scenario"
                        stroke="#ef4444"
                        strokeWidth={3}
                        name="This Scenario"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4 -mt-12">
                <h3 className="text-lg font-semibold">Edit scenario</h3>

                {/* Scenario Name */}
                <div>
                  <Label htmlFor="edit-scenario-name" className="text-base font-semibold">
                    Scenario name
                  </Label>
                  <Input
                    id="edit-scenario-name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Adjust Income */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">Adjust income</Label>
                    <span className="text-sm font-medium">
                      {monthlyIncomeChange >= 0 ? "+" : ""}${monthlyIncomeChange}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Monthly income change</p>
                  <Slider
                    value={[monthlyIncomeChange]}
                    onValueChange={(value) => setMonthlyIncomeChange(value[0])}
                    min={-500}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Adjust Expense */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">Adjust expense</Label>
                    <span className="text-sm font-medium">
                      {monthlyExpenseChange >= 0 ? "+" : ""}${monthlyExpenseChange}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Monthly expense change</p>
                  <Slider
                    value={[monthlyExpenseChange]}
                    onValueChange={(value) => setMonthlyExpenseChange(value[0])}
                    min={-500}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* One Time Events */}
                <div className="border rounded-lg p-4 bg-red-50">
                  <Label className="text-base font-semibold">One time events (optional)</Label>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <Input
                      placeholder="Event name"
                      value={oneTimeEventName}
                      onChange={(e) => setOneTimeEventName(e.target.value)}
                    />

                    <Select value={oneTimeEventEffect} onValueChange={(value: "income" | "expense") => setOneTimeEventEffect(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Effect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={oneTimeEventSemester} onValueChange={setOneTimeEventSemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                        <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                        <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                        <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                        <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                        <SelectItem value="Spring 2027">Spring 2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-lg font-bold">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={oneTimeEventAmount}
                        onChange={(e) => setOneTimeEventAmount(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdateScenario}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Save changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteScenario(selectedScenario.id!)}
                  className="flex-1"
                >
                  Delete scenario
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Scenarios;
