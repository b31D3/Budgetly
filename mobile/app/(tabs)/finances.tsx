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

import { useAuth } from "../../contexts/AuthContext";
import { getUserTransactions, deleteTransaction, type Transaction } from "../../services/transactionService";
import { TransactionRow } from "../../components/transactions/TransactionRow";
import { AddTransactionModal } from "../../components/transactions/AddTransactionModal";
import { Colors } from "../../constants/colors";

function fmt(n: number) {
  return Math.abs(n).toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

// ── Main Finances Screen ───────────────────────────────────────────
export default function FinancesScreen() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const loadData = useCallback(async () => {
    if (!currentUser) { setLoading(false); return; }
    try {
      const txs = await getUserTransactions(currentUser.uid);
      setTransactions(txs);
    } catch {
      Alert.alert("Error", "Failed to load transactions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleDeleteTx = async (id: string) => {
    Alert.alert("Delete", "Remove this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteTransaction(id);
          setTransactions((prev) => prev.filter((t) => t.id !== id));
        },
      },
    ]);
  };

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);
  const displayed = showAll ? filtered : filtered.slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Finances</Text>
          <Text style={styles.subtitle}>Track your income & expenses</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTx(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: Colors.secondary }]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: Colors.secondary }]}>+${fmt(income)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: Colors.danger }]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>-${fmt(expense)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: net >= 0 ? Colors.secondary : Colors.danger }]}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[styles.summaryValue, { color: net >= 0 ? Colors.secondary : Colors.danger }]}>
              {net >= 0 ? "+" : "-"}${fmt(net)}
            </Text>
          </View>
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(["all", "income", "expense"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction list */}
        <View style={styles.listSection}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>💳</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Tap "+ Add" to log your first transaction</Text>
            </View>
          ) : (
            <>
              <View style={styles.txList}>
                {displayed.map((t) => (
                  <TransactionRow key={t.id} transaction={t} onDelete={handleDeleteTx} />
                ))}
              </View>
              {filtered.length > 10 && (
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                  <Text style={styles.showMore}>
                    {showAll ? "Show less" : `Show all ${filtered.length}`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {currentUser && (
        <AddTransactionModal
          visible={showAddTx}
          userId={currentUser.uid}
          onClose={() => setShowAddTx(false)}
          onAdded={loadData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: "700" },

  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  filterChipTextActive: { color: "#fff" },

  listSection: { paddingHorizontal: 16 },
  txList: { backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4 },
  showMore: { fontSize: 13, color: Colors.primary, fontWeight: "600", textAlign: "center", marginTop: 14 },

  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary, marginTop: 12 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: "center" },
});
