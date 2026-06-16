import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";

import { useAuth } from "../../contexts/AuthContext";
import {
  getUserScenarios,
  saveScenario,
  updateScenario,
  deleteScenario,
  type ScenarioData,
  type ScenarioPeriod,
  type OneTimeEvent,
} from "../../services/scenarioService";
import { getUserCalculations, type CalculationData } from "../../services/calculatorService";
import { Colors } from "../../constants/colors";

// ─── helpers ───────────────────────────────────────────────────────
const PERIOD_OPTIONS: { value: ScenarioPeriod; label: string; months: number }[] = [
  { value: "all",    label: "All year",   months: 12 },
  { value: "summer", label: "Summer",     months: 4  },
  { value: "school", label: "School yr",  months: 8  },
  { value: "winter", label: "Winter",     months: 4  },
  { value: "fall",   label: "Fall",       months: 4  },
];

const getPeriodMonths = (p: ScenarioPeriod = "all") =>
  PERIOD_OPTIONS.find((o) => o.value === p)?.months ?? 12;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(n));

const getCurrentSemester = () => {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m <= 4) return { semester: "Winter", year: y };
  if (m <= 8) return { semester: "Summer", year: y };
  return { semester: "Fall", year: y };
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

// ─── Stepper control ───────────────────────────────────────────────
function Stepper({
  label,
  value,
  onChange,
  step = 50,
  min = -500,
  max = 1000,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  color?: string;
}) {
  const valueColor = color ?? (value >= 0 ? Colors.secondary : Colors.danger);
  return (
    <View style={stepperStyles.container}>
      <View style={stepperStyles.header}>
        <Text style={stepperStyles.label}>{label}</Text>
        <Text style={[stepperStyles.value, { color: valueColor }]}>
          {value >= 0 ? "+" : "-"}${Math.abs(value)}/mo
        </Text>
      </View>
      <View style={stepperStyles.controls}>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={stepperStyles.btnText}>−</Text>
        </TouchableOpacity>
        <View style={stepperStyles.track}>
          <View
            style={[
              stepperStyles.fill,
              {
                width: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: valueColor,
              },
            ]}
          />
        </View>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={stepperStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  value: { fontSize: 13, fontWeight: "700" },
  controls: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: "center", alignItems: "center",
  },
  btnText: { fontSize: 20, lineHeight: 22, color: Colors.textPrimary, fontWeight: "300" },
  track: {
    flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3 },
});

// ─── Scenario comparison chart ─────────────────────────────────────
function ScenarioChart({ scenario, calc }: { scenario: ScenarioData; calc: CalculationData }) {
  const data = (() => {
    if (!calc.semesterData?.length) return [];
    const monthlyChange = scenario.monthlyIncomeChange - scenario.monthlyExpenseChange;
    return calc.semesterData.map((s: any, i: number) => {
      const accumulated = monthlyChange * (i * 4);
      const oneTime = scenario.oneTimeEvent && s.semesterLabel === scenario.oneTimeEvent.semester
        ? (scenario.oneTimeEvent.effect === "income"
            ? scenario.oneTimeEvent.amount
            : -scenario.oneTimeEvent.amount)
        : 0;
      return {
        label: s.semesterLabel as string,
        current: (s.balance ?? 0) as number,
        scenarioVal: ((s.balance ?? 0) + accumulated + oneTime) as number,
      };
    });
  })();

  const W = Dimensions.get("window").width - 48;
  const H = 160;
  const PAD = { top: 12, bottom: 28, left: 8, right: 8 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  if (data.length < 2) return null;

  const allVals = data.flatMap((d) => [d.current, d.scenarioVal]);
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(0, ...allVals);
  const range = maxV - minV || 1;

  const scaleY = (v: number) => PAD.top + iH - ((v - minV) / range) * iH;
  const scaleX = (i: number) => PAD.left + (i / (data.length - 1)) * iW;

  const makePath = (key: "current" | "scenarioVal") => {
    const pts = data.map((d, i) => ({ x: scaleX(i), y: scaleY(d[key]) }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cp} ${pts[i - 1].y}, ${cp} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  };

  const zeroY = scaleY(0);
  const step = data.length <= 6 ? 1 : 2;

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8 }}>
        Cash Flow Projection
      </Text>
      <Svg width={W} height={H}>
        {zeroY > PAD.top && zeroY < PAD.top + iH && (
          <Line x1={PAD.left} y1={zeroY} x2={PAD.left + iW} y2={zeroY}
            stroke={Colors.border} strokeWidth={1} strokeDasharray="4,4" />
        )}
        <Path d={makePath("current")} fill="none" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5,3" />
        <Path d={makePath("scenarioVal")} fill="none" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" />
        {data.map((d, i) => {
          if (i % step !== 0 && i !== data.length - 1) return null;
          const short = d.label.replace("Winter", "Win").replace("Summer", "Sum");
          return (
            <SvgText key={i} x={scaleX(i)} y={H - 4} fontSize={8} fill={Colors.textMuted} textAnchor="middle">
              {short}
            </SvgText>
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", gap: 16, marginTop: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 14, height: 2, backgroundColor: "#9ca3af", borderStyle: "dashed", borderWidth: 1, borderColor: "#9ca3af" }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Current Plan</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 14, height: 2.5, backgroundColor: Colors.primary, borderRadius: 2 }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>This Scenario</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Default form state ────────────────────────────────────────────
const DEFAULT_FORM = {
  name: "",
  monthlyIncomeChange: 0,
  monthlyExpenseChange: 0,
  period: "all" as ScenarioPeriod,
  oneTimeEventName: "",
  oneTimeEventAmount: "",
  oneTimeEventEffect: "expense" as "income" | "expense",
  oneTimeEventSemester: "",
};

// ─── Main screen ───────────────────────────────────────────────────
export default function ScenariosScreen() {
  const { currentUser } = useAuth();
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [latestCalc, setLatestCalc] = useState<CalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<ScenarioData | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);

  const semesterOptions = generateSemesterOptions(9);

  const load = useCallback(async () => {
    if (!currentUser) { setLoading(false); return; }
    try {
      const [scenariosData, calcs] = await Promise.all([
        getUserScenarios(currentUser.uid),
        getUserCalculations(currentUser.uid),
      ]);
      setScenarios(scenariosData);
      setLatestCalc(calcs.length > 0 ? calcs[0] : null);
    } catch {
      Alert.alert("Error", "Failed to load scenarios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const calcProjectedBalance = (
    incomeChange: number,
    expenseChange: number,
    period: ScenarioPeriod,
    oneTimeEvent?: OneTimeEvent
  ): number => {
    if (!latestCalc) return 0;
    const base = latestCalc.projectedBalance ?? 0;
    const monthlyNet = incomeChange - expenseChange;
    const years = (latestCalc.remainingSemesters ?? 6) / 2;
    const months = getPeriodMonths(period) * years;
    const oneTimeImpact = oneTimeEvent && oneTimeEvent.amount > 0
      ? (oneTimeEvent.effect === "income" ? oneTimeEvent.amount : -oneTimeEvent.amount)
      : 0;
    return base + monthlyNet * months + oneTimeImpact;
  };

  const getOneTimeEvent = (): OneTimeEvent | undefined => {
    const amount = parseFloat(form.oneTimeEventAmount);
    if (form.oneTimeEventName.trim() && amount > 0 && form.oneTimeEventSemester) {
      return {
        name: form.oneTimeEventName.trim(),
        amount,
        effect: form.oneTimeEventEffect,
        semester: form.oneTimeEventSemester,
      };
    }
    return undefined;
  };

  const resetForm = () => setForm(DEFAULT_FORM);

  const handleCreate = async () => {
    if (!currentUser || !form.name.trim()) {
      Alert.alert("Error", "Please enter a scenario name");
      return;
    }
    setSaving(true);
    try {
      const oneTimeEvent = getOneTimeEvent();
      await saveScenario({
        userId: currentUser.uid,
        name: form.name.trim(),
        monthlyIncomeChange: form.monthlyIncomeChange,
        monthlyExpenseChange: form.monthlyExpenseChange,
        period: form.period,
        oneTimeEvent,
        projectedBalance: calcProjectedBalance(
          form.monthlyIncomeChange, form.monthlyExpenseChange, form.period, oneTimeEvent
        ),
      });
      await load();
      resetForm();
      setShowCreate(false);
    } catch {
      Alert.alert("Error", "Failed to create scenario");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected || !currentUser) return;
    setSaving(true);
    try {
      const oneTimeEvent = getOneTimeEvent();
      await updateScenario(selected.id!, {
        name: form.name.trim(),
        monthlyIncomeChange: form.monthlyIncomeChange,
        monthlyExpenseChange: form.monthlyExpenseChange,
        period: form.period,
        oneTimeEvent,
        projectedBalance: calcProjectedBalance(
          form.monthlyIncomeChange, form.monthlyExpenseChange, form.period, oneTimeEvent
        ),
      });
      await load();
      setShowDetail(false);
    } catch {
      Alert.alert("Error", "Failed to update scenario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Scenario", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteScenario(id);
            await load();
            setShowDetail(false);
          } catch {
            Alert.alert("Error", "Failed to delete scenario");
          }
        },
      },
    ]);
  };

  const openDetail = (scenario: ScenarioData) => {
    setSelected(scenario);
    setForm({
      name: scenario.name,
      monthlyIncomeChange: scenario.monthlyIncomeChange,
      monthlyExpenseChange: scenario.monthlyExpenseChange,
      period: scenario.period ?? "all",
      oneTimeEventName: scenario.oneTimeEvent?.name ?? "",
      oneTimeEventAmount: scenario.oneTimeEvent?.amount?.toString() ?? "",
      oneTimeEventEffect: scenario.oneTimeEvent?.effect ?? "expense",
      oneTimeEventSemester: scenario.oneTimeEvent?.semester ?? "",
    });
    setShowDetail(true);
  };

  const bestScenario = scenarios.length > 0
    ? scenarios.reduce((b, c) => c.projectedBalance > b.projectedBalance ? c : b)
    : null;

  // ── Scenario form (shared between create & detail modals) ──
  const ScenarioForm = () => (
    <>
      <Text style={s.fieldLabel}>Scenario Name</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Get a part-time job"
        placeholderTextColor={Colors.textMuted}
        value={form.name}
        onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
      />

      <Text style={[s.fieldLabel, { marginTop: 16 }]}>When it applies</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, marginBottom: 4 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {PERIOD_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[s.periodChip, form.period === opt.value && s.periodChipActive]}
              onPress={() => setForm((f) => ({ ...f, period: opt.value }))}
            >
              <Text style={[s.periodChipText, form.period === opt.value && s.periodChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 16 }}>
        <Stepper
          label="Monthly Income Change"
          value={form.monthlyIncomeChange}
          onChange={(v) => setForm((f) => ({ ...f, monthlyIncomeChange: v }))}
          min={-500} max={1000} step={50}
        />
        <Stepper
          label="Monthly Expense Change"
          value={form.monthlyExpenseChange}
          onChange={(v) => setForm((f) => ({ ...f, monthlyExpenseChange: v }))}
          min={-500} max={500} step={50}
          color={form.monthlyExpenseChange <= 0 ? Colors.secondary : Colors.danger}
        />
      </View>

      {/* One-time event */}
      <View style={s.oneTimeBox}>
        <Text style={s.fieldLabel}>One-Time Event <Text style={{ fontWeight: "400", color: Colors.textMuted }}>(optional)</Text></Text>
        <TextInput
          style={[s.input, { marginTop: 8 }]}
          placeholder="Event name (e.g. Scholarship)"
          placeholderTextColor={Colors.textMuted}
          value={form.oneTimeEventName}
          onChangeText={(v) => setForm((f) => ({ ...f, oneTimeEventName: v }))}
        />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          {(["income", "expense"] as const).map((eff) => (
            <TouchableOpacity
              key={eff}
              style={[s.periodChip, { flex: 1 }, form.oneTimeEventEffect === eff && s.periodChipActive]}
              onPress={() => setForm((f) => ({ ...f, oneTimeEventEffect: eff }))}
            >
              <Text style={[s.periodChipText, form.oneTimeEventEffect === eff && s.periodChipTextActive]}>
                {eff.charAt(0).toUpperCase() + eff.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[s.input, { marginTop: 8 }]}
          placeholder="Amount (e.g. 2000)"
          placeholderTextColor={Colors.textMuted}
          value={form.oneTimeEventAmount}
          onChangeText={(v) => setForm((f) => ({ ...f, oneTimeEventAmount: v }))}
          keyboardType="numeric"
        />
        <Text style={[s.fieldLabel, { marginTop: 10, marginBottom: 6 }]}>Semester</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {semesterOptions.map((sem) => (
              <TouchableOpacity
                key={sem}
                style={[s.periodChip, form.oneTimeEventSemester === sem && s.periodChipActive]}
                onPress={() => setForm((f) => ({ ...f, oneTimeEventSemester: sem }))}
              >
                <Text style={[s.periodChipText, form.oneTimeEventSemester === sem && s.periodChipTextActive]}>
                  {sem}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Scenarios</Text>
          <Text style={s.subtitle}>Compare what-if financial plans</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { resetForm(); setShowCreate(true); }}>
          <Text style={s.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Baseline card */}
        {latestCalc && (
          <View style={s.baselineCard}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.baselineTitle}>Current Plan</Text>
                <View style={s.baselineBadge}><Text style={s.baselineBadgeText}>Baseline</Text></View>
              </View>
              <Text style={s.baselineSub}>Your projected graduation balance</Text>
            </View>
            <Text style={[s.baselineAmount, { color: (latestCalc.projectedBalance ?? 0) >= 0 ? Colors.secondary : Colors.danger }]}>
              {(latestCalc.projectedBalance ?? 0) >= 0 ? "+" : "-"}{fmt(latestCalc.projectedBalance ?? 0)}
            </Text>
          </View>
        )}

        {!latestCalc && !loading && (
          <View style={s.warnBox}>
            <Text style={s.warnText}>Run the calculator first to create scenarios.</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : scenarios.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>🔀</Text>
            <Text style={s.emptyTitle}>No scenarios yet</Text>
            <Text style={s.emptySub}>Tap "+ New" to explore what-if plans</Text>
          </View>
        ) : (
          scenarios.map((scenario) => {
            const base = latestCalc?.projectedBalance ?? 0;
            const diff = scenario.projectedBalance - base;
            const positive = diff >= 0;
            const isBest = bestScenario?.id === scenario.id;

            return (
              <View key={scenario.id} style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.cardName} numberOfLines={1}>{scenario.name}</Text>
                  {isBest && scenarios.length > 1 && (
                    <View style={s.bestBadge}><Text style={s.bestBadgeText}>Best</Text></View>
                  )}
                </View>

                {/* Details row */}
                <View style={s.cardDetails}>
                  {scenario.monthlyIncomeChange !== 0 && (
                    <Text style={s.detailText}>
                      Income: <Text style={{ fontWeight: "600", color: scenario.monthlyIncomeChange > 0 ? Colors.secondary : Colors.danger }}>
                        {scenario.monthlyIncomeChange > 0 ? "+" : "-"}${Math.abs(scenario.monthlyIncomeChange)}/mo
                      </Text>
                    </Text>
                  )}
                  {scenario.monthlyExpenseChange !== 0 && (
                    <Text style={s.detailText}>
                      Expenses: <Text style={{ fontWeight: "600", color: scenario.monthlyExpenseChange > 0 ? Colors.danger : Colors.secondary }}>
                        {scenario.monthlyExpenseChange > 0 ? "+" : "-"}${Math.abs(scenario.monthlyExpenseChange)}/mo
                      </Text>
                    </Text>
                  )}
                  {scenario.period && scenario.period !== "all" && (
                    <Text style={s.detailText}>
                      Period: <Text style={{ fontWeight: "600", color: Colors.textPrimary }}>
                        {PERIOD_OPTIONS.find((o) => o.value === scenario.period)?.label}
                      </Text>
                    </Text>
                  )}
                  {scenario.oneTimeEvent && (
                    <Text style={s.detailText}>
                      One-time: <Text style={{ fontWeight: "600", color: Colors.textPrimary }}>
                        {fmt(scenario.oneTimeEvent.amount)} {scenario.oneTimeEvent.name}
                      </Text>
                    </Text>
                  )}
                </View>

                <View style={s.divider} />

                {/* Balance box */}
                <View style={[s.balanceBox, { backgroundColor: scenario.projectedBalance >= 0 ? "#f0fdf4" : "#fef2f2" }]}>
                  <Text style={[s.balanceAmount, { color: scenario.projectedBalance >= 0 ? Colors.secondary : Colors.danger }]}>
                    {scenario.projectedBalance >= 0 ? "+" : "-"}{fmt(scenario.projectedBalance)}
                  </Text>
                  <Text style={s.balanceSub}>at graduation</Text>
                  <View style={s.vsRow}>
                    <Text style={s.vsLabel}>vs Current Plan</Text>
                    <Text style={[s.vsDiff, { color: positive ? Colors.secondary : Colors.danger }]}>
                      {positive ? "▲ +" : "▼ -"}{fmt(diff)}
                    </Text>
                  </View>
                </View>

                <View style={s.cardActions}>
                  <TouchableOpacity style={s.actionBtn} onPress={() => openDetail(scenario)}>
                    <Text style={s.actionBtnText}>View & Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={() => handleDelete(scenario.id!)}>
                    <Text style={[s.actionBtnText, { color: Colors.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Create Modal ── */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCreate(false)}>
        <SafeAreaView style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Scenario</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={s.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <ScenarioForm />
          </ScrollView>
          <View style={s.modalFooter}>
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>Create Scenario</Text>
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Detail / Edit Modal ── */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDetail(false)}>
        <SafeAreaView style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Scenario Details</Text>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Text style={s.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            {selected && latestCalc && (
              <View style={s.chartBox}>
                <ScenarioChart scenario={selected} calc={latestCalc} />
              </View>
            )}
            <Text style={[s.sectionLabel, { marginBottom: 12 }]}>Edit Scenario</Text>
            <ScenarioForm />
          </ScrollView>
          <View style={s.modalFooter}>
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>Save Changes</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={s.deleteBtnFull}
              onPress={() => handleDelete(selected?.id!)}
            >
              <Text style={s.deleteBtnFullText}>Delete Scenario</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Baseline
  baselineCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  baselineTitle: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  baselineSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  baselineBadge: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  baselineBadgeText: { fontSize: 10, fontWeight: "600", color: Colors.primary },
  baselineAmount: { fontSize: 22, fontWeight: "700" },

  warnBox: { backgroundColor: "#fefce8", borderWidth: 1, borderColor: "#fde68a", borderRadius: 14, padding: 14, marginBottom: 12 },
  warnText: { fontSize: 13, color: "#92400e" },

  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary, marginTop: 12 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  // Cards
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, flex: 1 },
  bestBadge: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#86efac", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  bestBadgeText: { fontSize: 10, fontWeight: "600", color: "#16a34a" },
  cardDetails: { gap: 3, marginBottom: 10 },
  detailText: { fontSize: 12, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },
  balanceBox: { borderRadius: 12, padding: 12, marginBottom: 10 },
  balanceAmount: { fontSize: 26, fontWeight: "700" },
  balanceSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, marginBottom: 8 },
  vsRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  vsLabel: { fontSize: 11, color: Colors.textSecondary },
  vsDiff: { fontSize: 12, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: "center",
  },
  deleteBtn: {},
  actionBtnText: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  modalClose: { fontSize: 15, color: Colors.primary, fontWeight: "600" },
  modalBody: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  modalFooter: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10, gap: 8 },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  deleteBtnFull: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 12, alignItems: "center",
  },
  deleteBtnFullText: { fontSize: 14, fontWeight: "600", color: Colors.danger },

  // Form
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: Colors.textPrimary, backgroundColor: Colors.surface,
  },
  periodChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodChipText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  periodChipTextActive: { color: "#fff" },
  oneTimeBox: {
    marginTop: 16, padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: "#f8fafc",
  },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  chartBox: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
});
