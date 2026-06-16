import { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addTransaction } from "../../services/transactionService";
import { Colors } from "../../constants/colors";

const INCOME_CATEGORIES = ["Part-time job", "Scholarship", "Bursary", "Grant", "Side income", "Other"];
const EXPENSE_CATEGORIES = ["Rent", "Groceries", "Transport", "Books", "Utilities", "Phone", "Entertainment", "Other"];

interface Props {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddTransactionModal({ visible, userId, onClose, onAdded }: Props) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const reset = () => {
    setType("expense");
    setName("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleAdd = async () => {
    if (!name.trim() || !amount || !category) {
      Alert.alert("Missing fields", "Please fill in name, amount and category.");
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    try {
      setSaving(true);
      await addTransaction({ userId, name: name.trim(), amount: num, category, date, type });
      reset();
      onAdded();
      onClose();
    } catch {
      Alert.alert("Error", "Failed to add transaction.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Transaction</Text>
          <TouchableOpacity onPress={handleAdd} disabled={saving}>
            {saving
              ? <ActivityIndicator color={Colors.primary} size="small" />
              : <Text style={styles.save}>Add</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {/* Type toggle */}
          <View style={styles.typeRow}>
            {(["expense", "income"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn,
                  type === t && (t === "income" ? styles.typeBtnIncome : styles.typeBtnExpense),
                ]}
                onPress={() => { setType(t); setCategory(""); }}
              >
                <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                  {t === "income" ? "Income" : "Expense"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Part-time shift"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Amount</Text>
          <View style={styles.prefixRow}>
            <Text style={styles.prefix}>$</Text>
            <TextInput
              style={[styles.input, styles.prefixInput]}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.catGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, category === c && styles.catBtnActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.catBtnText, category === c && styles.catBtnTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  cancel: { fontSize: 15, color: Colors.textSecondary, minWidth: 50 },
  save: { fontSize: 15, fontWeight: "700", color: Colors.primary, minWidth: 50, textAlign: "right" },
  body: { paddingHorizontal: 20, paddingTop: 16 },

  typeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: "center",
  },
  typeBtnIncome: { borderColor: Colors.secondary, backgroundColor: "#D1FAE5" },
  typeBtnExpense: { borderColor: Colors.danger, backgroundColor: "#FEE2E2" },
  typeBtnText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.textPrimary },

  fieldLabel: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 15,
    color: Colors.textPrimary, backgroundColor: Colors.surface,
  },
  prefixRow: { flexDirection: "row" },
  prefix: {
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 15,
    color: Colors.textSecondary,
    borderWidth: 1, borderRightWidth: 0, borderColor: Colors.border,
    borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  prefixInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4, paddingBottom: 32 },
  catBtn: {
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  catBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  catBtnText: { fontSize: 13, color: Colors.textSecondary },
  catBtnTextActive: { color: Colors.primary, fontWeight: "600" },
});
