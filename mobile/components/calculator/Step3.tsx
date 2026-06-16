import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FormInput } from "../ui/FormInput";
import { OptionButton } from "../ui/OptionButton";
import { Colors } from "../../constants/colors";
import type { FormState, FormErrors } from "./types";

interface Step3Props {
  form: FormState;
  errors: FormErrors;
  onChange: (field: keyof FormState, value: string) => void;
}

export function Step3({ form, errors, onChange }: Step3Props) {
  const hasJob = form.hasJob === "yes";

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <Text style={styles.title}>Income & financial aid</Text>
      </View>

      <OptionButton
        label="Do you have a job?"
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
        value={form.hasJob}
        onChange={(v) => onChange("hasJob", v)}
        error={errors.hasJob}
      />

      {hasJob && (
        <View style={styles.jobSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work hours</Text>
          </View>

          <FormInput
            label="School semester hours"
            hint="Per week"
            placeholder="15"
            value={form.hoursPerWeekSchool}
            onChangeText={(v) => onChange("hoursPerWeekSchool", v)}
            error={errors.hoursPerWeekSchool}
          />

          <FormInput
            label="Summer hours"
            hint="Per week"
            placeholder="40"
            value={form.hoursPerWeekSummer}
            onChangeText={(v) => onChange("hoursPerWeekSummer", v)}
            error={errors.hoursPerWeekSummer}
          />

          <FormInput
            label="Hourly rate"
            hint="Before tax"
            prefix="$"
            placeholder="17.00"
            value={form.hourlyRate}
            onChangeText={(v) => onChange("hourlyRate", v)}
            error={errors.hourlyRate}
          />
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Financial aid</Text>
        <Text style={styles.sectionHint}>Per semester</Text>
      </View>

      <FormInput
        label="Scholarship"
        hint="Optional"
        prefix="$"
        placeholder="0"
        value={form.scholarship}
        onChangeText={(v) => onChange("scholarship", v)}
        error={errors.scholarship}
      />

      <FormInput
        label="Bursary"
        hint="Optional"
        prefix="$"
        placeholder="0"
        value={form.bursary}
        onChangeText={(v) => onChange("bursary", v)}
        error={errors.bursary}
      />

      <FormInput
        label="Grant"
        hint="Optional"
        prefix="$"
        placeholder="0"
        value={form.grant}
        onChangeText={(v) => onChange("grant", v)}
        error={errors.grant}
      />

      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>Current savings</Text>
      </View>

      <FormInput
        label="Savings"
        hint="Total amount"
        prefix="$"
        placeholder="5,000"
        value={form.savings}
        onChangeText={(v) => onChange("savings", v)}
        error={errors.savings}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  stepLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, marginTop: 2 },
  jobSection: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  sectionHint: { fontSize: 12, color: Colors.textMuted },
});
