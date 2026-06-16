import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { Colors } from "../constants/colors";
import { ONBOARDING_KEY } from "../constants/storage";
import { calculateSemesterBreakdown, calculateSummary } from "../lib/calculator";
import { saveCalculation } from "../services/calculatorService";

const { width: WIN_W, height: WIN_H } = Dimensions.get("window");
const HEADER_H = 64;
const PAGE_H = WIN_H - HEADER_H;
const TOTAL_STEPS = 4;

// ── Dots ───────────────────────────────────────────────────────────────
function Dots({ current }: { current: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View key={i} style={[s.dot, i === current && s.dotActive]} />
      ))}
    </View>
  );
}

// ── Pill chips ─────────────────────────────────────────────────────────
function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.chipRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[s.chip, value === o.value && s.chipActive]}
          onPress={() => onChange(o.value)}
        >
          <Text style={[s.chipText, value === o.value && s.chipTextActive]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Number stepper ─────────────────────────────────────────────────────
function Stepper({
  value,
  onChange,
  min = 1,
  max = 12,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <View style={s.stepperRow}>
      <TouchableOpacity
        style={[s.stepBtn, value <= min && s.stepBtnDim]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Text style={s.stepBtnText}>−</Text>
      </TouchableOpacity>
      <View style={s.stepValue}>
        <Text style={s.stepNum}>{value}</Text>
        {unit ? <Text style={s.stepUnit}>{unit}</Text> : null}
      </View>
      <TouchableOpacity
        style={[s.stepBtn, value >= max && s.stepBtnDim]}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Text style={s.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Dollar field ───────────────────────────────────────────────────────
function Field({
  label,
  hint,
  value,
  onChange,
  placeholder = "0",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {hint ? <Text style={s.fieldHint}>{hint}</Text> : null}
      <View style={s.inputRow}>
        <Text style={s.inputPrefix}>$</Text>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { currentUser } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 2
  const [studentType, setStudentType] = useState<"domestic" | "international">("domestic");
  const [semesters, setSemesters] = useState(4);

  // Step 3
  const [savings, setSavingsVal] = useState("");
  const [hasJob, setHasJob] = useState<"yes" | "no">("no");
  const [hoursSchool, setHoursSchool] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [aid, setAid] = useState("");

  // Step 4
  const [tuition, setTuition] = useState("");
  const [rent, setRent] = useState("");
  const [groceries, setGroceries] = useState("");
  const [phone, setPhone] = useState("");

  const goTo = (n: number) => {
    setStep(n);
    scrollRef.current?.scrollTo({ x: n * WIN_W, animated: true });
  };

  const handleFinish = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const formData = {
        semestersLeft: String(semesters),
        tuition: tuition || "0",
        books: "0",
        supplies: "0",
        rent: rent || "0",
        utilities: "0",
        groceries: groceries || "0",
        cellPhone: phone || "0",
        transportation: "0",
        memberships: "0",
        hasJob,
        hoursPerWeekSchool: hoursSchool || "0",
        hoursPerWeekSummer: hoursSchool || "0",
        hourlyRate: hourlyRate || "0",
        scholarship: "0",
        bursary: aid || "0",
        grant: "0",
        savings: savings || "0",
      };

      const semesterData = calculateSemesterBreakdown(formData);
      const summary = calculateSummary(semesterData);

      const tuitionNum = parseFloat(tuition) || 0;
      const rentNum = parseFloat(rent) || 0;
      const groceriesNum = parseFloat(groceries) || 0;
      const phoneNum = parseFloat(phone) || 0;
      const savingsNum = parseFloat(savings) || 0;

      await saveCalculation({
        userId: currentUser.uid,
        tuition: tuitionNum,
        creditsPerSemester: 5,
        semestersPerYear: 2,
        yearsToGraduate: Math.ceil(semesters / 2),
        housingCost: rentNum,
        mealPlanCost: groceriesNum,
        booksCost: 0,
        transportationCost: 0,
        otherExpenses: phoneNum,
        totalCost: summary.totalCosts,
        costPerCredit: 0,
        costPerYear: summary.totalCosts / Math.max(1, Math.ceil(semesters / 2)),
        currentBalance: savingsNum,
        remainingSemesters: semesters,
        projectedBalance: summary.finalBalance,
        semesterData,
        formInputs: {
          studentType,
          semestersLeft: String(semesters),
          rent: rent || "0",
          groceries: groceries || "0",
          cellPhone: phone || "0",
          hasJob,
          hoursPerWeekSchool: hoursSchool || "0",
          hoursPerWeekSummer: hoursSchool || "0",
          hourlyRate: hourlyRate || "0",
          bursary: aid || "0",
          savings: savings || "0",
        },
      });

      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={() => goTo(step - 1)} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.backBtn} />
        )}
        <Dots current={step} />
        <View style={s.backBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step 1: Welcome ─────────────────────────────────── */}
          <View style={[s.page, { width: WIN_W, height: PAGE_H }]}>
            <View style={s.pageTop}>
              <Image source={require("../assets/logo.png")} style={s.logo} resizeMode="contain" />
              <Text style={s.welcomeTitle}>Plan smarter,{"\n"}stress less.</Text>
              <Text style={s.welcomeSub}>
                Budgetly helps Canadian students track costs and plan finances — semester by semester.
              </Text>
              <View style={s.features}>
                {[
                  "Semester-by-semester projections",
                  "Track income & expenses",
                  "What-if scenario planning",
                ].map((f) => (
                  <View key={f} style={s.featureRow}>
                    <View style={s.featureDot} />
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={s.pageBottom}>
              <TouchableOpacity style={s.cta} onPress={() => goTo(1)}>
                <Text style={s.ctaText}>Get Started</Text>
              </TouchableOpacity>
              <Text style={s.hint}>Takes about 2 minutes</Text>
            </View>
          </View>

          {/* ── Step 2: About You ───────────────────────────────── */}
          <View style={[s.page, { width: WIN_W, height: PAGE_H }]}>
            <View style={s.pageTop}>
              <Text style={s.stepTitle}>About you</Text>
              <Text style={s.stepSub}>A couple of details to personalize your plan.</Text>

              <Text style={s.fieldLabel}>Student type</Text>
              <Chips
                options={[
                  { label: "Domestic", value: "domestic" },
                  { label: "International", value: "international" },
                ]}
                value={studentType}
                onChange={setStudentType}
              />

              <Text style={[s.fieldLabel, { marginTop: 28 }]}>Semesters remaining</Text>
              <Text style={s.fieldHint}>Include your current semester</Text>
              <Stepper value={semesters} onChange={setSemesters} min={1} max={12} unit="semesters" />
            </View>
            <View style={s.pageBottom}>
              <TouchableOpacity style={s.cta} onPress={() => goTo(2)}>
                <Text style={s.ctaText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Step 3: Income ──────────────────────────────────── */}
          <View style={[s.page, { width: WIN_W, height: PAGE_H }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.stepTitle}>Your income</Text>
              <Text style={s.stepSub}>We'll use this to project your balance over time.</Text>

              <Field label="Current savings" value={savings} onChange={setSavingsVal} placeholder="5,000" />

              <Text style={[s.fieldLabel, { marginTop: 8 }]}>Do you work?</Text>
              <Chips
                options={[
                  { label: "No", value: "no" },
                  { label: "Yes", value: "yes" },
                ]}
                value={hasJob}
                onChange={setHasJob}
              />

              {hasJob === "yes" && (
                <View style={s.workBlock}>
                  <Field label="Hours per week (school)" value={hoursSchool} onChange={setHoursSchool} placeholder="16" />
                  <Field label="Hourly rate" value={hourlyRate} onChange={setHourlyRate} placeholder="17.20" />
                </View>
              )}

              <Field
                label="Financial aid per semester"
                hint="Scholarships, bursaries, grants combined"
                value={aid}
                onChange={setAid}
                placeholder="0"
              />

              <TouchableOpacity style={[s.cta, { marginTop: 24, marginBottom: 8 }]} onPress={() => goTo(3)}>
                <Text style={s.ctaText}>Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ── Step 4: Expenses ────────────────────────────────── */}
          <View style={[s.page, { width: WIN_W, height: PAGE_H }]}>
            <View style={s.pageTop}>
              <Text style={s.stepTitle}>Core expenses</Text>
              <Text style={s.stepSub}>Just the essentials — you can refine these later.</Text>

              <Field label="Yearly tuition" value={tuition} onChange={setTuition} placeholder="7,000" />
              <Field label="Monthly rent" value={rent} onChange={setRent} placeholder="800" />
              <Field label="Monthly groceries" value={groceries} onChange={setGroceries} placeholder="400" />
              <Field label="Monthly phone" value={phone} onChange={setPhone} placeholder="60" />
            </View>
            <View style={s.pageBottom}>
              <TouchableOpacity
                style={[s.cta, saving && s.ctaDim]}
                onPress={handleFinish}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.ctaText}>Build my plan</Text>
                )}
              </TouchableOpacity>
              <Text style={s.hint}>You can update these anytime in the app</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    height: HEADER_H,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backArrow: { fontSize: 30, color: Colors.textSecondary, lineHeight: 36 },

  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 22, backgroundColor: Colors.primary },

  page: { paddingHorizontal: 28, justifyContent: "space-between" },
  pageTop: { paddingTop: 8 },
  pageBottom: { paddingBottom: 20 },

  // Step 1
  logo: { width: 140, height: 42, marginBottom: 36 },
  welcomeTitle: { fontSize: 30, fontWeight: "700", color: Colors.textPrimary, lineHeight: 38, marginBottom: 14 },
  welcomeSub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23, marginBottom: 32 },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  featureText: { fontSize: 15, color: Colors.textPrimary },

  // Steps 2-4
  stepTitle: { fontSize: 26, fontWeight: "700", color: Colors.textPrimary, marginBottom: 6 },
  stepSub: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28, lineHeight: 22 },

  // CTA
  cta: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 8 },
  ctaDim: { opacity: 0.6 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  hint: { fontSize: 13, color: Colors.textMuted, textAlign: "center" },

  // Chips
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },

  // Stepper
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 16 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  stepBtnDim: { opacity: 0.3 },
  stepBtnText: { fontSize: 24, color: Colors.textPrimary, lineHeight: 30 },
  stepValue: { alignItems: "center", minWidth: 90 },
  stepNum: { fontSize: 32, fontWeight: "700", color: Colors.textPrimary },
  stepUnit: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  // Fields
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 4 },
  fieldHint: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  inputPrefix: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textSecondary,
    backgroundColor: "#F1F5F9",
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 13, fontSize: 15, color: Colors.textPrimary },

  workBlock: { marginTop: 12 },
});
