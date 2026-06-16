import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { type Transaction } from "../../services/transactionService";

function fmt(n: number) {
  return Math.abs(n).toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction: t, onDelete }: TransactionRowProps) {
  const isIncome = t.type === "income";
  return (
    <View style={styles.row}>
      <View style={[styles.indicator, { backgroundColor: isIncome ? "#D1FAE5" : "#FEE2E2" }]}>
        <Text style={styles.indicatorText}>{isIncome ? "↑" : "↓"}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{t.name}</Text>
        <Text style={styles.meta}>{t.category} · {t.date}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? Colors.secondary : Colors.danger }]}>
          {isIncome ? "+" : "−"}${fmt(t.amount)}
        </Text>
        <TouchableOpacity
          onPress={() => t.id && onDelete(t.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 11, gap: 12 },
  indicator: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  indicatorText: { fontSize: 14 },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  right: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: 15, fontWeight: "700" },
  deleteBtn: { fontSize: 12, color: Colors.textMuted },
});
