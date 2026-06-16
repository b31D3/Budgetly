import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Colors } from "../../constants/colors";

interface FormInputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
}

export function FormInput({ label, hint, error, prefix, style, ...props }: FormInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix ? styles.inputWithPrefix : null, style]}
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  hint: { fontSize: 12, color: Colors.textMuted },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  inputError: { borderColor: Colors.danger },
  prefix: {
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: 14,
    backgroundColor: "#F1F5F9",
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputWithPrefix: { paddingLeft: 12 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
});
