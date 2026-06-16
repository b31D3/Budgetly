import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FormInput } from "../ui/FormInput";
import { OptionButton } from "../ui/OptionButton";
import { Colors } from "../../constants/colors";
import type { FormState, FormErrors } from "./types";

interface Step2Props {
  form: FormState;
  errors: FormErrors;
  onChange: (field: keyof FormState, value: string) => void;
}

export function Step2({ form, errors, onChange }: Step2Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 4</Text>
        <Text style={styles.title}>Monthly expenses</Text>
      </View>

      <OptionButton
        label="Housing situation"
        options={[
          { label: "Off-campus", value: "off-campus" },
          { label: "On-campus", value: "on-campus" },
          { label: "With family", value: "family" },
        ]}
        value={form.housing}
        onChange={(v) => onChange("housing", v)}
      />

      <FormInput
        label="Rent / Housing"
        hint="Per month"
        prefix="$"
        placeholder="1,200"
        value={form.rent}
        onChangeText={(v) => onChange("rent", v)}
        error={errors.rent}
      />

      <FormInput
        label="Utilities"
        hint="Per month"
        prefix="$"
        placeholder="80"
        value={form.utilities}
        onChangeText={(v) => onChange("utilities", v)}
        error={errors.utilities}
      />

      <FormInput
        label="Groceries"
        hint="Per month"
        prefix="$"
        placeholder="400"
        value={form.groceries}
        onChangeText={(v) => onChange("groceries", v)}
        error={errors.groceries}
      />

      <FormInput
        label="Cell phone"
        hint="Per month"
        prefix="$"
        placeholder="60"
        value={form.cellPhone}
        onChangeText={(v) => onChange("cellPhone", v)}
        error={errors.cellPhone}
      />

      <FormInput
        label="Transportation"
        hint="Per month"
        prefix="$"
        placeholder="100"
        value={form.transportation}
        onChangeText={(v) => onChange("transportation", v)}
        error={errors.transportation}
      />

      <FormInput
        label="Memberships & subscriptions"
        hint="Per month"
        prefix="$"
        placeholder="30"
        value={form.memberships}
        onChangeText={(v) => onChange("memberships", v)}
        error={errors.memberships}
      />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Monthly living costs</Text>
        <Text style={styles.totalValue}>
          ${(
            [form.rent, form.utilities, form.groceries, form.cellPhone, form.transportation, form.memberships]
              .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
          ).toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          /mo
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  stepLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, marginTop: 2 },
  totalCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  totalLabel: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  totalValue: { fontSize: 18, fontWeight: "700", color: Colors.primary },
});
