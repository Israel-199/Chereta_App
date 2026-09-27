import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
  Alert,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, resendOtp } from "@/api/auth";
import { useAuthStore } from "@/store/auth";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useResponsiveStyles, spacing } from "@/styles/otpScreenStyles";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Keyboard } from "react-native";
import Navbar from "@/component/Navbar";
import { translations } from "@/translations";
import { useCheretaCache } from "@/store/cheretaCache";

function normalizePhone(raw: string) {
  let p = raw.trim();
  if (p.startsWith("09")) {
    return `+251${p.slice(1)}`;
  }
  if (p.startsWith("9") && p.length === 9) {
    return `+251${p}`;
  }
  if (p.startsWith("+251")) {
    return p;
  }
  return p;
}

export default function OtpScreen() {
   const styles = useResponsiveStyles();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const insets = useSafeAreaInsets();
  const { setToken } = useAuthStore();
  const { language, setLanguage } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);
  const animations = useRef(code.map(() => new Animated.Value(1))).current;
  const [timer, setTimer] = useState(59);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateY.setValue(-8);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [timer]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const otpValue = code.join("");

  const languages = ["English", "አማርኛ", "Afaan Oromo", "Af Somali", "ትግርኛ"];

const verifyOtpMutation = useMutation({
  mutationFn: () => {
    const normalizedPhone = normalizePhone(phone);
    return verifyOtp(normalizedPhone, otpValue, "device-123");
  },
  onSuccess: async (data) => {
    if (data.token) {
      setToken(data.token);
      useCheretaCache.getState().prefetchTabs(data.token);
    }

    if (data.needsProfileCompletion) {
      router.push("/screen/registerScreen");
    } else {
      router.replace("/(tabs)/home");
    }

    if (data.messageKey) {
      Toast.show({
        type: "success",
        text1: translations[language].otpSuccess || translations[language].success,
        text2: translations[language][data.messageKey],
      });
    }
  },
  onError: (err: any) => {
    const key = err.response?.data?.errorKey || err.message;
    Toast.show({
      type: "error",
      text1: translations[language].otpFailed || translations[language].failed,
      text2: translations[language][key] || key,
    });
  },
});

const resendOtpMutation = useMutation({
  mutationFn: () => {
    const normalizedPhone = normalizePhone(phone);
    return resendOtp(normalizedPhone);
  },
  onSuccess: async (data) => {
    if (data.code) {
      setTimer(59);
      Alert.alert(
        translations[language].otpVerification || "Your OTP Code",
        `${translations[language].otpSent || "Code"}: ${data.code}`,
        [{ text: translations[language].ok || "OK" }]
      );
    } else if (data.messageKey === "alreadyVerified") {
      Toast.show({
        type: "info",
        text1: translations[language].alreadyVerified || "Already Verified",
        text2: translations[language][data.messageKey],
      });
    }
  },
  onError: (err: any) => {
    const key = err.response?.data?.errorKey || err.message;
    Toast.show({
      type: "error",
      text1: translations[language].resendFailed || translations[language].failed,
      text2: translations[language][key] || key,
    });
  },
});

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text) {
      Animated.sequence([
        Animated.spring(animations[index], {
          toValue: 1.15,
          speed: 40,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.spring(animations[index], {
          toValue: 1,
          speed: 40,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();

      if (index < inputs.current.length - 1) {
        inputs.current[index + 1]?.focus();
      }
    } else {
      newCode[index] = "";
      setCode(newCode);
      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  useEffect(() => {
    const otpValue = code.join("");
    if (otpValue.length === 6 && code.every((d) => d !== "")) {
      Keyboard.dismiss();
      verifyOtpMutation.mutate();
    }
  }, [code]);

  const getFontFamily = (bold: boolean = false) => {
    if (language === "አማርኛ" || language === "ትግርኛ") {
      return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
    }
    return bold ? "NotoSans-Bold" : "NotoSans-Regular";
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Navbar
          leftIcon={
            <FontAwesome6
              name="down-left-and-up-right-to-center"
              size={18}
              color="#fff"
            />
          }
          language={language}
          title="Digital Chereta"
          firstIcon={<Fontisto name="world-o" size={20} color="#fff" />}
          secondIcon={
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#fff"
            />
          }
          onSecondPress={() => setShowDropdown(!showDropdown)}
        />
        {showDropdown && (
          <View style={styles.dropdownOverlay}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.dropdownItem}
                onPress={() => {
                  setLanguage(lang);
                  setShowDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    { fontFamily: getFontFamily(false) },
                    language === lang && {
                      fontWeight: "700",
                      color: "#8DB048",
                    },
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/transparentlogo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text
              style={[
                styles.subtitle,
                spacing.mbXSmall,
                {
                  fontFamily: getFontFamily(true),
                  includeFontPadding: false,
                  lineHeight: 24,
                },
              ]}
            >
              {translations[language].otpVerification}
            </Text>
            <Text
              style={[
                styles.desc,
                spacing.mbXSmall,
                {
                  fontFamily: getFontFamily(false),
                  includeFontPadding: false,
                  lineHeight: 20,
                },
              ]}
            >
              {translations[language].enterCode}
            </Text>
            <Text
              style={[
                styles.phone,
                spacing.mbMedium,
                {
                  fontFamily: getFontFamily(true),
                  includeFontPadding: false,
                  lineHeight: 22,
                },
              ]}
            >
              +251 •••• {phone?.slice(-4)}
            </Text>

            <View style={[styles.otpRow, spacing.mbMedium]}>
              {code.map((digit, i) => (
                <Animated.View
                  key={i}
                  style={{ transform: [{ scale: animations[i] }] }}
                >
                  <TextInput
                    ref={(ref) => {
                      inputs.current[i] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      {
                        fontFamily: getFontFamily(true),
                        includeFontPadding: false,
                        lineHeight: 22,
                        textAlign: "center",
                        textAlignVertical: "center",
                      },
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleChange(text, i)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace") {
                        handleChange("", i);
                      }
                    }}
                  />
                </Animated.View>
              ))}
            </View>

            <View style={[styles.resendRow, spacing.mbLarge]}>
              <Text
                style={[
                  styles.resendText,
                  {
                    fontFamily: getFontFamily(false),
                    includeFontPadding: false,
                    lineHeight: 18,
                  },
                ]}
              >
                {translations[language].didntReceive}
              </Text>
              {timer > 0 ? (
                <Animated.Text
                  style={[
                    styles.timer,
                    {
                      fontFamily: getFontFamily(true),
                      includeFontPadding: false,
                      lineHeight: 20,
                    },
                    { opacity: fadeAnim, transform: [{ translateY }] },
                  ]}
                >
                  00:{timer < 10 ? `0${timer}` : timer}
                </Animated.Text>
              ) : (
                <TouchableOpacity onPress={() => resendOtpMutation.mutate()}>
                  {resendOtpMutation.isPending ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.resendLink,
                        {
                          fontFamily: getFontFamily(true),
                          includeFontPadding: false,
                          lineHeight: 18,
                        },
                      ]}
                    >
                      {translations[language].resendCode}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

           <TouchableOpacity
  style={[styles.button, spacing.mbMedium]}
  onPress={() => verifyOtpMutation.mutate()}
  disabled={verifyOtpMutation.isPending || otpValue.length < 6}
>
  {verifyOtpMutation.isPending ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <Text
      style={[
        styles.buttonText,
        {
          fontFamily: getFontFamily(true),
          includeFontPadding: false,
          lineHeight: 22,
        },
      ]}
    >
      {translations[language].verify}
    </Text>
  )}
</TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View
        style={{
          paddingTop: 8,
          paddingBottom: 8 + (Platform.OS === 'ios' ? insets.bottom : 0) + 10,
          backgroundColor: "#F8FAFC",
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: "#6B7280",
            textAlign: "center",
            fontFamily: getFontFamily(false),
          }}
        >
          {translations[language].footerRights}
        </Text>
      </View>
    </>
  );
}
