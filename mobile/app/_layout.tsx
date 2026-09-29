import { Stack } from "expo-router";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ToastConfig,
} from "react-native-toast-message";
import Toast from "react-native-toast-message";
import NetInfo from "@react-native-community/netinfo";
import * as React from "react";
import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import {
  Text,
  StyleSheet,
  Animated,
  View,
  Platform,
  AppState,
  useWindowDimensions,
} from "react-native";
import { Image } from 'expo-image';
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { NavigationBar } from "expo-navigation-bar";
import AppStatusBar from "@/component/AppStatusBar";
import {
  applyAndroidSystemNavigationBar,
  bindAndroidSystemNavigationBar,
} from "@/utils/androidSystemBar";
import { SCREEN_BG } from "@/constants/theme";
import { useCheretaCache } from "@/store/cheretaCache";

SplashScreen.preventAutoHideAsync().catch(() => {});
import { ErrorBoundary } from "@/component/ErrorBoundary";
import { translations } from "../translations";
import { useAuthStore } from "@/store/auth";
import { runWhenIdle } from "@/utils/runWhenIdle";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

if (Platform.OS === "android") {
  SystemUI.setBackgroundColorAsync(SCREEN_BG).catch(() => {});
  applyAndroidSystemNavigationBar();
}



import { useSegments } from "expo-router";

const getFontFamily = (bold = false, language = "English") =>
  language === "አማርኛ" || language === "ትግርኛ"
    ? bold
      ? "NotoSansEthiopic-Bold"
      : "NotoSansEthiopic-Regular"
    : bold
    ? "NotoSans-Bold"
    : "NotoSans-Regular";

const ProfessionalToast = memo(({ children, scaleFactor }: { children: React.ReactNode, scaleFactor: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30, 
        friction: 10, 
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 25, 
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ 
      width: '100%', 
      alignItems: 'center', 
      opacity: opacityAnim,
      transform: [{ scale: scaleAnim }, { translateY }]
    }}>
      {children}
    </Animated.View>
  );
});

const AppContent = memo(() => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const scaleFactor = Math.min(1, windowWidth / 360);
  const [isConnected, setIsConnected] = useState(true);
  const { language } = useAuthStore();

  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const toastConfig: ToastConfig = useMemo(() => ({
    success: ({ text1, text2 }) => (
      <ProfessionalToast scaleFactor={scaleFactor}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#16A34A",
            paddingVertical: 24 * scaleFactor,
            paddingHorizontal: 20 * scaleFactor,
            borderRadius: 16 * scaleFactor,
            width: "90%",
            alignSelf: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <MaterialCommunityIcons name="check-decagram" size={26 * scaleFactor} color="#fff" style={{ marginRight: 12 * scaleFactor }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: getFontFamily(true, language), fontSize: 14.5 * scaleFactor, color: "#fff", marginBottom: 1 }}>
              {text1}
            </Text>
            {text2 ? (
              <Text style={{ fontFamily: getFontFamily(false, language), fontSize: 14 * scaleFactor, color: "rgba(255,255,255,0.95)" }}>
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </ProfessionalToast>
    ),
    error: ({ text1, text2 }) => (
      <ProfessionalToast scaleFactor={scaleFactor}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#DC2626",
            paddingVertical: 24 * scaleFactor,
            paddingHorizontal: 20 * scaleFactor,
            borderRadius: 16 * scaleFactor,
            width: "90%",
            alignSelf: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <MaterialCommunityIcons name="alert-octagon" size={26 * scaleFactor} color="#fff" style={{ marginRight: 12 * scaleFactor }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: getFontFamily(true, language), fontSize: 14.5 * scaleFactor, color: "#fff", marginBottom: 1 }}>
              {text1}
            </Text>
            {text2 ? (
              <Text style={{ fontFamily: getFontFamily(false, language), fontSize: 14 * scaleFactor, color: "rgba(255,255,255,0.95)" }}>
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </ProfessionalToast>
    ),
    info: ({ text1, text2 }) => (
      <ProfessionalToast scaleFactor={scaleFactor}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#0EA5E9",
            paddingVertical: 24 * scaleFactor,
            paddingHorizontal: 20 * scaleFactor,
            borderRadius: 16 * scaleFactor,
            width: "90%",
            alignSelf: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <MaterialCommunityIcons name="information" size={26 * scaleFactor} color="#fff" style={{ marginRight: 12 * scaleFactor }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: getFontFamily(true, language), fontSize: 14.5 * scaleFactor, color: "#fff", marginBottom: 1 }}>
              {text1}
            </Text>
            {text2 ? (
              <Text style={{ fontFamily: getFontFamily(false, language), fontSize: 14 * scaleFactor, color: "rgba(255,255,255,0.95)" }}>
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </ProfessionalToast>
    ),
  }), [scaleFactor, language]);

  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && (state.isInternetReachable ?? true);
      setIsConnected(!!connected);
    });
    return () => unsubscribe();
  }, []);

  const { token, profile, quickCheckStatus } = useAuthStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let interval: any;

    const startPolling = () => {
      if (!interval && isConnected && token) {
        const pollInterval = 10000;

        interval = setInterval(() => {
          runWhenIdle(() => {
            if (appState.current === 'active') {
              quickCheckStatus().catch(() => {});
            }
          });
        }, pollInterval);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleAppStateChange = (nextAppState: any) => {
      appState.current = nextAppState;
      if (appState.current === 'active') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (appState.current === 'active') {
      startPolling();
    }

    return () => {
      subscription.remove();
      stopPolling();
    };
  }, [isConnected, token, profile?.status, quickCheckStatus]);

  useEffect(() => {
    if (!isConnected) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 100, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isConnected, slideAnim, fadeAnim, scaleAnim]);

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <AppStatusBar />
      <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
          contentStyle: { backgroundColor: "#F2F4F7" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="screen" options={{ animation: "slide_from_right" }} />
      </Stack>

      <Toast 
        position="top" 
        config={toastConfig} 
        visibilityTime={5000} 
        topOffset={insets.top + (Platform.OS === 'ios' ? 10 : 0)} 
      />

      {!isConnected && (
        <Animated.View
          style={[
            styles.banner,
            {
              bottom: Platform.OS === 'android' ? insets.bottom + 20 : 20,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <MaterialCommunityIcons name="wifi-off" size={20} color="#DC2626" />
          <Text style={styles.bannerText}>
            {translations[language]?.offlineMessage || "No Internet"}
          </Text>
        </Animated.View>
      )}
    </View>
  </View>
);
});

function RootContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const preloadData = useAuthStore((state: any) => state.preloadData);
  const token = useAuthStore((state: any) => state.token);

  useEffect(() => bindAndroidSystemNavigationBar(), []);

  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync().catch(() => {});
    useCheretaCache.getState().prefetchTabs(token);
    runWhenIdle(() => preloadData().catch(() => {}));
  }, [fontsLoaded, preloadData, token]);

  useEffect(() => {
    if (token) {
      useCheretaCache.getState().prefetchTabs(token);
    }
  }, [token]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#ffffff" }} onLayout={onLayoutRootView} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <View style={{ flex: 1, backgroundColor: SCREEN_BG }} onLayout={onLayoutRootView}>
          <AppContent />
        </View>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "NotoSans-Regular": require("../assets/fonts/NotoSans-Regular.ttf"),
    "NotoSans-Bold": require("../assets/fonts/NotoSans-Bold.ttf"),
    "NotoSansEthiopic-Regular": require("../assets/fonts/NotoSansEthiopic-Regular.ttf"),
    "NotoSansEthiopic-Bold": require("../assets/fonts/NotoSansEthiopic-Bold.ttf"),
  });

  return (
    <SafeAreaProvider>
      <RootContent fontsLoaded={fontsLoaded} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({

  banner: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerText: {
    fontFamily: "NotoSans-Bold",
    fontSize: 15,
    color: "#DC2626",
    textAlign: "center",
    marginLeft: 8,
  },
});
