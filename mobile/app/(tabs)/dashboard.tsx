import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuth } from "../../contexts/AuthContext";
import { getUserCalculations, deleteCalculation, type CalculationData } from "../../services/calculatorService";
import { getUserTransactions, deleteTransaction, type Transaction } from "../../services/transactionService";
import { BalanceChart } from "../../components/dashboard/BalanceChart";
import { TransactionRow } from "../../components/transactions/TransactionRow";
import { AddTransactionModal } from "../../components/transactions/AddTransactionModal";
import { Colors } from "../../constants/colors";

function fmt(n: number) {
  return Math.abs(n).toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

// ── Stat card ──────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, color ? { color } : null]}>{value}</Text>
      {sub && <Text style={statStyles.sub}>{sub}</Text>}
    </View>
  );
}
const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 11, color: Colors.textSecondary, fontWeight: "500", marginBottom: 4 },
  value: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  sub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});

// ── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const [calculations, setCalculations] = useState<CalculationData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAllCalcs, setShowAllCalcs] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) { setLoading(false); return; }
    try {
      const [calcs, txs] = await Promise.all([
        getUserCalculations(currentUser.uid),
        getUserTransactions(currentUser.uid),
      ]);
      setCalculations(calcs);
      setTransactions(txs);
    } catch {
      Alert.alert("Error", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleDeleteCalc = (id: string) => {
    Alert.alert("Delete Calculation", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteCalculation(id);
          setCalculations((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  const handleDeleteTx = async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyEmoji}>🔒</Text>
          <Text style={styles.emptyTitle}>Sign in to view dashboard</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.ctaBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const latest = calculations[0];
  const semesterData = (latest?.semesterData ?? []) as Array<{ semesterLabel: string; balance: number; isSummer?: boolean }>;

  // Transaction totals (all-time)
  const txIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const txExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const txNet = txIncome - txExpense;

  const displayedCalcs = showAllCalcs ? calculations : calculations.slice(0, 3);
  const displayedTx = showAllTx ? transactions : transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {currentUser.displayName?.split(" ")[0] ?? "Student"} 👋</Text>
            <Text style={styles.headerSub}>Your financial overview</Text>
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={() => router.push("/(tabs)/index")}>
            <Text style={styles.calcBtnText}>+ Edit</Text>
          </TouchableOpacity>
        </View>

        {/* No data state */}
        {!latest && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🧮</Text>
            <Text style={styles.emptyTitle}>No calculations yet</Text>
            <Text style={styles.emptySub}>Run the calculator and save your results to see them here.</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/(tabs)/index")}>
              <Text style={styles.ctaBtnText}>Go to Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary stats */}
        {latest && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest Forecast</Text>
              <View style={styles.statRow}>
                <StatCard
                  label="Final Balance"
                  value={`${latest.projectedBalance >= 0 ? "" : "-"}$${fmt(latest.projectedBalance)}`}
                  color={latest.projectedBalance >= 0 ? Colors.secondary : Colors.danger}
                  sub={latest.projectedBalance >= 0 ? "Projected surplus" : "Projected deficit"}
                />
                <StatCard label="Semesters Left" value={`${latest.remainingSemesters}`} sub="Academic semesters" />
              </View>
              <View style={[styles.statRow, { marginTop: 10 }]}>
                <StatCard label="Total Costs" value={`$${fmt(latest.totalCost)}`} color={Colors.danger} />
                <StatCard label="Avg Cost/Year" value={`$${fmt(latest.costPerYear)}`} />
              </View>
            </View>

            {/* Balance chart */}
            {semesterData.length >= 2 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Balance Forecast</Text>
                <View style={styles.chartCard}>
                  <BalanceChart data={semesterData.map((s) => ({ label: s.semesterLabel, balance: s.balance, isSummer: s.isSummer }))} />
                </View>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
                    <Text style={styles.legendText}>Surplus</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
                    <Text style={styles.legendText}>Deficit</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.border, borderStyle: "dashed" }]} />
                    <Text style={styles.legendText}>Break-even</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* Transaction tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTx(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Net summary */}
          <View style={styles.txSummary}>
            <View style={styles.txSummaryItem}>
              <Text style={styles.txSummaryLabel}>Income</Text>
              <Text style={[styles.txSummaryValue, { color: Colors.secondary }]}>+${fmt(txIncome)}</Text>
            </View>
            <View style={styles.txDivider} />
            <View style={styles.txSummaryItem}>
              <Text style={styles.txSummaryLabel}>Expenses</Text>
              <Text style={[styles.txSummaryValue, { color: Colors.danger }]}>-${fmt(txExpense)}</Text>
            </View>
            <View style={styles.txDivider} />
            <View style={styles.txSummaryItem}>
              <Text style={styles.txSummaryLabel}>Net</Text>
              <Text style={[styles.txSummaryValue, { color: txNet >= 0 ? Colors.secondary : Colors.danger }]}>
                {txNet >= 0 ? "+" : "-"}${fmt(txNet)}
              </Text>
            </View>
          </View>

          {transactions.length === 0 ? (
            <Text style={styles.emptyInline}>No transactions yet. Tap + Add to log one.</Text>
          ) : (
            <>
              <View style={styles.txList}>
                {displayedTx.map((t) => (
                  <TransactionRow key={t.id} transaction={t} onDelete={handleDeleteTx} />
                ))}
              </View>
              {transactions.length > 5 && (
                <TouchableOpacity onPress={() => setShowAllTx(!showAllTx)}>
                  <Text style={styles.showMore}>{showAllTx ? "Show less" : `Show all ${transactions.length}`}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Saved calculations */}
        {calculations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Calculations</Text>
            {displayedCalcs.map((calc) => (
              <View key={calc.id} style={styles.calcCard}>
                <View style={styles.calcCardLeft}>
                  <Text style={styles.calcCardDate}>
                    {calc.createdAt.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                  <Text style={styles.calcCardInfo}>
                    {calc.remainingSemesters} semesters · ${fmt(calc.tuition)}/yr tuition
                  </Text>
                </View>
                <View style={styles.calcCardRight}>
                  <Text style={[styles.calcCardBalance, { color: calc.projectedBalance >= 0 ? Colors.secondary : Colors.danger }]}>
                    {calc.projectedBalance >= 0 ? "+" : "-"}${fmt(calc.projectedBalance)}
                  </Text>
                  <TouchableOpacity onPress={() => calc.id && handleDeleteCalc(calc.id)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {calculations.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllCalcs(!showAllCalcs)}>
                <Text style={styles.showMore}>{showAllCalcs ? "Show less" : `Show all ${calculations.length}`}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddTransactionModal
        visible={showAddTx}
        userId={currentUser.uid}
        onClose={() => setShowAddTx(false)}
        onAdded={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 20, fontWeight: "700", color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  calcBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  calcBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: { backgroundColor: Colors.primaryLight, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: Colors.primary, fontSize: 13, fontWeight: "700" },

  statRow: { flexDirection: "row", gap: 10 },

  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartLegend: { flexDirection: "row", gap: 16, marginTop: 10, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textMuted },

  txSummary: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  txSummaryItem: { flex: 1, alignItems: "center" },
  txSummaryLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  txSummaryValue: { fontSize: 15, fontWeight: "700" },
  txDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  txList: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4 },
  emptyInline: { fontSize: 13, color: Colors.textMuted, textAlign: "center", marginTop: 8 },
  showMore: { fontSize: 13, color: Colors.primary, fontWeight: "600", textAlign: "center", marginTop: 12 },

  calcCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  calcCardLeft: { flex: 1 },
  calcCardDate: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  calcCardInfo: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  calcCardRight: { alignItems: "flex-end", gap: 4 },
  calcCardBalance: { fontSize: 16, fontWeight: "700" },
  deleteBtn: { fontSize: 12, color: Colors.danger },

  emptyCenter: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyCard: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  ctaBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  ctaBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
