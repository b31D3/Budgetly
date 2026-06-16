import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import BottomNav from "@/components/BottomNav";
import {
  Briefcase,
  DollarSign,
  Sliders,
  LayoutDashboard,
  Settings,
  Pencil,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  getUserScenarios,
  saveScenario,
  deleteScenario,
  updateScenario,
  type ScenarioData,
  type ScenarioPeriod,
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

import SidebarIcon from "@/components/SidebarIcon";

// ─── Period helpers ───
const PERIOD_OPTIONS: { value: ScenarioPeriod; label: string; months: number }[] = [
  { value: "all",    label: "All year",        months: 12 },
  { value: "summer", label: "Summer only",      months: 4  },
  { value: "school", label: "School year only", months: 8  },
  { value: "winter", label: "Winter only",      months: 4  },
  { value: "fall",   label: "Fall only",        months: 4  },
];

const getPeriodMonths = (period: ScenarioPeriod = "all") =>
  PERIOD_OPTIONS.find((p) => p.value === period)?.months ?? 12;

const getPeriodLabel = (period: ScenarioPeriod = "all") =>
  PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "All year";

// ─── Semester helpers ───
const getCurrentSemester = (): { semester: string; year: number } => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month >= 1 && month <= 4) return { semester: "Winter", year };
  if (month >= 5 && month <= 8) return { semester: "Summer", year };
  return { semester: "Fall", year };
};

const generateSemesterOptions = (count = 9): string[] => {
  const { semester: cur, year: curYear } = getCurrentSemester();
  const order = ["Winter", "Summer", "Fall"];
  let idx = order.indexOf(cur);
  let year = curYear;
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    list.push(`${order[idx]} ${year}`);
    idx++;
    if (idx >= order.length) { idx = 0; year++; }
  }
  return list;
};

const Scenarios = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [latestCalculation, setLatestCalculation] = useState<CalculationData | null>(null);

  const semesterOptions = generateSemesterOptions(9);

  // Form state
  const [scenarioName, setScenarioName] = useState("");
  const [monthlyIncomeChange, setMonthlyIncomeChange] = useState(0);
  const [monthlyExpenseChange, setMonthlyExpenseChange] = useState(0);
  const [period, setPeriod] = useState<ScenarioPeriod>("all");
  const [oneTimeEventName, setOneTimeEventName] = useState("");
  const [oneTimeEventAmount, setOneTimeEventAmount] = useState("");
  const [oneTimeEventEffect, setOneTimeEventEffect] = useState<"income" | "expense">("expense");
  const [oneTimeEventSemester, setOneTimeEventSemester] = useState("");

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    (async () => {
      try {
        const [scenariosData, calcs] = await Promise.all([
          getUserScenarios(currentUser.uid),
          getUserCalculations(currentUser.uid),
        ]);
        setScenarios(scenariosData);
        setLatestCalculation(calcs.length > 0 ? calcs[0] : null);
      } catch {
        toast.error("Failed to load scenarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  const calculateScenarioImpact = (
    incomeChange: number,
    expenseChange: number,
    scenarioPeriod: ScenarioPeriod = "all",
    oneTimeEvent?: { amount: number; effect: "income" | "expense"; semester: string }
  ): number => {
    if (!latestCalculation) return 0;
    const base = latestCalculation.projectedBalance || 0;
    const monthlyNetChange = incomeChange - expenseChange;
    // Derive total applicable months from remaining semesters + period filter
    const years = (latestCalculation.remainingSemesters || 6) / 2;
    const applicableMonths = getPeriodMonths(scenarioPeriod) * years;
    const totalMonthlyImpact = monthlyNetChange * applicableMonths;
    const oneTimeImpact = oneTimeEvent && oneTimeEvent.amount > 0
      ? (oneTimeEvent.effect === "income" ? oneTimeEvent.amount : -oneTimeEvent.amount)
      : 0;
    return base + totalMonthlyImpact + oneTimeImpact;
  };

  const resetForm = () => {
    setScenarioName("");
    setMonthlyIncomeChange(0);
    setMonthlyExpenseChange(0);
    setPeriod("all");
    setOneTimeEventName("");
    setOneTimeEventAmount("");
    setOneTimeEventSemester("");
    setOneTimeEventEffect("expense");
  };

  const getOneTimeEvent = () =>
    oneTimeEventName.trim() && parseFloat(oneTimeEventAmount) > 0 && oneTimeEventSemester
      ? { name: oneTimeEventName, amount: parseFloat(oneTimeEventAmount), effect: oneTimeEventEffect, semester: oneTimeEventSemester }
      : undefined;

  const handleCreateScenario = async () => {
    if (!currentUser || !scenarioName.trim()) { toast.error("Please enter a scenario name"); return; }
    try {
      const oneTimeEvent = getOneTimeEvent();
      await saveScenario({
        userId: currentUser.uid,
        name: scenarioName,
        monthlyIncomeChange,
        monthlyExpenseChange,
        period,
        oneTimeEvent,
        projectedBalance: calculateScenarioImpact(monthlyIncomeChange, monthlyExpenseChange, period, oneTimeEvent),
      });
      setScenarios(await getUserScenarios(currentUser.uid));
      resetForm();
      setShowCreateDialog(false);
      toast.success("Scenario created!");
    } catch { toast.error("Failed to create scenario"); }
  };

  const handleViewDetails = (scenario: ScenarioData) => {
    setSelectedScenario(scenario);
    setScenarioName(scenario.name);
    setMonthlyIncomeChange(scenario.monthlyIncomeChange);
    setMonthlyExpenseChange(scenario.monthlyExpenseChange);
    setPeriod(scenario.period ?? "all");
    if (scenario.oneTimeEvent) {
      setOneTimeEventName(scenario.oneTimeEvent.name);
      setOneTimeEventAmount(scenario.oneTimeEvent.amount.toString());
      setOneTimeEventEffect(scenario.oneTimeEvent.effect);
      setOneTimeEventSemester(scenario.oneTimeEvent.semester);
    } else {
      setOneTimeEventName(""); setOneTimeEventAmount(""); setOneTimeEventSemester("");
    }
    setShowDetailDialog(true);
  };

  const handleUpdateScenario = async () => {
    if (!selectedScenario || !currentUser) return;
    try {
      const oneTimeEvent = getOneTimeEvent();
      await updateScenario(selectedScenario.id!, {
        name: scenarioName,
        monthlyIncomeChange,
        monthlyExpenseChange,
        period,
        oneTimeEvent,
        projectedBalance: calculateScenarioImpact(monthlyIncomeChange, monthlyExpenseChange, period, oneTimeEvent),
      });
      setScenarios(await getUserScenarios(currentUser.uid));
      setShowDetailDialog(false);
      toast.success("Scenario updated!");
    } catch { toast.error("Failed to update scenario"); }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await deleteScenario(scenarioId);
      setScenarios(await getUserScenarios(currentUser!.uid));
      setShowDetailDialog(false);
      toast.success("Scenario deleted");
    } catch { toast.error("Failed to delete scenario"); }
  };

  const generateChartData = (scenario: ScenarioData) => {
    if (!latestCalculation?.semesterData) return [];
    const monthlyChange = scenario.monthlyIncomeChange - scenario.monthlyExpenseChange;
    return latestCalculation.semesterData.map((s: any, i: number) => {
      const accumulated = monthlyChange * (i * 4);
      const oneTime = scenario.oneTimeEvent && s.semesterLabel === scenario.oneTimeEvent.semester
        ? (scenario.oneTimeEvent.effect === "income" ? scenario.oneTimeEvent.amount : -scenario.oneTimeEvent.amount)
        : 0;
      return { name: s.semesterLabel, Current: s.balance || 0, Scenario: (s.balance || 0) + accumulated + oneTime };
    });
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  const getBestScenario = () =>
    scenarios.length === 0 ? null : scenarios.reduce((b, c) => c.projectedBalance > b.projectedBalance ? c : b);

  const getPeriodLabelTranslated = (p: ScenarioPeriod = "all"): string => ({
    all: t.scenarios.periodAllYear,
    summer: t.scenarios.periodSummer,
    school: t.scenarios.periodSchool,
    winter: t.scenarios.periodWinter,
    fall: t.scenarios.periodFall,
  }[p] ?? t.scenarios.periodAllYear);

  if (!currentUser) { navigate("/signin"); return null; }

  const bestScenario = getBestScenario();


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <BottomNav />

      <div className="flex flex-1">
        {/* ── Left Sidebar ── */}
        <aside className={`hidden lg:flex border-r border-border bg-white flex-col items-center py-4 gap-2 sticky top-[57px] h-[calc(100vh-57px)] flex-shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-48 px-3" : "w-16"}`}>
          {/* Expand toggle — top */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`mb-1 w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ${sidebarExpanded ? "self-end" : ""}`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarExpanded ? "rotate-180" : ""}`} />
          </button>
          <SidebarIcon icon={LayoutDashboard} label={t.nav.dashboard} expanded={sidebarExpanded} onClick={() => navigate("/dashboard")} />
          <SidebarIcon icon={DollarSign} label={t.nav.finances} expanded={sidebarExpanded} onClick={() => navigate("/dashboard?tab=finances")} />
          <SidebarIcon icon={Sliders} label={t.nav.scenarios} active expanded={sidebarExpanded} />
          <SidebarIcon icon={Pencil} label={t.nav.edit} expanded={sidebarExpanded} onClick={() => navigate("/edit")} />
          <SidebarIcon icon={Settings} label={t.nav.settings} expanded={sidebarExpanded} onClick={() => navigate("/settings")} />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 px-4 md:px-8 py-8 overflow-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">{t.scenarios.title}</h1>
              <p className="text-sm text-muted-foreground">
                {t.scenarios.subtitle}
              </p>
            </div>
            <Button
              onClick={() => { resetForm(); setShowCreateDialog(true); }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2 text-sm font-semibold"
            >
              {t.scenarios.addScenario}
            </Button>
          </div>

          {/* Current Plan baseline */}
          {latestCalculation && (
            <div className="bg-white border border-border rounded-2xl px-6 py-5 mb-6 flex items-center justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold">{t.scenarios.currentPlan}</span>
                  <span className="text-xs font-medium bg-red-50 text-red-400 border border-red-200 px-2 py-0.5 rounded-full">
                    {t.scenarios.baseline}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.scenarios.currentPlanDesc}
                </p>
              </div>
              <span className={`text-2xl font-bold ${(latestCalculation.projectedBalance || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                {(latestCalculation.projectedBalance || 0) >= 0 ? "+" : ""}
                {formatCurrency(latestCalculation.projectedBalance || 0)}
              </span>
            </div>
          )}

          {/* No calculation warning */}
          {!latestCalculation && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-5 mb-6 text-sm text-yellow-700">
              {t.scenarios.noCalculation}
            </div>
          )}

          {/* Scenarios list */}
          {loading ? (
            <p className="text-sm text-muted-foreground">{t.common.loading}</p>
          ) : scenarios.length === 0 ? (
            <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground mb-1">{t.scenarios.noScenarios}</p>
              <p className="text-sm text-muted-foreground">{t.scenarios.noScenariosDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const baseBalance = latestCalculation?.projectedBalance || 0;
                const difference = scenario.projectedBalance - baseBalance;
                const isImprovement = difference >= 0;
                const isBest = bestScenario?.id === scenario.id;

                return (
                  <div key={scenario.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base leading-snug">{scenario.name}</h3>
                      {isBest && (
                        <span className="text-xs font-semibold bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {t.scenarios.bestOption}
                        </span>
                      )}
                    </div>

                    {/* Change details */}
                    <div className="space-y-1">
                      {scenario.monthlyIncomeChange !== 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {scenario.monthlyIncomeChange > 0 ? t.scenarios.extra : t.scenarios.reduce}{" "}
                            <strong className="text-foreground">${Math.abs(scenario.monthlyIncomeChange)}/mo</strong> {t.dashboard.income.toLowerCase()}
                          </span>
                        </div>
                      )}
                      {scenario.monthlyExpenseChange !== 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {scenario.monthlyExpenseChange > 0 ? t.scenarios.extra : t.scenarios.save}{" "}
                            <strong className="text-foreground">${Math.abs(scenario.monthlyExpenseChange)}/mo</strong> {t.dashboard.expenses.toLowerCase()}
                          </span>
                        </div>
                      )}
                      {scenario.period && scenario.period !== "all" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {t.scenarios.applies} <strong className="text-foreground">{getPeriodLabelTranslated(scenario.period)}</strong>
                          </span>
                        </div>
                      )}
                      {scenario.oneTimeEvent && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span>{formatCurrency(scenario.oneTimeEvent.amount)} {scenario.oneTimeEvent.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border" />

                    {/* Balance box */}
                    <div className={`rounded-xl p-4 ${scenario.projectedBalance >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                      <p className={`text-3xl font-bold ${scenario.projectedBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {scenario.projectedBalance >= 0 ? "" : "-"}
                        {formatCurrency(Math.abs(scenario.projectedBalance))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-3">{t.common.atGraduation}</p>
                      <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t.scenarios.vsCurrentPlan}</span>
                        <div className="flex items-center gap-1">
                          {isImprovement
                            ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                            : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                          <span className={`text-xs font-bold ${isImprovement ? "text-green-600" : "text-red-500"}`}>
                            {isImprovement ? "+" : ""}{formatCurrency(difference)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleViewDetails(scenario)}
                        className="flex-1 text-sm font-medium border border-border rounded-lg py-2 hover:bg-gray-50 transition-colors"
                      >
                        {t.scenarios.viewDetails}
                      </button>
                      <button
                        onClick={() => handleDeleteScenario(scenario.id!)}
                        className="flex-1 text-sm font-medium border border-border rounded-lg py-2 hover:bg-gray-50 transition-colors text-muted-foreground"
                      >
                        {t.common.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Create Dialog ── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t.scenarios.addScenarioTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
              <div>
                <Label className="text-sm font-semibold">{t.scenarios.scenarioName}</Label>
                <Input
                  placeholder={t.scenarios.scenarioNamePlaceholder}
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t.scenarios.whenApplies}</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  {t.scenarios.whenAppliesDesc}
                </p>
                <Select value={period} onValueChange={(v) => setPeriod(v as ScenarioPeriod)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.scenarios.periodAllYear} />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {getPeriodLabelTranslated(opt.value)}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({opt.months} {t.scenarios.monthsPerYear})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-semibold">{t.scenarios.adjustMonthlyIncome}</Label>
                  <span className={`text-sm font-semibold ${monthlyIncomeChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {monthlyIncomeChange >= 0 ? "+" : ""}${monthlyIncomeChange}/mo
                  </span>
                </div>
                <Slider value={[monthlyIncomeChange]} onValueChange={(v) => setMonthlyIncomeChange(v[0])} min={-500} max={1000} step={10} className="mt-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-semibold">{t.scenarios.adjustMonthlyExpenses}</Label>
                  <span className={`text-sm font-semibold ${monthlyExpenseChange <= 0 ? "text-green-600" : "text-red-500"}`}>
                    {monthlyExpenseChange >= 0 ? "+" : ""}${monthlyExpenseChange}/mo
                  </span>
                </div>
                <Slider value={[monthlyExpenseChange]} onValueChange={(v) => setMonthlyExpenseChange(v[0])} min={-500} max={500} step={10} className="mt-3" />
              </div>
              <div className="border border-border rounded-xl p-4 bg-gray-50">
                <Label className="text-sm font-semibold">{t.scenarios.oneTimeEvent} <span className="text-muted-foreground font-normal">({t.common.optional})</span></Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Input placeholder={t.scenarios.eventName} value={oneTimeEventName} onChange={(e) => setOneTimeEventName(e.target.value)} />
                  <Select value={oneTimeEventEffect} onValueChange={(v: "income" | "expense") => setOneTimeEventEffect(v)}>
                    <SelectTrigger><SelectValue placeholder={t.scenarios.eventType} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t.dashboard.income}</SelectItem>
                      <SelectItem value="expense">{t.dashboard.expense}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={oneTimeEventSemester} onValueChange={setOneTimeEventSemester}>
                    <SelectTrigger><SelectValue placeholder={t.scenarios.eventSemester} /></SelectTrigger>
                    <SelectContent>{semesterOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="relative mt-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                  <Input type="number" placeholder={t.scenarios.eventAmount} value={oneTimeEventAmount} onChange={(e) => setOneTimeEventAmount(e.target.value)} className="pl-7" />
                </div>
              </div>
            </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t.common.cancel}</Button>
            <Button onClick={handleCreateScenario} className="bg-red-500 hover:bg-red-600 text-white px-6">
              {t.common.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Detail / Edit Dialog ── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t.scenarios.scenarioDetails}</DialogTitle>
          </DialogHeader>

          {selectedScenario && (
            <div className="py-2 space-y-6">
              {/* Chart */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold mb-3">{t.scenarios.cashFlowProjection}</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateChartData(selectedScenario)} margin={{ top: 10, right: 20, left: 50, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="Current" stroke="#9ca3af" strokeWidth={2} name={t.scenarios.currentPlanLine} dot={false} />
                    <Line type="monotone" dataKey="Scenario" stroke="#ef4444" strokeWidth={2.5} name={t.scenarios.thisScenario} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Edit form */}
              <div>
                <p className="text-sm font-semibold mb-4">{t.scenarios.editScenario}</p>
                <div className="space-y-6 py-2">
              <div>
                <Label className="text-sm font-semibold">{t.scenarios.scenarioName}</Label>
                <Input
                  placeholder={t.scenarios.scenarioNamePlaceholder}
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t.scenarios.whenApplies}</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  {t.scenarios.whenAppliesDesc}
                </p>
                <Select value={period} onValueChange={(v) => setPeriod(v as ScenarioPeriod)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.scenarios.periodAllYear} />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {getPeriodLabelTranslated(opt.value)}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({opt.months} {t.scenarios.monthsPerYear})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-semibold">{t.scenarios.adjustMonthlyIncome}</Label>
                  <span className={`text-sm font-semibold ${monthlyIncomeChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {monthlyIncomeChange >= 0 ? "+" : ""}${monthlyIncomeChange}/mo
                  </span>
                </div>
                <Slider value={[monthlyIncomeChange]} onValueChange={(v) => setMonthlyIncomeChange(v[0])} min={-500} max={1000} step={10} className="mt-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-semibold">{t.scenarios.adjustMonthlyExpenses}</Label>
                  <span className={`text-sm font-semibold ${monthlyExpenseChange <= 0 ? "text-green-600" : "text-red-500"}`}>
                    {monthlyExpenseChange >= 0 ? "+" : ""}${monthlyExpenseChange}/mo
                  </span>
                </div>
                <Slider value={[monthlyExpenseChange]} onValueChange={(v) => setMonthlyExpenseChange(v[0])} min={-500} max={500} step={10} className="mt-3" />
              </div>
              <div className="border border-border rounded-xl p-4 bg-gray-50">
                <Label className="text-sm font-semibold">{t.scenarios.oneTimeEvent} <span className="text-muted-foreground font-normal">({t.common.optional})</span></Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Input placeholder={t.scenarios.eventName} value={oneTimeEventName} onChange={(e) => setOneTimeEventName(e.target.value)} />
                  <Select value={oneTimeEventEffect} onValueChange={(v: "income" | "expense") => setOneTimeEventEffect(v)}>
                    <SelectTrigger><SelectValue placeholder={t.scenarios.eventType} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t.dashboard.income}</SelectItem>
                      <SelectItem value="expense">{t.dashboard.expense}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={oneTimeEventSemester} onValueChange={setOneTimeEventSemester}>
                    <SelectTrigger><SelectValue placeholder={t.scenarios.eventSemester} /></SelectTrigger>
                    <SelectContent>{semesterOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="relative mt-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                  <Input type="number" placeholder={t.scenarios.eventAmount} value={oneTimeEventAmount} onChange={(e) => setOneTimeEventAmount(e.target.value)} className="pl-7" />
                </div>
              </div>
            </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleUpdateScenario} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                  {t.common.saveChanges}
                </Button>
                <Button variant="outline" onClick={() => handleDeleteScenario(selectedScenario.id!)} className="flex-1">
                  {t.scenarios.deleteScenario}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scenarios;
