import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import axiosClient from "@/api/axiosClient";
import Navbar from "@/component/Navbar";
import Toast from "react-native-toast-message";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

const { width } = Dimensions.get("window");

export default function KycVerificationScreen() {
  const { language, profile, token, preloadData } = useAuthStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [idType, setIdType] = useState(profile?.idType || "");
  const [idNumber, setIdNumber] = useState(profile?.idNumber || "");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const prevStatus = useRef(profile?.idStatus);

  const getFontFamily = (bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold
        ? "NotoSansEthiopic-Bold"
        : "NotoSansEthiopic-Regular"
      : bold
      ? "NotoSans-Bold"
      : "NotoSans-Regular";

  const getT = () => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  };

  const t = getT() as any;

  const pickImage = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      if (side === "front") setFrontImage(result.assets[0].uri);
      else setBackImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!idType) return Toast.show({ type: "error", text1: t.idTypeRequired });
    if (!idNumber) return Toast.show({ type: "error", text1: t.idNumberRequired });
    if (!frontImage) return Toast.show({ type: "error", text1: t.uploadFront });

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("idType", idType);
      formData.append("idNumber", idNumber);

      formData.append("frontImage", {
        uri: frontImage,
        type: "image/jpeg",
        name: "id_front.jpg",
      } as any);

      if (backImage) {
        formData.append("backImage", {
          uri: backImage,
          type: "image/jpeg",
          name: "id_back.jpg",
        } as any);
      }

      const response = await axiosClient.post("/user/kyc-submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitting(false);
      Toast.show({ type: "success", text1: t.kycSubmitted });
      useAuthStore.getState().preloadData();
      router.back();
    } catch (error: any) {
      setSubmitting(false);
      console.error("KYC Submission error:", error);
      const errorMsg = error.response?.data?.error || error.message;
      Toast.show({ type: "error", text1: "Submission Failed", text2: errorMsg });
    }
  };

  const isVerified = profile?.idStatus === "VERIFIED";
  const isPending = profile?.idStatus === "PENDING";

  return (
    <View style={styles.container}>
      <Navbar
        title={t.kycVerification}
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}>
        {/* Status Header */}
        <View style={[styles.statusCard, isVerified && styles.statusVerified, isPending && styles.statusPending]}>
          <MaterialCommunityIcons 
            name={isVerified ? "check-decagram" : isPending ? "clock-outline" : "shield-account-variant-outline"} 
            size={40} 
            color={isVerified ? "#22C55E" : isPending ? "#F59E0B" : "#0B3C8A"} 
          />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { fontFamily: getFontFamily(true) }]}>
              {isVerified ? t.verificationVerified : isPending ? t.verificationPending : t.kycVerification}
            </Text>
            <Text style={[styles.statusNote, { fontFamily: getFontFamily(false) }]}>
              {isVerified ? t.kycVerifiedDetail : isPending ? t.kycPendingDetail : t.idInfoNote}
            </Text>
          </View>
        </View>

        {isVerified || isPending ? (
          <View style={styles.verifiedContainer}>
            <View style={styles.infoCard}>
               <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { fontFamily: getFontFamily(true) }]}>{t.idType}:</Text>
                  <Text style={[styles.infoValue, { fontFamily: getFontFamily(false) }]}>{profile?.idType}</Text>
               </View>
               <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { fontFamily: getFontFamily(true) }]}>{t.idNumber}:</Text>
                  <Text style={[styles.infoValue, { fontFamily: getFontFamily(false) }]}>{profile?.idNumber}</Text>
               </View>
            </View>
            {isPending && (
              <View style={styles.pendingMessageCard}>
                <Ionicons name="information-circle-outline" size={20} color="#B45309" />
                <Text style={[styles.pendingMessageText, { fontFamily: getFontFamily(false) }]}>
                  {t.kycTechnicalNote}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.formView}>
            {/* ID Type Selection */}
            <Text style={[styles.label, { fontFamily: getFontFamily(true) }]}>{t.idType}</Text>
            <View style={styles.typeSelector}>
              {[t.ethiopianID, t.passport, t.license].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, idType === type && styles.typeSelected]}
                  onPress={() => setIdType(type)}
                >
                  <Text style={[styles.typeText, { fontFamily: getFontFamily(idType === type) }, idType === type && styles.typeTextSelected]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ID Number */}
            <Text style={[styles.label, { fontFamily: getFontFamily(true), marginTop: 24 }]}>{t.idNumber}</Text>
            <TextInput
              style={[styles.input, { fontFamily: getFontFamily(false) }]}
              placeholder="e.g. AB1234567"
              value={idNumber}
              onChangeText={setIdNumber}
            />

            {/* Image Uploads */}
            <View style={styles.imageRow}>
              <View style={styles.imageBoxOuter}>
                <Text style={[styles.imageLabel, { fontFamily: getFontFamily(true) }]}>{t.uploadFront}</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage("front")}>
                  {frontImage ? (
                    <Image source={{ uri: frontImage }} style={styles.previewImage} />
                  ) : (
                    <MaterialCommunityIcons name="camera-plus" size={32} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.imageBoxOuter}>
                <Text style={[styles.imageLabel, { fontFamily: getFontFamily(true) }]}>{t.uploadBack}</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage("back")}>
                  {backImage ? (
                    <Image source={{ uri: backImage }} style={styles.previewImage} />
                  ) : (
                    <MaterialCommunityIcons name="camera-plus" size={32} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitButtonText, { fontFamily: getFontFamily(true) }]}>
                  {t.submitTicket}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  statusVerified: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  statusPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
  },
  statusInfo: {
    flex: 1,
    marginLeft: 20,
  },
  statusTitle: {
    fontSize: 18,
    color: "#1E293B",
    marginBottom: 4,
  },
  statusNote: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
  formView: {
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeSelected: {
    borderColor: "#0B3C8A",
    backgroundColor: "#F0F7FF",
  },
  typeText: {
    fontSize: 14,
    color: "#64748B",
  },
  typeTextSelected: {
    color: "#0B3C8A",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1E293B",
  },
  disabledInput: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  imageBoxOuter: {
    width: (width - 60) / 2,
  },
  imageLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
    textAlign: "center",
  },
  imagePicker: {
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  submitButton: {
    backgroundColor: "#0B3C8A",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#0B3C8A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  verifiedContainer: {
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  pendingMessageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    gap: 12,
  },
  pendingMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
});