import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface Option {
  label: string;
  value: string;
}

interface OptionButtonProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OptionButton({ label, options, value, onChange, error }: OptionButtonProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, value === opt.value && styles.optionActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.optionText, value === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  option: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: { fontSize: 14, fontWeight: "500", color: Colors.textSecondary },
  optionTextActive: { color: Colors.primary, fontWeight: "600" },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
});
