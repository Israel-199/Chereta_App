import { Tabs, useSegments } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import { typography } from "../../styles/typography";
import {
  Animated,
  View,
  useWindowDimensions,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useNotificationStore } from "../../store/notificationStore";
import api from "../../api/axiosClient";
import { StatusBar } from "expo-status-bar";

const TAB_COUNT = 4;

const TabIcon = ({ name, type, color, size }: { name: string, type: 'mc' | 'fa', color: string, size: number }) => {
  if (type === 'mc') return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
  return <FontAwesome6 name={name as any} size={19} color={color} />;
};

const MemoTabIcon = React.memo(TabIcon);

const CustomTabButton = (props: any) => (
  <TouchableWithoutFeedback onPress={props.onPress}>
    <View style={props.style}>{props.children}</View>
  </TouchableWithoutFeedback>
);

const TabsLayout = () => {
  const language = useAuthStore((state) => state.language);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const segments = useSegments();

  const t = useMemo(() => translations[language], [language]);
  const translateX = useRef(new Animated.Value(0)).current;

  const scaleFactor = Math.min(1, width / 360);
  const TAB_BAR_HEIGHT = (60 * scaleFactor) + (Platform.OS === 'ios' ? insets.bottom : 0);
  const TAB_WIDTH = width / TAB_COUNT;

  const animateIndicator = useCallback((index: number) => {
    Animated.spring(translateX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
      stiffness: 350, 
      damping: 30,
      mass: 0.8,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
    }).start();
  }, [translateX, TAB_WIDTH]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/user/notifications');
        const validLogs = response.data.filter((log: any) => log.title?.trim() && log.message?.trim());
        const notifs = validLogs.map((log: any) => {
          const dateObj = new Date(log.createdAt);
          return {
            id: log.id,
            title: log.title,
            message: log.message,
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: log.type,
            isRead: false,
          };
        });
        useNotificationStore.getState().setNotifications(notifs);
      } catch (err) {
        console.error("Failed to sync notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const tabName = segments[segments.length - 1];
    const tabIndices: Record<string, number> = {
      "home": 0,
      "myequbs": 1,
      "payment": 2,
      "account": 3
    };
    if (tabName && tabIndices[tabName] !== undefined) {
      animateIndicator(tabIndices[tabName]);
    }
  }, [segments, animateIndicator]);

  const screenOptions = useMemo(() => ({
    headerShown: false,
    animation: "none" as any,
    lazy: false,
    freezeOnBlur: false,
    detachInactiveScreens: false,
    tabBarHideOnKeyboard: false,
    sceneContainerStyle: { backgroundColor: "#ffffff" },
    tabBarStyle: {
      backgroundColor: "#ffffff",
      borderTopWidth: 0,
      height: TAB_BAR_HEIGHT,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
      paddingTop: 6,
      elevation: Platform.OS === "android" ? 8 : 0,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    tabBarButton: (props: any) => <CustomTabButton {...props} />,
    tabBarLabelStyle: {
      fontSize: 12 * scaleFactor,
      fontWeight: "600" as any,
      marginTop: 2,
      fontFamily: ETHIOPIC_LANGUAGES.has(language) 
        ? typography.amharicRegular?.fontFamily 
        : typography.englishRegular?.fontFamily,
    } as any,
    tabBarActiveTintColor: "#0B3C8A",
    tabBarInactiveTintColor: "#506280",
  }), [TAB_BAR_HEIGHT, insets.bottom, scaleFactor, language]);

  const homeIcon = useCallback(({ color, size }: { color: string, size: number }) => (
    <MemoTabIcon type="mc" name="home" size={size} color={color} />
  ), []);
  const equbsIcon = useCallback(({ color, size }: { color: string, size: number }) => (
    <MemoTabIcon type="mc" name="sync" size={size} color={color} />
  ), []);
  const paymentIcon = useCallback(({ color }: { color: string }) => (
    <MemoTabIcon type="fa" name="money-bills" size={19} color={color} />
  ), []);
  const accountIcon = useCallback(({ color, size }: { color: string, size: number }) => (
    <MemoTabIcon type="mc" name="account" size={size} color={color} />
  ), []);

  const homeListeners = useMemo(() => ({}), []);
  const equbsListeners = useMemo(() => ({}), []);
  const paymentListeners = useMemo(() => ({}), []);
  const accountListeners = useMemo(() => ({}), []);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="light" backgroundColor="#0B3C8A" />
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen name="home" listeners={homeListeners} options={{ title: t.homeTab, tabBarIcon: homeIcon }} />
        <Tabs.Screen name="myequbs" listeners={equbsListeners} options={{ title: t.myEqubsTab, tabBarIcon: equbsIcon }} />
        <Tabs.Screen name="payment" listeners={paymentListeners} options={{ title: t.paymentTab, tabBarIcon: paymentIcon }} />
        <Tabs.Screen name="account" listeners={accountListeners} options={{ title: t.accountTab, tabBarIcon: accountIcon }} />
      </Tabs>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: TAB_BAR_HEIGHT - 3,
          left: 0,
          width: TAB_WIDTH,
          height: 3,
          backgroundColor: "#22C55E",
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export default TabsLayout;

const ETHIOPIC_LANGUAGES = new Set(["አማርኛ", "ትግርኛ"]);