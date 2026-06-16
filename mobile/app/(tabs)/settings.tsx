import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";

const PREFS_KEY = "budgetly_preferences";

interface Preferences {
  currency: "CAD" | "USD";
  language: "english" | "french";
}

const DEFAULT_PREFS: Preferences = { currency: "CAD", language: "english" };

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowChevron}>{value ?? "›"}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={s.toggleGroup}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[s.toggleBtn, value === opt.value && s.toggleBtnActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[s.toggleBtnText, value === opt.value && s.toggleBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function EditNameRow({ currentName, onSaved }: { currentName: string; onSaved: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      onSaved(name.trim());
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to update name.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <TouchableOpacity style={s.row} onPress={() => setEditing(true)} activeOpacity={0.7}>
        <Text style={s.rowLabel}>Display Name</Text>
        <Text style={s.rowValue}>{currentName || "—"}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.editRow}>
      <TextInput
        style={s.editInput}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
        placeholderTextColor={Colors.textMuted}
      />
      <View style={s.editActions}>
        <TouchableOpacity onPress={() => setEditing(false)} style={s.editCancelBtn}>
          <Text style={s.editCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={s.editSaveBtn} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.editSaveText}>Save</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    });
  }, []);

  const savePref = async (patch: Partial<Preferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{displayName || "Student"}</Text>
            <Text style={s.profileEmail} numberOfLines={1}>{currentUser?.email}</Text>
          </View>
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={s.card}>
          <EditNameRow currentName={displayName} onSaved={setDisplayName} />
          <View style={s.separator} />
          <InfoRow label="Email" value={currentUser?.email ?? "—"} />
          <View style={s.separator} />
          <InfoRow
            label="Email Verified"
            value={currentUser?.emailVerified ? "Verified" : "Not verified"}
          />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={s.card}>
          <ToggleRow
            label="Currency"
            options={[{ label: "CAD", value: "CAD" }, { label: "USD", value: "USD" }]}
            value={prefs.currency}
            onChange={(v) => savePref({ currency: v as "CAD" | "USD" })}
          />
          <View style={s.separator} />
          <ToggleRow
            label="Language"
            options={[{ label: "English", value: "english" }, { label: "Français", value: "french" }]}
            value={prefs.language}
            onChange={(v) => savePref({ language: v as "english" | "french" })}
          />
        </View>

        {/* Legal */}
        <SectionHeader title="Legal" />
        <View style={s.card}>
          <SettingsRow
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://budgetly-student.vercel.app/privacy-policy")}
          />
          <View style={s.separator} />
          <SettingsRow
            label="Terms of Use"
            onPress={() => Linking.openURL("https://budgetly-student.vercel.app/terms-of-use")}
          />
          <View style={s.separator} />
          <SettingsRow
            label="Disclaimer"
            onPress={() => Linking.openURL("https://budgetly-student.vercel.app/disclaimer")}
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={s.card}>
          <InfoRow label="Version" value="1.0.0" />
          <View style={s.separator} />
          <InfoRow label="Built for" value="Canadian Students" />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary },
  scroll: { paddingHorizontal: 16 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  profileName: { fontSize: 16, fontWeight: "600", color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 48,
  },
  rowLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: "500" },
  rowValue: { fontSize: 14, color: Colors.textSecondary, flexShrink: 1, textAlign: "right" },
  rowChevron: { fontSize: 18, color: Colors.textMuted },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  toggleGroup: { flexDirection: "row", gap: 6 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleBtnText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  toggleBtnTextActive: { color: "#fff" },

  editRow: { padding: 12, gap: 8 },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  editActions: { flexDirection: "row", gap: 8 },
  editCancelBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border, alignItems: "center",
  },
  editCancelText: { fontSize: 14, color: Colors.textSecondary, fontWeight: "500" },
  editSaveBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    backgroundColor: Colors.primary, alignItems: "center",
  },
  editSaveText: { fontSize: 14, color: "#fff", fontWeight: "600" },

  signOutBtn: {
    marginTop: 20,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: Colors.danger, fontSize: 15, fontWeight: "600" },
});
