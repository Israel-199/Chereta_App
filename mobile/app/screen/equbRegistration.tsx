import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import axiosClient from "@/api/axiosClient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getFontFamily as getSharedFontFamily } from "@/utils/fontHelper";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";
import Navbar from "@/component/Navbar";
import { useJoinedEqubStore } from "@/store/joinedEqubStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SuspendedScreen from "@/component/SuspendedScreen";

export default function EqubRegistrationScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: "VEHICLE" | "HOUSE" }>();
  const language = useAuthStore((state) => state.language);
  const router = useRouter();
  const { profile } = useAuthStore();
  const { width } = useWindowDimensions();
  const scaleFactor = Math.min(1, width / 360);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const initialForm = useMemo(() => ({
    fullName: profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : "",
    phoneNumber: profile?.phoneNumber || "",
    address: profile?.address || "",
    monthlyIncome: "",
  }), [profile]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        phoneNumber: prev.phoneNumber || profile.phoneNumber || "",
        address: prev.address || profile.address || "",
      }));
    }
  }, [profile]);

  const t: any = useMemo(() => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  }, [language]);

  const getFontFamily = useCallback((bold = false) => getSharedFontFamily(language, bold), [language]);

  const isVehicle = type === "VEHICLE";
  const title = isVehicle ? t.vehicleRegistrationTitle : t.houseRegistrationTitle;
  const successMessage = isVehicle ? t.vehicleSuccessMessage : t.houseSuccessMessage;

  useEffect(() => {
    if (type) checkStatus();
  }, [type]);

  const checkStatus = async () => {
    try {
      const response = await axiosClient.get(`equbs/register/check?type=${type}`);
      setIsRegistered(response.data.isRegistered);
    } catch (error) {
      console.error("Check status error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.phoneNumber || !form.address || !form.monthlyIncome) {
      Toast.show({
        type: "error",
        position: "top",
        text1: t.failed || "Validation Error",
        text2: t.allFieldsRequired,
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosClient.post("equbs/register", { ...form, type });
      setIsRegistered(true);
      await useJoinedEqubStore.getState().loadJoinedEqubs();
      Toast.show({
        type: "success",
        position: "top",
        text1: t.success || "Success",
        text2: response.data.message || "Registration Successful",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        position: "top",
        text1: t.failed || "Error",
        text2: error.response?.data?.message || "Failed to register",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  if (isRegistered) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={80} color="#81CE06" />
          <Text style={[styles.successTitle, { fontFamily: getFontFamily(true) }]}>
            {t.registrationSuccessTitle}
          </Text>
          <Text style={[styles.successText, { fontFamily: getFontFamily() }]}>
            {successMessage}
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, { fontFamily: getFontFamily(true) }]}>{t.closeButton || "Close"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const navBackIcon = (
    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar leftIcon={navBackIcon} title={t.registerInfo} />
      {profile?.status === "SUSPENDED" ? (
        <SuspendedScreen />
      ) : (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { fontFamily: getFontFamily(true) }]}>{title}</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: getFontFamily() }]}>{t.fullName}</Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder={t.fullName}
                value={form.fullName}
                onChangeText={(text) => setForm({ ...form, fullName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: getFontFamily() }]}>{t.phoneNumber}</Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder={t.phoneNumber}
                keyboardType="phone-pad"
                value={form.phoneNumber}
                onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: getFontFamily() }]}>{t.address.replace(" *", "")}</Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder={t.address.replace(" *", "")}
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: getFontFamily() }]}>{t.monthlyIncome}</Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder={t.monthlyIncome}
                keyboardType="numeric"
                value={form.monthlyIncome}
                onChangeText={(text) => setForm({ ...form, monthlyIncome: text })}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { fontFamily: getFontFamily(true) }]}>{t.done}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
  },
  scrollContainer: {
    padding: scale(20),
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff'
  },
  title: {
    fontSize: moderateScale(18),
    color: "#0B3C8A",
    textAlign: "center",
    marginBottom: verticalScale(20),
    marginTop: verticalScale(10),
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputGroup: {
    marginBottom: verticalScale(15),
  },
  label: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginBottom: verticalScale(5),
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#0B3C8A",
    height: verticalScale(48),
    justifyContent: "center",
    borderRadius: moderateScale(8),
    alignItems: "center",
    marginTop: verticalScale(15),
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(15),
  },
  successCard: {
    alignItems: "center",
    padding: 20,
  },
  successTitle: {
    fontSize: moderateScale(19),
    color: "#0B3C8A",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  successText: {
    fontSize: moderateScale(12),
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: "#0B3C8A",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
});
