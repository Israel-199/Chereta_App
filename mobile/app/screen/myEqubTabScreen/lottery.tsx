import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
  Modal,
  StyleSheet,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { translations } from "@/translations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LotteryWheel from "@/component/LotteryWheel";
import axiosClient from "@/api/axiosClient";

// Helper to get week identifier string for saved state (e.g., "2026-W34")
const getWeekIdentifier = (date: Date): string => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
  return `${target.getFullYear()}-W${weekNumber}`;
};

// Helper to calculate local target timestamp for Sunday 10:00 LT (16:00 EAT / 4:00 PM)
const getNextSunday10LTTimestamp = (): number => {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay(); // 0 is Sunday
  const hours = now.getHours();

  let daysToAdd = (7 - day) % 7;
  if (day === 0 && hours >= 16) {
    daysToAdd = 7;
  } else if (day === 0 && hours < 16) {
    daysToAdd = 0;
  }

  target.setDate(now.getDate() + daysToAdd);
  target.setHours(16, 0, 0, 0);
  return target.getTime();
};

// Helper to check if current moment is Sunday 10:00 LT (16:00 / 4:00 PM draw window)
const isExactSundayDrawWindow = (serverDateObj?: Date): boolean => {
  const date = serverDateObj || new Date();
  const day = date.getDay(); // 0 is Sunday
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return day === 0 && hours === 16 && minutes <= 10;
};

const getProportionalWinnerAngle = (
  winnerNumber: number,
  totalSlots: number
): number => {
  const safeWinner = Math.max(
    1,
    Math.min(totalSlots, winnerNumber)
  );

  const weights = Array.from(
    { length: totalSlots },
    (_, i) => (i + 1 >= 100 ? 1.35 : 1)
  );

  const totalWeight = weights.reduce(
    (sum, weight) => sum + weight,
    0
  );

  const angleSteps = weights.map(
    (weight) => (360 * weight) / totalWeight
  );

  let accumulatedAngle = 0;

  for (let i = 0; i < safeWinner - 1; i++) {
    accumulatedAngle += angleSteps[i];
  }

  const winnerStep = angleSteps[safeWinner - 1];

  return accumulatedAngle + winnerStep / 2;
};

export default function LotteryScreen() {
  const insets = useSafeAreaInsets();
  const { equbId } = useLocalSearchParams();
  const { myEqubs, language } = useAuthStore();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  const currentEqub = useMemo(
    () => myEqubs.find((eq: any) => eq.id === equbId || eq.equbId === equbId),
    [myEqubs, equbId]
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations] || translations.en || translations.English,
    [language]
  );

  const isEthiopic = language === "አማርኛ" || language === "ትግርኛ";
  const fontFamilyBold = isEthiopic ? "NotoSansEthiopic-Bold" : "NotoSans-Bold";
  const fontFamilyRegular = isEthiopic ? "NotoSansEthiopic-Regular" : "NotoSans-Regular";

  const hasPaid = true;

  const totalSlots = useMemo(() => {
    if (currentEqub?.totalMembers) return Math.min(104, currentEqub.totalMembers);
    if (currentEqub?.membersCount) return Math.min(104, currentEqub.membersCount);
    return 104;
  }, [currentEqub]);

  // Saved Winner & Automatic Spin State
  const [winnerNumber, setWinnerNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [loadingBackend, setLoadingBackend] = useState(true);

  const activeWeekKey = useMemo(() => getWeekIdentifier(new Date()), []);
  const storageWinnerKey = useMemo(
    () => `@lottery_winner_${equbId || "default"}_${activeWeekKey}`,
    [equbId, activeWeekKey]
  );
  const storageSeenKey = useMemo(
    () => `@lottery_anim_seen_${equbId || "default"}_${activeWeekKey}`,
    [equbId, activeWeekKey]
  );

  const initialSlot = useMemo(() => {
    let seedStr = `${activeWeekKey}_${equbId || "default"}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % totalSlots) + 1;
  }, [activeWeekKey, equbId, totalSlots]);

  const initialAngle = useMemo(() => {
    return getProportionalWinnerAngle(
      initialSlot,
      totalSlots
    );
  }, [initialSlot, totalSlots]);

  // Rotation Animation initialized at exact target angle (ZERO movement/jumping on screen open!)
  const rotationAnim = useRef(new Animated.Value(initialAngle)).current;
  const currentAngleRef = useRef(initialAngle);
  const activeSpinRef = useRef(false);

  // Countdown State
  const [targetTimestamp, setTargetTimestamp] = useState<number>(getNextSunday10LTTimestamp());
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Perform Wheel Spin Animation to Target Number (ONLY Triggered on Sunday 10:00 LT)
  const triggerSundaySpin = useCallback(
    (targetSlot: number, onComplete?: () => void) => {
      if (activeSpinRef.current) return;
      activeSpinRef.current = true;
      setIsSpinning(true);

      const targetAngleForSlot =
        getProportionalWinnerAngle(
          targetSlot,
          totalSlots
        );

      // 8 full fast spins (8 * 360 = 2880) + exact target angle
      const fullSpins = 2880;
      const currentMod = currentAngleRef.current % 360;
      let delta = targetAngleForSlot - currentMod;
      if (delta <= 0) delta += 360;

      const finalAngle = currentAngleRef.current + fullSpins + delta;

      Animated.timing(rotationAnim, {
        toValue: finalAngle,
        duration: 4200,
        easing: Easing.bezier(0.12, 0.85, 0.15, 1.0), // Smooth fast start, deceleration, stops dead on number
        useNativeDriver: true,
      }).start(async () => {
        currentAngleRef.current = finalAngle % 360;
        setWinnerNumber(targetSlot);
        setIsSpinning(false);
        activeSpinRef.current = false;

        // Instantly display winner result modal
        setShowWinnerModal(true);

        // Mark Sunday spin animation as completed for this draw week
        try {
          await AsyncStorage.setItem(storageWinnerKey, targetSlot.toString());
          await AsyncStorage.setItem(storageSeenKey, "true");
        } catch (e) {
          console.warn("Failed to save winner state", e);
        }

        if (onComplete) onComplete();
      });
    },
    [totalSlots, rotationAnim, storageWinnerKey, storageSeenKey]
  );

  // Fetch Backend Status & Enforce STRICT Sunday Spin Rule
  const fetchLotteryStatus = useCallback(async () => {
    try {
      setLoadingBackend(true);
      const res = await axiosClient.get("/equb/lottery/status", {
        params: { equbId: equbId || "default" },
      });

      const data = res.data;
      if (data && data.winnerSlot) {
        const slot = Number(data.winnerSlot);
        const nextTs = Number(data.nextDrawTimestamp) || getNextSunday10LTTimestamp();
        setTargetTimestamp(nextTs);

        const serverDateObj = data.serverTime ? new Date(data.serverTime) : new Date();
        const isSundayWindow = isExactSundayDrawWindow(serverDateObj);
        const hasSeenAnim = await AsyncStorage.getItem(storageSeenKey);

        // ALWAYS POSITION WHEEL POINTER STATICALLY ON NON-SPIN DAYS/TIMES
        setWinnerNumber(slot);
        const staticAngle =
          getProportionalWinnerAngle(
            slot,
            totalSlots
          );
        currentAngleRef.current = staticAngle;

        // IF IT IS EXACTLY SUNDAY 10:00 LT (16:00 PM) AND ANIMATION NOT SHOWN YET -> SPIN!
        if (isSundayWindow && !hasSeenAnim) {
          triggerSundaySpin(slot);
        } else {
          // STRICT NON-SPIN: Set static value with ZERO movement or animation!
          rotationAnim.setValue(staticAngle);
        }
      }
    } catch (err) {
      console.warn("Fallback to local lottery status due to network:", err);

      try {
        const savedWinner = await AsyncStorage.getItem(storageWinnerKey);
        const hasSeen = await AsyncStorage.getItem(storageSeenKey);

        let fallbackSlot = savedWinner ? parseInt(savedWinner, 10) : 1;
        if (!savedWinner) {
          let seedStr = `${activeWeekKey}_${equbId || "default"}`;
          let hash = 0;
          for (let i = 0; i < seedStr.length; i++) {
            hash = (hash << 5) - hash + seedStr.charCodeAt(i);
            hash |= 0;
          }
          fallbackSlot = (Math.abs(hash) % totalSlots) + 1;
        }

        setWinnerNumber(fallbackSlot);
        const staticAngle =
          getProportionalWinnerAngle(
            fallbackSlot,
            totalSlots
          );
        currentAngleRef.current = staticAngle;

        const isSundayWindow = isExactSundayDrawWindow(new Date());

        if (isSundayWindow && !hasSeen) {
          triggerSundaySpin(fallbackSlot);
        } else {
          // STRICT NON-SPIN: Set static angle with zero movement!
          rotationAnim.setValue(staticAngle);
        }
      } catch (e) {
        console.warn("Fallback error", e);
      }
    } finally {
      setLoadingBackend(false);
    }
  }, [equbId, storageSeenKey, storageWinnerKey, totalSlots, triggerSundaySpin, activeWeekKey, rotationAnim]);

  // On Load: Fetch Status & Position Statically (No motion unless Sunday 10:00 LT)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fetchLotteryStatus();
    });
    return () => task.cancel();
  }, [fetchLotteryStatus]);

  // Real-time High Accuracy Countdown Timer to Sunday 10:00 LT (16:00 PM)
  useEffect(() => {
    const updateCountdown = () => {
      const nowTime = new Date().getTime();
      const diff = targetTimestamp - nowTime;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // ZERO LAG: Trigger spin instantly at exact 00:00:00 tick!
        if (!isSpinning && !activeSpinRef.current) {
          const targetSlot = winnerNumber || 1;
          triggerSundaySpin(targetSlot);
          fetchLotteryStatus();
        }
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp, fetchLotteryStatus, isSpinning]);

  // Responsive Wheel Dimensions
  const wheelSize = useMemo(() => Math.min(windowWidth - 36, 360), [windowWidth]);

  // Render Full Screen Loading State until screen opens
  if (loadingBackend) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: Math.max(insets.top + 40, 60) }]}>
        <ActivityIndicator size="large" color="#0B3C8A" />
        <Text style={[styles.loadingText, { fontFamily: fontFamilyBold }]}>
          {t.loading || "Loading Lottery..."}
        </Text>
      </View>
    );
  }

  // Render Unpaid State
  if (!hasPaid) {
    return (
      <View style={[styles.unpaidContainer, { paddingTop: Math.max(insets.top + 20, 40) }]}>
        <View style={styles.unpaidCard}>
          <MaterialCommunityIcons name="lock-alert-outline" size={54} color="#D97706" />
          <Text style={[styles.unpaidTitle, { fontFamily: fontFamilyBold }]}>
            {t.noPayment || "No payment is done"}
          </Text>
          <Text style={[styles.unpaidSubtitle, { fontFamily: fontFamilyRegular }]}>
            {t.mustPayFirst || "First you must pay for joined Equb to participate in the lottery draw."}
          </Text>
          <TouchableOpacity
            style={styles.payNowButton}
            onPress={() => router.push("/(tabs)/payment")}
            activeOpacity={0.85}
          >
            <Text style={[styles.payNowText, { fontFamily: fontFamilyBold }]}>
              {t.pay || "Fast Pay"}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollRoot}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Math.max(insets.top + 10, 20) }, // Status bar safe area padding
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: fontFamilyBold }]}>
            {currentEqub?.name || t.habeshaEqub || "Habesha Equb"}
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: fontFamilyRegular }]}>
            {t.drawDateTitle || "Weekly Sunday Draw"} • {t.sundayDrawTime || "Sunday 10:00 LT (4:00 PM)"}
          </Text>
        </View>
        <View style={styles.slotsBadge}>
          <Text style={[styles.slotsBadgeText, { fontFamily: fontFamilyBold }]}>
            {totalSlots} {t.members || "Members"}
          </Text>
        </View>
      </View>

      {/* COUNTDOWN TIMER CARD */}
      <View style={styles.timerCard}>
        <View style={styles.timerHeaderRow}>
          <MaterialCommunityIcons name="clock-fast" size={18} color="#F59E0B" />
          <Text style={[styles.timerTitle, { fontFamily: fontFamilyBold, marginLeft: 6 }]}>
            {t.nextSpinCountdown || "Next Sunday Draw Countdown"}
          </Text>
        </View>
        <View style={styles.timerGrid}>
          <View style={styles.timerBox}>
            <Text style={[styles.timerValue, { fontFamily: fontFamilyBold }]}>
              {String(timeLeft.days).padStart(2, "0")}
            </Text>
            <Text style={[styles.timerLabel, { fontFamily: fontFamilyRegular }]}>{t.days || "Days"}</Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}>
            <Text style={[styles.timerValue, { fontFamily: fontFamilyBold }]}>
              {String(timeLeft.hours).padStart(2, "0")}
            </Text>
            <Text style={[styles.timerLabel, { fontFamily: fontFamilyRegular }]}>{t.hours || "Hours"}</Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}>
            <Text style={[styles.timerValue, { fontFamily: fontFamilyBold }]}>
              {String(timeLeft.minutes).padStart(2, "0")}
            </Text>
            <Text style={[styles.timerLabel, { fontFamily: fontFamilyRegular }]}>{t.minutes || "Mins"}</Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}>
            <Text style={[styles.timerValue, { fontFamily: fontFamilyBold }]}>
              {String(timeLeft.seconds).padStart(2, "0")}
            </Text>
            <Text style={[styles.timerLabel, { fontFamily: fontFamilyRegular }]}>{t.seconds || "Secs"}</Text>
          </View>
        </View>
      </View>

      {/* LOTTERY WHEEL DISPLAY (MATCHES UPLOADED IMAGE 100%) */}
      <View style={styles.wheelWrapper}>
        <LotteryWheel
          size={wheelSize}
          totalSlots={totalSlots}
          rotationAnim={rotationAnim}
          isSpinning={isSpinning}
        />
      </View>

      {/* AUTOMATIC DRAW STATUS CARD */}
  {isSpinning && (
  <View style={styles.autoStatusCard}>
    <View style={styles.autoStatusRow}>
      <ActivityIndicator size="small" color="#0B3C8A" />

      <Text
        style={[
          styles.autoStatusText,
          {
            fontFamily: fontFamilyBold,
            marginLeft: 8,
            color: "#0B3C8A",
          },
        ]}
      >
        {t.spinning || "Sunday Automatic Draw in Progress..."}
      </Text>
    </View>
  </View>
)}

      {/* CURRENT WINNER DISPLAY CARD */}
      {winnerNumber && !isSpinning && (
        <View style={styles.winnerCard}>
          <MaterialCommunityIcons name="trophy-award" size={32} color="#D97706" />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={[styles.winnerCardTitle, { fontFamily: fontFamilyBold }]}>
              {t.currentWinner || "Current Sunday Winner"}
            </Text>
            <Text style={[styles.winnerCardValue, { fontFamily: fontFamilyBold }]}>
              {t.equbNumber || "Equb #"} {winnerNumber}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewWinnerBadge}
            onPress={() => setShowWinnerModal(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="eye" size={22} color="#0B3C8A" />
          </TouchableOpacity>
        </View>
      )}

      {/* WINNER ANNOUNCEMENT MODAL */}
      <Modal
        visible={showWinnerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWinnerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.trophyCircle}>
              <MaterialCommunityIcons name="trophy" size={54} color="#FFD700" />
            </View>
            <Text style={[styles.modalCongratulations, { fontFamily: fontFamilyBold }]}>
              {t.congratulations || "Congratulations!"}
            </Text>
            <Text style={[styles.modalSubtitle, { fontFamily: fontFamilyRegular }]}>
              {t.winnerNumber || "Official Sunday Draw Winner"}
            </Text>
            <View style={styles.numberDisplayBox}>
              <Text style={[styles.numberDisplayText, { fontFamily: fontFamilyBold }]}>
                #{winnerNumber}
              </Text>
            </View>
            <Text style={[styles.modalNote, { fontFamily: fontFamilyRegular }]}>
              {t.sundayDrawTime || "Sunday 10:00 LT Winner • Verified by Backend"}
            </Text>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowWinnerModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeModalText, { fontFamily: fontFamilyBold }]}>
                {t.ok || "OK"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    paddingBottom: 40,
  },
  unpaidContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  unpaidCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: 340,
    width: "100%",
  },
  unpaidTitle: {
    fontSize: 20,
    color: "#0F172A",
    marginTop: 14,
    textAlign: "center",
  },
  unpaidSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  payNowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B3C8A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
  },
  payNowText: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  // Header Card
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  slotsBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  slotsBadgeText: {
    color: "#1D4ED8",
    fontSize: 12,
  },

  // Timer Card
  timerCard: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  timerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timerTitle: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  timerGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timerBox: {
    alignItems: "center",
    minWidth: 54,
    backgroundColor: "#1E293B",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  timerValue: {
    color: "#F59E0B",
    fontSize: 22,
  },
  timerLabel: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },
  timerColon: {
    color: "#94A3B8",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 6,
  },

  // Wheel Container
  wheelWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },

  // Automatic Status Card
  autoStatusCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 14,
    width: "100%",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  autoStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  autoStatusText: {
    fontSize: 14,
  },
  autoStatusSubtext: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 4,
    lineHeight: 18,
  },

  // Saved Winner Card
  winnerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 18,
    padding: 16,
    width: "100%",
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  winnerCardTitle: {
    fontSize: 12,
    color: "#B45309",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  winnerCardValue: {
    fontSize: 20,
    color: "#78350F",
    marginTop: 2,
  },
  viewWinnerBadge: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    elevation: 10,
  },
  trophyCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  modalCongratulations: {
    fontSize: 22,
    color: "#0F172A",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  numberDisplayBox: {
    backgroundColor: "#0B3C8A",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 18,
    marginVertical: 16,
    shadowColor: "#0B3C8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  numberDisplayText: {
    color: "#FFD700",
    fontSize: 34,
  },
  modalNote: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 20,
    textAlign: "center",
  },
  closeModalButton: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 14,
    alignItems: "center",
  },
  closeModalText: {
    color: "#334155",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#0B3C8A",
    marginTop: 14,
    textAlign: "center",
  },
});