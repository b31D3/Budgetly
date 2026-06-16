import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { useAuth } from "../../contexts/AuthContext";
import { calculateSemesterBreakdown, calculateSummary } from "../../lib/calculator";
import { saveCalculation } from "../../services/calculatorService";
import { Colors } from "../../constants/colors";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { Step1 } from "../../components/calculator/Step1";
import { Step2 } from "../../components/calculator/Step2";
import { Step3 } from "../../components/calculator/Step3";
import { Step4Results } from "../../components/calculator/Step4Results";
import { DEFAULT_FORM, type FormState, type FormErrors } from "../../components/calculator/types";

const STORAGE_KEY = "budgetly_calculator_form";
const TOTAL_STEPS = 4;

function validateStep(step: number, form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (step === 1) {
    if (!form.semestersLeft) errors.semestersLeft = "Please select number of semesters";
    if (!form.tuition) {
      errors.tuition = "Tuition is required";
    } else if (isNaN(parseFloat(form.tuition)) || parseFloat(form.tuition) < 0) {
      errors.tuition = "Enter a valid tuition amount";
    }
  }
  if (step === 3) {
    if (!form.hasJob) errors.hasJob = "Please indicate if you have a job";
  }
  return errors;
}

export default function CalculatorScreen() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load persisted form on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setForm(JSON.parse(raw) as FormState);
      })
      .catch(() => {})
      .finally(() => setHasLoaded(true));
  }, []);

  // Persist form on every change
  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form)).catch(() => {});
  }, [form, hasLoaded]);

  const onChange = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Only calculate on step 4
  const semesterData = useMemo(() => {
    if (step !== 4) return [];
    return calculateSemesterBreakdown(form as any, {
      includeTaxes: false,
      taxRate: 0.15,
      includeInflation: false,
      inflationRate: 0,
    });
  }, [step, form]);

  const summary = useMemo(() => calculateSummary(semesterData), [semesterData]);

  const handleNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSave = useCallback(async () => {
    if (!currentUser) {
      Alert.alert("Sign in required", "Please sign in to save your calculation.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
      ]);
      return;
    }
    try {
      setIsSaving(true);
      const totalCost = summary.totalCosts;
      const semestersCount = parseInt(form.semestersLeft || "0");
      const yearsToGraduate = semestersCount / 2;

      await saveCalculation({
        userId: currentUser.uid,
        tuition: parseFloat(form.tuition || "0"),
        creditsPerSemester: 15,
        semestersPerYear: 2,
        yearsToGraduate,
        housingCost: parseFloat(form.rent || "0") * 12,
        mealPlanCost: parseFloat(form.groceries || "0") * 12,
        booksCost: parseFloat(form.books || "0") * 2,
        transportationCost: parseFloat(form.transportation || "0") * 12,
        otherExpenses:
          (parseFloat(form.utilities || "0") +
            parseFloat(form.memberships || "0") +
            parseFloat(form.cellPhone || "0")) * 12,
        totalCost,
        costPerCredit: totalCost / (semestersCount * 15 || 1),
        costPerYear: yearsToGraduate > 0 ? totalCost / yearsToGraduate : 0,
        currentBalance: parseFloat(form.savings || "0"),
        remainingSemesters: semestersCount,
        projectedBalance: summary.finalBalance,
        semesterData: semesterData.map((s) => ({
          semesterLabel: s.semesterLabel,
          balance: s.balance,
          costs: s.costs,
          income: s.totalIncome,
          isSummer: s.isSummer,
        })),
        formInputs: { ...form },
      });

      Alert.alert("Saved!", "Your calculation has been saved to the dashboard.", [
        { text: "View Dashboard", onPress: () => router.push("/(tabs)/dashboard") },
        { text: "Stay here", style: "cancel" },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, form, summary, semesterData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Budgetly</Text>
        <Text style={styles.subtitle}>Cash Flow Calculator</Text>
      </View>

      <View style={styles.card}>
        <StepIndicator total={TOTAL_STEPS} current={step} />

        <KeyboardAvoidingView
          style={styles.stepContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {step === 1 && <Step1 form={form} errors={errors} onChange={onChange} />}
          {step === 2 && <Step2 form={form} errors={errors} onChange={onChange} />}
          {step === 3 && <Step3 form={form} errors={errors} onChange={onChange} />}
          {step === 4 && (
            <Step4Results
              semesterData={semesterData}
              summary={summary}
              onSave={handleSave}
              onRecalculate={() => setStep(1)}
              isSaving={isSaving}
              isLoggedIn={!!currentUser}
            />
          )}
        </KeyboardAvoidingView>

        {step < 4 && (
          <View style={styles.navRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {step === 3 ? "Calculate →" : "Next →"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  logo: { fontSize: 24, fontWeight: "700", color: Colors.primary },
  subtitle: { fontSize: 13, color: Colors.textSecondary },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  stepContainer: { flex: 1 },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  backBtn: { padding: 12 },
  backBtnText: { fontSize: 15, color: Colors.textSecondary, fontWeight: "500" },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
