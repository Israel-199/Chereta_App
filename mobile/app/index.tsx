import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
  StyleSheet,
  useWindowDimensions,
  InteractionManager,
  Alert,
} from "react-native";
import { Image } from 'expo-image';
import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "@/api/auth";
import { useRouter } from "expo-router";
import {
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Navbar from "@/component/Navbar";
import { IOSLoader } from "@/component/ButtonLoadingEffect";
import { translations } from "@/translations";
import { useAuthStore } from "@/store/auth";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";
import { useLoginScreenStyles } from "@/styles/loginScreenStyles";
import { useAppConfigStore } from "@/store/appConfigStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const ETHIOPIC_LANGUAGES = new Set(["አማርኛ", "ትግርኛ"]);
const LANGUAGES = ["English", "አማርኛ", "Afaan Oromo", "Af Somali", "ትግርኛ"];

export default function LoginScreen() {
  const { loadConfig } = useAppConfigStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const { width: windowWidth } = useWindowDimensions();
  const scaleFactor = Math.min(1, windowWidth / 360);
  const styles = useLoginScreenStyles();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const { language, setLanguage, token } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const [isValid, setIsValid] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  const t = useMemo(() => translations[language] ?? {}, [language]);

  const getFontFamily = useCallback((bold: boolean = false) => {
    if (ETHIOPIC_LANGUAGES.has(language)) {
      return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
    }
    return bold ? "NotoSans-Bold" : "NotoSans-Regular";
  }, [language]);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    fadeAnim.setValue(0);
    translateY.setValue(-10);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    const valid = /^9\d{8}$/.test(value.trim()) || /^09\d{8}$/.test(value.trim());
    setIsValid(valid || value.length === 0);
    if (valid) Keyboard.dismiss();
  }, [fadeAnim, translateY]);

  const requestOtpMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: (data) => {
      if (data.code) {
        Notifications.scheduleNotificationAsync({
          content: { 
            title: t.otpVerification || "Your OTP Code", 
            body: `${t.otpSent || "Code"}: ${data.code}` 
          },
          trigger: null,
        }).catch(() => {});

        Alert.alert(
          t.otpVerification || "Your OTP Code",
          `${t.otpSent || "Code"}: ${data.code}`,
          [{ text: t.ok || "OK" }]
        );
      }

      if (data.token) {
        if (data.needsProfileCompletion) router.push("/screen/registerScreen");
        else router.replace("/home");

        if (data.messageKey && !data.needsProfileCompletion) {
          Toast.show({ type: "success", text1: t[data.messageKey] });
        }
      } else {
        router.push({ pathname: "/screen/otp", params: { phone } });
      }
    },
    onError: (err: any) => {
      const key = err.response?.data?.errorKey || err.message;
      Toast.show({ type: "error", text1: t.failed, text2: t[key] || key });
    },
  });

  const handleSubmit = useCallback(() => {
    let normalizedPhone = phone.trim();
    if (/^9\d{8}$/.test(normalizedPhone)) normalizedPhone = `+251${normalizedPhone}`;
    else if (/^09\d{8}$/.test(normalizedPhone)) normalizedPhone = `+251${normalizedPhone.slice(1)}`;
    requestOtpMutation.mutate(normalizedPhone);
  }, [phone, requestOtpMutation]);

  const toggleDropdown = useCallback(() => setShowDropdown(prev => !prev), []);

  const languageDropdown = useMemo(() => {
    if (!showDropdown) return null;
    return (
      <>
        <TouchableOpacity style={[StyleSheet.absoluteFill, { zIndex: 99 }]} activeOpacity={1} onPress={() => setShowDropdown(false)} />
        <View style={[styles.dropdownOverlay, { zIndex: 100 }]}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.dropdownItem}
              onPress={() => {
                setLanguage(lang);
                setShowDropdown(false);
              }}
            >
              <Text style={[styles.dropdownText, { fontFamily: getFontFamily(false) }, language === lang && { fontWeight: "700", color: "#0B3C8A" }]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  }, [showDropdown, styles, getFontFamily, language, setLanguage]);

  const navLeftIcon = useMemo(() => <FontAwesome6 name="down-left-and-up-right-to-center" size={16} color="#fff" />, []);
  const worldIcon = useMemo(() => <Fontisto name="world-o" size={19} color="#fff" />, []);
  const chevronIcon = useMemo(() => <MaterialCommunityIcons name="chevron-down" size={19} color="#fff" />, []);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="light" backgroundColor="#0B3C8A" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Navbar
          leftIcon={navLeftIcon}
          title="Habesha Equb"
          firstIcon={worldIcon}
          secondIcon={chevronIcon}
          language={language}
          onSecondPress={toggleDropdown}
        />
        {languageDropdown}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", paddingHorizontal: 10, width: "100%", maxWidth: 600, alignSelf: "center" }}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
        >
          <View>
            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/transparentlogo.png")} style={styles.logoImage} contentFit="contain" transition={200} />
              <Text numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.5} style={[styles.title, { fontFamily: getFontFamily(true), height: 32 * scaleFactor, textAlignVertical: "center", includeFontPadding: false, marginBottom: 10 * scaleFactor }]}>{t.title}</Text>
              <Text numberOfLines={2} adjustsFontSizeToFit={true} minimumFontScale={0.7} style={[styles.subtitle, { fontFamily: getFontFamily(false), height: 42 * scaleFactor, textAlignVertical: "center", includeFontPadding: false, lineHeight: 21 * scaleFactor }]}>{t.subtitle}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text numberOfLines={2} adjustsFontSizeToFit={true} minimumFontScale={0.7} style={[styles.desc, { fontFamily: getFontFamily(false), height: 38 * scaleFactor, textAlignVertical: "center", includeFontPadding: false, lineHeight: 19 * scaleFactor }]}>{t.desc}</Text>
            </View>
            <View style={{ width: "90%", maxWidth: 400, alignSelf: "center" }}>
              <View style={styles.inputRow}>
                <View style={styles.countryBox}><Text style={{ fontSize: 20 }}>🇪🇹</Text><Text style={[styles.countryText, { fontFamily: getFontFamily(false), marginLeft: 6 }]}>+251</Text></View>
                <View style={{ flex: 1, position: "relative", justifyContent: "center" }}>
                  <TextInput value={phone} onChangeText={handlePhoneChange} maxLength={9} keyboardType="phone-pad" style={[styles.input, { includeFontPadding: false, fontFamily: getFontFamily(false), color: phone ? "#000" : "transparent", textAlign: "left" }, !isValid && { borderColor: "red" }]} />
                  {!phone && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: "center", paddingLeft: 15 }]}><Text style={{ fontSize: 17, color: "#999", fontFamily: getFontFamily(false), includeFontPadding: false }}>911 23 45 67</Text></View>}
                  <Animated.View style={{ position: "absolute", right: 10, top: 62, backgroundColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, alignItems: "center", justifyContent: "center", opacity: fadeAnim, transform: [{ translateY }] }}><Text style={{ fontSize: 11, color: "#0B3C8A", fontFamily: getFontFamily(false), includeFontPadding: false, lineHeight: 15 }}>{phone.length}/9</Text></Animated.View>
                </View>
              </View>
              {!isValid && <Text style={{ position: "absolute", top: -7, left: 150, color: "red", fontSize: 12, backgroundColor: "#fff", paddingHorizontal: 4, fontFamily: getFontFamily(false), includeFontPadding: false, lineHeight: 14 }}>{t.enterValidNumber}</Text>}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={requestOtpMutation.isPending} activeOpacity={0.8}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 28, paddingHorizontal: 8 }}>
                {requestOtpMutation.isPending ? <IOSLoader size={22} color="#fff" /> : <View style={{ flexDirection: "row", alignItems: "center" }}><Text style={[styles.buttonText, { fontFamily: getFontFamily(true) }]}>{t.next}</Text><MaterialCommunityIcons name="arrow-right" size={25} color="#fff" style={{ marginLeft: 5 }} /></View>}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ position: "absolute", bottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 5, left: 0, right: 0, paddingVertical: 5, backgroundColor: "transparent", alignItems: "center" }}><Text style={{ fontSize: 11, color: "#6B7280", textAlign: "center", fontFamily: getFontFamily(false) }}>{t.footerRights}</Text></View>
    </View>
  );
}