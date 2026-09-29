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
  Pressable,
} from "react-native";
import { useNotificationStore } from "../../store/notificationStore";
import api from "../../api/axiosClient";
import AppStatusBar from "../../component/AppStatusBar";
import {
  TAB_BAR_WHITE,
  TAB_ACTIVE_BLUE,
  LEMON_GREEN,
} from "../../constants/theme";
import { runWhenIdle } from "../../utils/runWhenIdle";

const TAB_COUNT = 4;

const TabIcon = ({
  name,
  type,
  color,
  size,
}: {
  name: string;
  type: "mc" | "fa";
  color: string;
  size: number;
}) => {
  if (type === "mc") {
    return (
      <MaterialCommunityIcons
        name={name as any}
        size={size}
        color={color}
      />
    );
  }

  return (
    <FontAwesome6
      name={name as any}
      size={19}
      color={color}
    />
  );
};

const MemoTabIcon = React.memo(TabIcon);

const TabsLayout = () => {
  const language = useAuthStore((state) => state.language);
  const token = useAuthStore((state) => state.token);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const segments = useSegments();

  const t = useMemo(
    () => translations[language],
    [language]
  );

  const translateX = useRef(
    new Animated.Value(0)
  ).current;

  const scaleFactor = Math.min(1, width / 360);

  /*
   * IMPORTANT:
   * Include the Android bottom safe-area inset.
   *
   * This prevents the Android system navigation area
   * from covering the application's bottom tabs.
   */
  const TAB_CONTENT_HEIGHT = 60 * scaleFactor;

  const TAB_BAR_HEIGHT =
    TAB_CONTENT_HEIGHT + insets.bottom;

  const TAB_WIDTH = width / TAB_COUNT;

  const animateIndicator = useCallback(
    (index: number) => {
      Animated.spring(translateX, {
        toValue: index * TAB_WIDTH,
        useNativeDriver: true,
        stiffness: 350,
        damping: 30,
        mass: 0.8,
        restDisplacementThreshold: 0.001,
        restSpeedThreshold: 0.001,
      }).start();
    },
    [translateX, TAB_WIDTH]
  );

  /*
   * Notification synchronization
   */
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/user/notifications");

        const validLogs = response.data.filter(
          (log: any) =>
            log.title?.trim() &&
            log.message?.trim()
        );

        const notifs = validLogs.map((log: any) => {
          const dateObj = new Date(log.createdAt);

          return {
            id: log.id,
            title: log.title,
            message: log.message,
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: log.type,
            isRead: false,
          };
        });

        useNotificationStore
          .getState()
          .setNotifications(notifs);
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.warn(
            "Failed to sync notifications",
            err?.message || err
          );
        }
      }
    };

    runWhenIdle(() => {
      fetchNotifications();
    });
  }, [token]);

  /*
   * Move active indicator when changing tabs.
   */
  useEffect(() => {
    const tabName =
      segments[segments.length - 1];

    const tabIndices: Record<string, number> = {
      home: 0,
      mychereta: 1,
      winner: 2,
      account: 3,
    };

    if (
      tabName &&
      tabIndices[tabName] !== undefined
    ) {
      animateIndicator(tabIndices[tabName]);
    }
  }, [
    segments,
    animateIndicator,
  ]);

  /*
   * Completely transparent Android ripple.
   *
   * This prevents the visible colored/pencil/ripple
   * effect when touching a tab.
   */
  const tabBarButton = useCallback(
    (props: any) => (
      <Pressable
        {...props}
        android_ripple={{
          color: "transparent",
          borderless: false,
        }}
      />
    ),
    []
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false,

      animation: "none" as any,

      lazy: false,

      tabBarHideOnKeyboard: false,

      sceneContainerStyle: {
        backgroundColor: "#F2F4F7",
      },

      /*
       * The tab bar now includes the Android bottom inset.
       *
       * This keeps the actual tabs above the Android
       * system navigation area.
       */
      tabBarStyle: {
        backgroundColor: TAB_BAR_WHITE,

        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",

        height: TAB_BAR_HEIGHT,

        /*
         * Reserve the Android system navigation area.
         */
        paddingBottom: insets.bottom,

        paddingTop: 6,

        elevation:
          Platform.OS === "android"
            ? 12
            : 0,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },

      tabBarLabelStyle: {
        fontSize: 12 * scaleFactor,

        fontWeight: "600" as any,

        marginTop: 2,

        fontFamily: ETHIOPIC_LANGUAGES.has(
          language
        )
          ? typography.amharicRegular
              ?.fontFamily
          : typography.englishRegular
              ?.fontFamily,
      } as any,

      tabBarActiveTintColor: LEMON_GREEN,

      tabBarInactiveTintColor: "#6B7280",

      /*
       * Disable React Navigation's tab press color.
       */
      tabBarPressColor: "transparent",

      /*
       * Disable the Android ripple/focus effect.
       */
      tabBarButton,
    }),
    [
      TAB_BAR_HEIGHT,
      insets.bottom,
      scaleFactor,
      language,
      tabBarButton,
    ]
  );

  /*
   * Tab icons
   */
  const homeIcon = useCallback(
    ({
      color,
      size,
    }: {
      color: any;
      size: number;
    }) => (
      <MemoTabIcon
        type="mc"
        name="home"
        size={size}
        color={color}
      />
    ),
    []
  );

  const myCheretaIcon = useCallback(
    ({
      color,
      size,
    }: {
      color: any;
      size: number;
    }) => (
      <MemoTabIcon
        type="mc"
        name="gavel"
        size={size}
        color={color}
      />
    ),
    []
  );

  const winnerIcon = useCallback(
    ({
      color,
      size,
    }: {
      color: any;
      size: number;
    }) => (
      <MemoTabIcon
        type="mc"
        name="trophy"
        size={size}
        color={color}
      />
    ),
    []
  );

  const accountIcon = useCallback(
    ({
      color,
      size,
    }: {
      color: any;
      size: number;
    }) => (
      <MemoTabIcon
        type="mc"
        name="account"
        size={size}
        color={color}
      />
    ),
    []
  );

  /*
   * Empty listeners are memoized so the tab screens
   * do not receive unnecessary new objects.
   */
  const homeListeners = useMemo(
    () => ({}),
    []
  );

  const myCheretaListeners = useMemo(
    () => ({}),
    []
  );

  const winnerListeners = useMemo(
    () => ({}),
    []
  );

  const accountListeners = useMemo(
    () => ({}),
    []
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F2F4F7",
      }}
    >
      <AppStatusBar />

      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="home"
          listeners={homeListeners}
          options={{
            title: t.homeTab,
            tabBarIcon: homeIcon,
            lazy: false,
          }}
        />

        <Tabs.Screen
          name="mychereta"
          listeners={myCheretaListeners}
          options={{
            title:
              t.myChereta ||
              "My Chereta",
            tabBarIcon: myCheretaIcon,
            lazy: false,
          }}
        />

        <Tabs.Screen
          name="winner"
          listeners={winnerListeners}
          options={{
            title:
              t.winners ||
              "Winners",
            tabBarIcon: winnerIcon,
            lazy: false,
          }}
        />

        <Tabs.Screen
          name="account"
          listeners={accountListeners}
          options={{
            title: t.accountTab,
            tabBarIcon: accountIcon,
          }}
        />
      </Tabs>

      {/*
       * Active blue indicator.
       *
       * It stays at the TOP of the tab bar, so the
       * Android bottom system inset does not affect it.
       */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",

          bottom:
            TAB_BAR_HEIGHT - 3,

          left: 0,

          width: TAB_WIDTH,

          height: 3,

          backgroundColor:
            TAB_ACTIVE_BLUE,

          transform: [
            {
              translateX,
            },
          ],
        }}
      />
    </View>
  );
};

export default TabsLayout;

const ETHIOPIC_LANGUAGES =
  new Set([
    "አማርኛ",
    "ትግርኛ",
  ]);