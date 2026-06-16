import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { sendEmailVerification, reload } from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";

export default function VerifyEmail() {
  const { currentUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCheckVerification = async () => {
    if (!currentUser) return;
    try {
      setChecking(true);
      await reload(currentUser);
      if (currentUser.emailVerified) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Not verified yet", "Please check your inbox and click the verification link.");
      }
    } catch {
      Alert.alert("Error", "Could not check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!currentUser) return;
    try {
      setResending(true);
      await sendEmailVerification(currentUser);
      Alert.alert("Email sent", "Verification email resent. Please check your inbox.");
    } catch {
      Alert.alert("Error", "Could not resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.description}>
          We sent a verification link to{"\n"}
          <Text style={styles.email}>{currentUser?.email}</Text>
          {"\n\n"}Click the link in your email to verify your account, then tap the button below.
        </Text>

        <TouchableOpacity
          style={[styles.button, checking && styles.buttonDisabled]}
          onPress={handleCheckVerification}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>I've Verified My Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.outlineButton, resending && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.outlineButtonText}>Resend Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 24,
  },
  card: {
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
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, marginBottom: 12 },
  description: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 28 },
  email: { fontWeight: "600", color: Colors.textPrimary },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  outlineButtonText: { color: Colors.primary, fontSize: 15, fontWeight: "600" },
  logoutBtn: { marginTop: 4 },
  logoutText: { fontSize: 14, color: Colors.textMuted },
});
