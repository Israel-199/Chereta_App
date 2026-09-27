import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

import { Image } from 'expo-image';
import { usePersonalInfoStyles } from "@/styles/personalInfoStyles";
import axiosClient from "@/api/axiosClient";
import Toast from "react-native-toast-message";
import Navbar from "@/component/Navbar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { translations } from "@/translations";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
import { completeProfile } from "@/api/auth";
import SkeletonLoader from "@/component/SkeletonLoader";
import { IOSLoader } from "@/component/ButtonLoadingEffect";
import { verticalScale, moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DraggableModal from "@/component/DraggableModal";
import { KNOWN_PLACES } from "@/data/places";

const RegisterScreen = () => {
  const insets = useSafeAreaInsets();
  const styles = usePersonalInfoStyles();
  const { language, token } = useAuthStore();
  const router = useRouter();

  const screenHeight = useMemo(() => Dimensions.get('window').height, []);
  const screenWidth = useMemo(() => Dimensions.get('window').width, []);
  const logoSize = useMemo(() => Math.min(screenWidth * 0.8, 350), [screenWidth]);
  const logoHeight = logoSize / 2;

  const baseSpacing = useMemo(() => Math.min(screenWidth, screenHeight) * 0.02, [screenWidth, screenHeight]);
  const inputHeight = useMemo(() => verticalScale(baseSpacing * 1.3 * 2 + 16), [baseSpacing]);
  const inputMarginBottom = useMemo(() => verticalScale(baseSpacing * 2), [baseSpacing]);

  const [form, setForm] = useState({
    address: "",
    gender: "",
    lastName: "",
    firstName: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const t = useMemo(() => translations[language] ?? {}, [language]);

  const filteredPlaces = useMemo(() => 
    KNOWN_PLACES.filter((place) => place.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const getFontFamily = useCallback((bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular"
      : bold ? "NotoSans-Bold" : "NotoSans-Regular",
    [language]
  );

  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoadingProfile(true);
    try {
      const res = await axiosClient.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        address: res.data.address || "",
        gender: res.data.gender || "",
        lastName: res.data.lastName || "",
        firstName: res.data.firstName || "",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.failed || "Error",
        text2: err.response?.data?.error || err.message,
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [token, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRegister = useCallback(async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.gender || !form.address) {
      Toast.show({
        type: "error",
        text1: t.validationError || "Validation Error",
        text2: t.allFieldsRequired || "All fields are required",
      });
      return;
    }

    const nameRegex = /^[a-zA-Z\u1200-\u137F\s]{2,}$/;
    if (!nameRegex.test(form.firstName.trim()) || !nameRegex.test(form.lastName.trim())) {
      Toast.show({
        type: "error",
        text1: t.validationError || "Validation Error",
        text2: t.nameInvalid || "Names must be at least 2 characters and contain no numbers",
      });
      return;
    }

    if (form.address && !isNaN(Number(form.address.trim()))) {
      Toast.show({
        type: "error",
        text1: t.validationError || "Validation Error",
        text2: t.addressInvalid || "Address cannot be just numbers",
      });
      return;
    }

    setSaving(true);
    try {
      await completeProfile(form);

      router.replace("/(tabs)/home");

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: t.success || "Success",
          text2: "Profile completed successfully",
        });
      }, 500);

    } catch (err: any) {
      const responseData = err.response?.data;
      const key = responseData?.errorKey;
      const errorMessage = responseData?.error || responseData?.message || err.message;
      Toast.show({
        type: "error",
        text1: t.failed || "Update Failed",
        text2: (key && t[key]) ? t[key] : errorMessage,
      });
    } finally {
      setSaving(false);
    }
  }, [token, form, t, router]);

  const navBackIcon = useMemo(() => (
    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
    </TouchableOpacity>
  ), [router]);

  const refreshIcon = useMemo(() => (
    <TouchableOpacity onPress={fetchProfile} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <MaterialCommunityIcons name="refresh" size={22} color="#fff" />
    </TouchableOpacity>
  ), [fetchProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar
        leftIcon={navBackIcon}
        title={t.registerInfo}
        firstIcon={refreshIcon}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {loadingProfile ? (
          <ScrollView style={styles.container}>
            <SkeletonLoader width={180} height={22} style={{ alignSelf: "center", marginBottom: verticalScale(baseSpacing * 1.5) }} />
            <SkeletonLoader width={"100%"} height={inputHeight} style={{ marginBottom: inputMarginBottom }} />
            <SkeletonLoader width={"100%"} height={inputHeight} style={{ marginBottom: inputMarginBottom }} />
            <SkeletonLoader width={"100%"} height={inputHeight} style={{ marginBottom: inputMarginBottom }} />
            <SkeletonLoader width={"100%"} height={inputHeight} style={{ marginBottom: inputMarginBottom }} />
            <SkeletonLoader width={"100%"} height={verticalScale(10) * 2 + 18} style={{ alignSelf: "center", marginTop: verticalScale(baseSpacing * 1.5), maxWidth: 400 }} />
          </ScrollView>
        ) : (
          <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
            <Text style={[styles.header, { fontFamily: getFontFamily(true) }]}>{t.personalInfo}</Text>
            <TextInput
              style={[styles.input, { fontFamily: getFontFamily(false) }]}
              placeholder={t.firstName}
              placeholderTextColor="#9CA3AF"
              value={form.firstName}
              onChangeText={(v) => handleChange("firstName", v)}
            />
            <TextInput
              style={[styles.input, { fontFamily: getFontFamily(false) }]}
              placeholder={t.lastName}
              placeholderTextColor="#9CA3AF"
              value={form.lastName}
              onChangeText={(v) => handleChange("lastName", v)}
            />

            <TouchableOpacity
              style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
              onPress={() => setShowGenderDropdown(true)}
            >
              <Text style={{ fontFamily: getFontFamily(false), flex: 1, color: form.gender ? "#000" : "#9CA3AF" }}>
                {form.gender || t.gender}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
              onPress={() => setShowAddressList(true)}
            >
              <Text style={{ fontFamily: getFontFamily(false), flex: 1, color: form.address ? "#000" : "#9CA3AF" }}>
                {form.address || t.address}
              </Text>
              <MaterialCommunityIcons name="magnify" size={22} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={saving} activeOpacity={0.8}>
              {saving ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IOSLoader size={20} color="#ccc" />
                  <Text style={[styles.buttonText, { fontFamily: getFontFamily(true), marginLeft: 8, color: "#ccc" }]}>{t.save || "Saving..."}</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, { fontFamily: getFontFamily(true) }]}>{t.save}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <DraggableModal 
        visible={showGenderDropdown} 
        onClose={() => setShowGenderDropdown(false)}
      >
        <View style={{ backgroundColor: "#fff", paddingBottom: 10 }}>
          {["Male", "Female"].map((g) => (
            <TouchableOpacity key={g} style={{ paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }} onPress={() => { handleChange("gender", g); setShowGenderDropdown(false); }}>
              <Text style={{ fontFamily: getFontFamily(false), fontSize: 16, textAlign: 'center', color: '#1E293B' }}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DraggableModal>

      <DraggableModal 
        visible={showAddressList} 
        onClose={() => setShowAddressList(false)}
        header={
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: getFontFamily(true), fontSize: 18, marginBottom: 12, color: '#0F172A' }}>Select City</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12 }}>
              <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
              <TextInput 
                style={{ flex: 1, height: 48, fontFamily: getFontFamily(false), marginLeft: 8 }} 
                placeholder="Search city..." 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
              />
            </View>
          </View>
        }
      >
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }} onPress={() => { handleChange("address", item); setShowAddressList(false); }}>
              <Text style={{ fontFamily: getFontFamily(false), fontSize: 15, color: '#334155' }}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 400 }}
        />
      </DraggableModal>

      <View pointerEvents="none" style={{ position: "absolute", top: screenHeight - logoHeight - insets.bottom - 30, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
        <Image source={require("../../assets/images/transparentlogo.png")} style={{ width: logoSize, height: logoHeight }} contentFit="contain" />
      </View>
    </View>
  );
};

export default memo(RegisterScreen);
