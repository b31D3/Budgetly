import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FormInput } from "../ui/FormInput";
import { OptionButton } from "../ui/OptionButton";
import { Colors } from "../../constants/colors";
import type { FormState, FormErrors } from "./types";

interface Step1Props {
  form: FormState;
  errors: FormErrors;
  onChange: (field: keyof FormState, value: string) => void;
}

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  label: `${i + 1}`,
  value: `${i + 1}`,
}));

export function Step1({ form, errors, onChange }: Step1Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 4</Text>
        <Text style={styles.title}>Academic year details</Text>
      </View>

      <OptionButton
        label="Student type"
        options={[
          { label: "Domestic", value: "domestic" },
          { label: "International", value: "international" },
        ]}
        value={form.studentType}
        onChange={(v) => onChange("studentType", v)}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Semesters remaining</Text>
        <View style={styles.semesterGrid}>
          {SEMESTER_OPTIONS.map((opt) => (
            <View key={opt.value} style={styles.semesterItem}>
              <OptionButton
                label=""
                options={[opt]}
                value={form.semestersLeft}
                onChange={(v) => onChange("semestersLeft", v)}
              />
            </View>
          ))}
        </View>
        {errors.semestersLeft && (
          <Text style={styles.errorText}>{errors.semestersLeft}</Text>
        )}
      </View>

      <FormInput
        label="Annual tuition"
        hint="Per year"
        prefix="$"
        placeholder="8,000"
        value={form.tuition}
        onChangeText={(v) => onChange("tuition", v)}
        error={errors.tuition}
      />

      <FormInput
        label="Books"
        hint="Per semester (optional)"
        prefix="$"
        placeholder="400"
        value={form.books}
        onChangeText={(v) => onChange("books", v)}
        error={errors.books}
      />

      <FormInput
        label="Supplies"
        hint="Per semester (optional)"
        prefix="$"
        placeholder="100"
        value={form.supplies}
        onChangeText={(v) => onChange("supplies", v)}
        error={errors.supplies}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  stepLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, marginTop: 2 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 8 },
  semesterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  semesterItem: { width: "25%" },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
});
