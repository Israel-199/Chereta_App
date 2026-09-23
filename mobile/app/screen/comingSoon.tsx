import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Image,
  StatusBar as RNStatusBar,
  useWindowDimensions,
  AppState,
} from "react-native";
import { useAuthStore } from "@/store/auth";
import { useAppConfigStore } from "@/store/appConfigStore";
import { useRouter, useFocusEffect } from "expo-router";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

type AnimatedTimeBoxProps = {
  label: string;
  value: number;
  above: number;
  prev: number;
  below: number;
};

const SLIDES = [
  require("@/assets/images/cmslide1.png"),
  require("@/assets/images/cmslide2.png"),
  require("@/assets/images/cmslide3.png"),
];

const ICON_IMAGE = require("@/assets/images/icon2.png");

function BackgroundSlideshow() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const opacityA = useRef(new Animated.Value(1)).current;
  const scaleA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [imageA, setImageA] = useState(SLIDES[0]);
  const [imageB, setImageB] = useState(SLIDES[1]);
  const isInitialMount = useRef(true);

  const ZOOM_SCALE = 1.05; 
  const TOTAL_CYCLE_TIME = 4000; 
  const FADE_OUT_START = 3000; 
  const FADE_DURATION = 1000; 

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setIndex((i) => i);
      } else {
        opacityA.stopAnimation();
        opacityB.stopAnimation();
        scaleA.stopAnimation();
        scaleB.stopAnimation();
      }
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (appState !== "active") return;

    let timer: ReturnType<typeof setTimeout>;
    let nextIdx = (index + 1) % SLIDES.length;

    const startTransition = () => {
      if (activeSlot === 'A') {
        setImageB(SLIDES[nextIdx]);
        scaleB.setValue(1);
        Animated.parallel([
          Animated.timing(opacityA, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
          Animated.timing(opacityB, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
          Animated.timing(scaleB, { toValue: ZOOM_SCALE, duration: TOTAL_CYCLE_TIME, useNativeDriver: true }),
        ]).start((res) => {
          if (res.finished) {
            setActiveSlot('B');
            setIndex(nextIdx);
            scaleA.setValue(1);
          }
        });
      } else {
        setImageA(SLIDES[nextIdx]);
        scaleA.setValue(1);

        Animated.parallel([
          Animated.timing(opacityB, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
          Animated.timing(opacityA, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
          Animated.timing(scaleA, { toValue: ZOOM_SCALE, duration: TOTAL_CYCLE_TIME, useNativeDriver: true }),
        ]).start((res) => {
          if (res.finished) {
            setActiveSlot('A');
            setIndex(nextIdx);
            scaleB.setValue(1);
          }
        });
      }
    };

    if (isInitialMount.current) {
       isInitialMount.current = false;
       Animated.timing(scaleA, {
         toValue: ZOOM_SCALE,
         duration: TOTAL_CYCLE_TIME,
         useNativeDriver: true,
       }).start();
    }

    timer = setTimeout(startTransition, TOTAL_CYCLE_TIME - FADE_DURATION);
    return () => clearTimeout(timer);
  }, [index, activeSlot, appState]);

  const commonTransform = [
    { translateX: -width * 0.8 }, 
    { translateY: -height * 0.05 }
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]}>
      <Animated.Image
        source={imageA}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacityA,
            transform: [{ scale: scaleA }, ...commonTransform],
          },
        ]}
        resizeMode="cover"
      />
      <Animated.Image
        source={imageB}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacityB,
            transform: [{ scale: scaleB }, ...commonTransform],
          },
        ]}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
    </View>
  );
}

export default function ComingSoon() {
  const router = useRouter();
  const { language } = useAuthStore();
  const { appLive, loading, loadConfig } = useAppConfigStore();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [now, setNow] = useState<number>(Date.now());

  const [fontsLoaded] = useFonts({
    "NotoSans-Bold": require("@/assets/fonts/NotoSans-Bold.ttf"),
  });

  useFocusEffect(
    React.useCallback(() => {
      RNStatusBar.setBarStyle("light-content");
      RNStatusBar.setBackgroundColor("#0B3C8A");
      return () => {};
    }, [])
  );

  let t = en;
  if (language === "አማርኛ") t = am;
  else if (language === "Afaan Oromo") t = or;
  else if (language === "Af Somali") t = so;
  else if (language === "ትግርኛ") t = ti;

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const localLaunchDate = new Date("2026-09-11T00:00:00.000Z");

  const time = useMemo(() => {
    const diff = Math.max(Math.floor((localLaunchDate.getTime() - now) / 1000), 0);
    return {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  }, [now]);

  const prevTime = useMemo(() => {
    const diff = Math.max(Math.floor((localLaunchDate.getTime() - now) / 1000) + 1, 0);
    return {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  }, [now]);

  const fixedBelow = { days: 186, hours: 10, minutes: 2, seconds: 59 };

  if (!fontsLoaded) return null;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const logoSize = Math.min(width * 0.4, 200);
  const timeBoxScale = Math.min(width / 375, 1.2);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0B3C8A" />
      <BackgroundSlideshow />

      {/* Blue Top Status Bar */}
      <View
        style={{
          height: insets.top,
          backgroundColor: "#0B3C8A",
          width: "100%",
          zIndex: 10,
        }}
      />

      <View style={[styles.contentWrapper, { paddingTop: 20 }]}>
        <View style={styles.logoWrapper}>
          <Image
            source={ICON_IMAGE}
            style={[styles.iconImage, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.countdownContainer, { transform: [{ scale: timeBoxScale }] }]}>
          <AnimatedTimeBox
            label={t.days}
            value={time.days}
            above={time.days}
            prev={prevTime.days}
            below={fixedBelow.days}
          />
          <View style={styles.colonWrapper}><Text style={styles.colon}>:</Text></View>
          <AnimatedTimeBox
            label={t.hours}
            value={time.hours}
            above={time.hours}
            prev={prevTime.hours}
            below={fixedBelow.hours}
          />
          <View style={styles.colonWrapper}><Text style={styles.colon}>:</Text></View>
          <AnimatedTimeBox
            label={t.minutes}
            value={time.minutes}
            above={time.minutes}
            prev={prevTime.minutes}
            below={fixedBelow.minutes}
          />
          <View style={styles.colonWrapper}><Text style={styles.colon}>:</Text></View>
          <AnimatedTimeBox
            label={t.seconds}
            value={time.seconds}
            above={time.seconds}
            prev={prevTime.seconds}
            below={fixedBelow.seconds}
          />
        </View>
      </View>
    </View>
  );
}

function AnimatedTimeBox({ label, value, prev }: AnimatedTimeBoxProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const [prevValue, setPrevValue] = useState<number>(value);

  useEffect(() => {
    if (prevValue !== value) {
      animValue.setValue(-34);
      rotateValue.setValue(1);
      Animated.parallel([
        Animated.timing(animValue, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(rotateValue, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
      setPrevValue(value);
    }
  }, [value]);

  const rotateX = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-90deg"],
  });

  return (
    <View style={styles.timeBox}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.digitCard}>
        <View style={styles.scrollWrapper}>
          <Animated.Text
            style={[
              styles.timeValue,
              { transform: [{ translateY: animValue }, { perspective: 300 }, { rotateX }] },
            ]}
          >
            {prev.toString().padStart(2, "0")}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  logoWrapper: {
    marginBottom: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  iconImage: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },
  habeshaTitle: {
    fontFamily: "NotoSans-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  timeBox: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  digitCard: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginTop: 8,
    height: 44,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    elevation: 12,
  },
  scrollWrapper: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  timeValue: {
    fontSize: 28,
    fontFamily: "NotoSans-Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: "NotoSans-Bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  colonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 44,
    marginTop: 28,
  },
  colon: {
    fontSize: 28,
    fontFamily: "NotoSans-Bold",
    color: "rgba(255,255,255,0.7)",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});