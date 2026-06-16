import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/colors";
import type { SemesterData } from "../../lib/calculator";

interface SummaryStats {
  totalSemesters: number;
  totalCosts: number;
  totalIncome: number;
  finalBalance: number;
  averageCostPerSemester: number;
  averageIncomePerSemester: number;
}

interface Step4ResultsProps {
  semesterData: SemesterData[];
  summary: SummaryStats;
  onSave: () => void;
  onRecalculate: () => void;
  isSaving: boolean;
  isLoggedIn: boolean;
}

function fmt(n: number) {
  return n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function SemesterCard({ s }: { s: SemesterData }) {
  const isDeficit = !s.isSurplus;
  return (
    <View style={[styles.semCard, isDeficit ? styles.semCardDeficit : styles.semCardSurplus]}>
      <View style={styles.semHeader}>
        <Text style={styles.semLabel}>{s.semesterLabel}</Text>
        {s.isSummer && (
          <View style={styles.summerBadge}>
            <Text style={styles.summerBadgeText}>Summer</Text>
          </View>
        )}
      </View>

      <View style={styles.semRow}>
        <View style={styles.semCol}>
          <Text style={styles.semColLabel}>Costs</Text>
          <Text style={[styles.semColValue, { color: Colors.danger }]}>${fmt(s.costs)}</Text>
        </View>
        <View style={styles.semCol}>
          <Text style={styles.semColLabel}>Income</Text>
          <Text style={[styles.semColValue, { color: Colors.secondary }]}>${fmt(s.totalIncome)}</Text>
        </View>
        <View style={styles.semCol}>
          <Text style={styles.semColLabel}>Balance</Text>
          <Text style={[styles.semColValue, { color: isDeficit ? Colors.danger : Colors.secondary }]}>
            {isDeficit ? "-" : ""}${fmt(Math.abs(s.balance))}
          </Text>
        </View>
      </View>

      <View style={[styles.balanceBar, { backgroundColor: isDeficit ? "#FEE2E2" : "#D1FAE5" }]}>
        <Text style={[styles.balanceBarText, { color: isDeficit ? Colors.danger : Colors.secondary }]}>
          {isDeficit ? `Deficit of $${fmt(s.deficit)}` : `Surplus — savings carry forward`}
        </Text>
      </View>
    </View>
  );
}

export function Step4Results({ semesterData, summary, onSave, onRecalculate, isSaving, isLoggedIn }: Step4ResultsProps) {
  const isFinalSurplus = summary.finalBalance >= 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 4 of 4</Text>
        <Text style={styles.title}>Your financial forecast</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, styles.summaryCardFull]}>
          <Text style={styles.summaryCardLabel}>Final Balance</Text>
          <Text style={[styles.summaryCardValue, { color: isFinalSurplus ? Colors.secondary : Colors.danger, fontSize: 28 }]}>
            {isFinalSurplus ? "" : "-"}${fmt(Math.abs(summary.finalBalance))}
          </Text>
          <Text style={styles.summaryCardSub}>
            {isFinalSurplus ? "Projected surplus at graduation" : "Projected deficit at graduation"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardHalf]}>
            <Text style={styles.summaryCardLabel}>Total Costs</Text>
            <Text style={[styles.summaryCardValue, { color: Colors.danger }]}>${fmt(summary.totalCosts)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardHalf]}>
            <Text style={styles.summaryCardLabel}>Total Income</Text>
            <Text style={[styles.summaryCardValue, { color: Colors.secondary }]}>${fmt(summary.totalIncome)}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardHalf]}>
            <Text style={styles.summaryCardLabel}>Semesters</Text>
            <Text style={styles.summaryCardValue}>{summary.totalSemesters}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardHalf]}>
            <Text style={styles.summaryCardLabel}>Avg Cost/Semester</Text>
            <Text style={styles.summaryCardValue}>${fmt(summary.averageCostPerSemester)}</Text>
          </View>
        </View>
      </View>

      {/* Semester Breakdown */}
      <Text style={styles.breakdownTitle}>Semester breakdown</Text>
      {semesterData.map((s, i) => (
        <SemesterCard key={i} s={s} />
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        {isLoggedIn ? (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save to Dashboard</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Sign in to save your results to the dashboard</Text>
          </View>
        )}

        <TouchableOpacity style={styles.recalcButton} onPress={onRecalculate}>
          <Text style={styles.recalcButtonText}>Edit inputs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  stepLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, marginTop: 2 },

  summaryGrid: { gap: 10, marginBottom: 24 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardFull: { width: "100%" },
  summaryCardHalf: { flex: 1 },
  summaryCardLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500", marginBottom: 4 },
  summaryCardValue: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary },
  summaryCardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  breakdownTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 12 },

  semCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  semCardSurplus: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  semCardDeficit: { backgroundColor: "#FFF5F5", borderColor: "#FED7D7" },
  semHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  semLabel: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  summerBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  summerBadgeText: { fontSize: 11, color: "#92400E", fontWeight: "600" },
  semRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  semCol: { alignItems: "center", flex: 1 },
  semColLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  semColValue: { fontSize: 14, fontWeight: "700" },
  balanceBar: { borderRadius: 6, padding: 8, alignItems: "center" },
  balanceBarText: { fontSize: 12, fontWeight: "600" },

  actions: { marginTop: 16, gap: 10, marginBottom: 32 },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  recalcButton: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  recalcButtonText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },
  loginPrompt: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  loginPromptText: { fontSize: 13, color: Colors.primary, textAlign: "center", fontWeight: "500" },
});
