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
  InteractionManager,
} from "react-native";
import { Image } from 'expo-image';
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import * as ScreenCapture from "expo-screen-capture";

import { useAuthStore } from "@/store/auth";
import { ErrorBoundary } from "@/component/ErrorBoundary";
import { translations } from "../translations";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

if (Platform.OS === "android") {
  SystemUI.setBackgroundColorAsync("#000000").catch(() => {});
  NavigationBar.setBackgroundColorAsync("#000000").catch(() => {}); 
  NavigationBar.setButtonStyleAsync("light").catch(() => {});
  NavigationBar.setPositionAsync("absolute").catch(() => {});
  NavigationBar.setBehaviorAsync("inset-touch").catch(() => {});
  NavigationBar.setVisibilityAsync("always" as any).catch(() => {});
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
        duration: 800, 
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
          InteractionManager.runAfterInteractions(() => {
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
    <View style={{ flex: 1, backgroundColor: "#000000", paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }}>
      <StatusBar style="light" />
      <View style={{ 
        flex: 1, 
        backgroundColor: "#ffffff",
      }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="screen" />
        <Stack.Screen name="(tabs)" />
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
  const [appReady, setAppReady] = useState(false);
  const preloadData = useAuthStore((state) => state.preloadData);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        try {
          const { useEqubTypesStore } = require("../store/equbTypesStore");
          await Promise.all([
            preloadData(),
            useEqubTypesStore.getState().loadAvailableTypes(),
          ]);
        } catch (e) {
          console.warn("Preload failed", e);
        } finally {
          setAppReady(true);
        }
      }
    }
    prepare();
  }, [fontsLoaded, preloadData]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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

  useEffect(() => {
    const setNavBar = async () => {
      if (Platform.OS !== "android") return;
      try {
        await NavigationBar.setBackgroundColorAsync("#000000");
        await NavigationBar.setButtonStyleAsync("light");
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBehaviorAsync("inset-touch");
        await NavigationBar.setVisibilityAsync("always" as any);
      } catch (error) {
        console.warn("Failed to set navigation bar configuration:", error);
      }
    };
    setNavBar();
  }, []);

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
