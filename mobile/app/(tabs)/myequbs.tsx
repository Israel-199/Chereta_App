import React, { useCallback, useState, useMemo, memo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  InteractionManager,
  Pressable,
  Modal,
} from "react-native";
import { useAuthStore } from "@/store/auth";
import { useJoinedEqubStore } from "@/store/joinedEqubStore";
import Navbar from "@/component/Navbar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { IOSLoader } from "@/component/ButtonLoadingEffect";
import { useJoinedEqubStyles } from "@/styles/joinedEqubStyles";
import SkeletonLoader from "@/component/SkeletonLoader";
import SkeletonJoinedEqubItem from "@/component/SkeletonJoinedEqubItem";
import { useRouter } from "expo-router";
import { formatAppDate, getNextSundayLotteryDate, formatProfessionalDate } from "@/utils/dateUtils";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";
import { typography } from "@/styles/typography";
import { useNotificationStore } from "@/store/notificationStore";

const ETHIOPIC_LANGUAGES = new Set(["አማርኛ", "ትግርኛ"]);
const isAmharic = (text: string) => /[\u1200-\u137F]/.test(text);

const EqubItem = memo(({ item, t, language, onPay, onLeaveRequest, onMembers, loadingEqubId, getTextStyle, styles }: any) => {
  const isNavigating = useRef(false);

  const handleAction = (callback: () => void) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    InteractionManager.runAfterInteractions(() => {
      callback();
      setTimeout(() => { isNavigating.current = false; }, 1000);
    });
  };

  let displayName = item.name;
  if (displayName.includes("Daily Equb")) {
    displayName = displayName.replace("Daily Equb", t.dailyEqub);
    if (/\d+/.test(displayName) && !displayName.includes("|")) {
      displayName = displayName.replace(/(\d+)/, "| $1");
    }
  } else if (displayName === "Daily Equb") {
    displayName = t.dailyEqub;
  }

  const titleStyle = isAmharic(displayName) ? typography.amharicBold : typography.englishBold;

  const getBadgeText = (type: string, trans: any) => {
    let mapped = type;
    switch (type) {
      case "DAILY": mapped = trans.dailyEqub; break;
      case "WEEKLY": mapped = trans.weeklyEqub; break;
      case "MONTHLY": mapped = trans.monthlyEqub; break;
      case "HOUSE": mapped = trans.houseEqub; break;
      case "VEHICLE": mapped = trans.vehicleEqub; break;
      case "PHONE": mapped = trans.phoneEqub; break;
      case "TV": mapped = trans.tvEqub || "TV Equb"; break;
      case "REFRIGERATOR": mapped = trans.refrigeratorEqub || "Refrigerator Equb"; break;
      case "SOFA": mapped = trans.sofaEqub || "Sofa Equb"; break;
    }
    if (!mapped) return type;
    return mapped.replace(/Equb|እቁብ/gi, "").trim();
  };

  const isDaily = item.type === "DAILY";
  const badgeText = getBadgeText(item.type, t);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={[styles.cardTitle, titleStyle, isDaily && { color: "#0B3C8A" }]}>{displayName}</Text>
          <View style={styles.amountRow}>
            <Ionicons name="cash-outline" size={14} color="#81CE06" />
            <Text style={[styles.amountText, getTextStyle(`${item.contributionAmount} ${t.currencyBirr}`, true)]}>
              {item.contributionAmount} {t.currencyBirr}
            </Text>
          </View>
        </View>
        <View style={styles.typeBadge}>
          <Text style={[styles.typeBadgeText, getTextStyle(badgeText, true), { textTransform: "uppercase" }]}>{badgeText}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={14} color="#000000" />
          <Text style={[styles.cardText, getTextStyle(`${item.numberOfMembers} ${t.members}`)]}>
            {item.numberOfMembers} {t.members}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#0B3C8A" />
          <Text style={[styles.cardText, getTextStyle(t.lotteryDrawn || "Lottery Drawn"), { color: "#0B3C8A", fontWeight: '600' }]}>
            {t.lottery || "Lottery"}: {formatProfessionalDate(getNextSundayLotteryDate(), language, t)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#000000" />
          <Text style={[styles.cardText, getTextStyle(formatAppDate(item.startDate, language, t))]}>
            {formatAppDate(item.startDate, language, t)} → {formatAppDate(item.endDate, language, t)}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <View style={styles.topActionsRow}>
          <Pressable
            onPress={() => onLeaveRequest(item.id)}
            disabled={loadingEqubId === item.id || isNavigating.current}
            android_ripple={{ color: 'rgba(220,38,38,0.1)' }}
            style={({ pressed }) => [
              styles.removeBtn, 
              (loadingEqubId === item.id || isNavigating.current) && styles.disabledBtn,
              pressed && { opacity: 0.8 }
            ]}
          >
            {loadingEqubId === item.id ? (
              <IOSLoader size={16} color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons name="trash-outline" size={14} color="#DC2626" />
                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.btnText, getTextStyle(t.remove, true), { color: "#DC2626" }]}>
                  {t.remove}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            onPress={() => handleAction(() => onMembers(item.id))} 
            disabled={isNavigating.current}
            android_ripple={{ color: 'rgba(11,60,138,0.1)' }}
            style={({ pressed }) => [
              styles.membersBtn,
              (pressed || isNavigating.current) && { opacity: 0.8 }
            ]}
          >
            <View style={styles.btnContent}>
              <Ionicons name="card-outline" size={14} color="#0B3C8A" />
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.btnText, getTextStyle(t.pay || "Fast Pay", true), { color: "#0B3C8A" }]}>
                {t.pay || "Fast Pay"}
              </Text>
            </View>
          </Pressable>
        </View>
        <Pressable 
          onPress={() => handleAction(() => onPay(item.id))} 
          disabled={isNavigating.current}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [
            styles.payBtn,
            (pressed || isNavigating.current) && { opacity: 0.9 }
          ]}
        >
          <View style={styles.btnContent}>
            <Ionicons name="list-outline" size={14} color="#fff" />
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.btnText, getTextStyle(t.viewDetails || "View Details", true), { color: "#fff" }]}>
              {t.viewDetails || "View Details"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
});

export default function JoinedEqubPage() {
  const styles = useJoinedEqubStyles();
  const { language, preloadData } = useAuthStore();
  const { joinedEqubs, loadJoinedEqubs, leaveEqub, fetching, hasLoaded } = useJoinedEqubStore();
  const navigation = useNavigation();
  const router = useRouter();
  const mounted = React.useRef(true);

  React.useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const [loadingEqubId, setLoadingEqubId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; equbId: string | null }>({ visible: false, equbId: null });

  const getFontFamily = useCallback((text: string, bold = false) => {
    if (isAmharic(text)) return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
    return bold ? "NotoSans-Bold" : "NotoSans-Regular";
  }, []);

  const t = useMemo(() => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  }, [language]);

  const getTextStyle = useCallback((text: string, bold = false) => ({ fontFamily: getFontFamily(text, bold) }), [getFontFamily]);

  const checkLotteryNotifications = useCallback(() => {
    const nextSunday = getNextSundayLotteryDate();
    const now = new Date();
    const diffMs = nextSunday.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMins = diffMs / (1000 * 60);

    const notificationStore = useNotificationStore.getState();
    const existing = notificationStore.notifications;
    const sundayKey = nextSunday.toDateString();

    if (diffHours <= 24 && diffHours > 23 ) {
      const id = `lottery-1day-${sundayKey}`;
      if (!existing.find(n => n.trackInfo === id)) {
        notificationStore.addNotification({
          title: t.lottery || "Lottery",
          message: language === "አማርኛ" ? "የእጣ ማውጫ ቀን 1 ቀን ቀርቷል" : "1 day left for lottery release",
          type: "info",
          trackInfo: id
        });
      }
    }

    if (diffMins <= 35 && diffMins > 25 ) {
      const id = `lottery-30min-${sundayKey}`;
      if (!existing.find(n => n.trackInfo === id)) {
        notificationStore.addNotification({
          title: t.lottery || "Lottery",
          message: language === "አማርኛ" ? "የእጣ ማውጫ ቀን 30 ደቂቃ ቀርቷል" : "30 minutes left for lottery release",
          type: "info",
          trackInfo: id
        });
      }
    }
  }, [language, t]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoaded) InteractionManager.runAfterInteractions(() => loadJoinedEqubs());
      checkLotteryNotifications();
    }, [hasLoaded, loadJoinedEqubs, checkLotteryNotifications])
  );

  const handleLeave = useCallback(async (equbId: string) => {
    setLoadingEqubId(equbId);
    try {
      const equbsList = useJoinedEqubStore.getState().joinedEqubs;
      const equb = equbsList.find((e: any) => e.id === equbId);
      const equbName = equb?.name || "Equb";

      await leaveEqub(equbId);
      await preloadData();
      const username = useAuthStore.getState().profile?.firstName || "User";
      const notificationMsg = (t as any).notificationLeave
        ? (t as any).notificationLeave.replace("{username}", username).replace("{equbname}", equbName)
        : `Dear ${username}, You have left ${equbName}.`;
      useNotificationStore.getState().addNotification({
        title: (t as any).notifications || "Notifications",
        message: notificationMsg,
        trackInfo: equbId,
        type: "leave"
      });

      Toast.show({ type: "success", text1: t.success, text2: t.toastRemoveSuccess });
    } catch (err: any) {
      Toast.show({ type: "error", text1: t.failed, text2: err.message || t.toastRemoveError });
    } finally {
      if (mounted.current) {
        setTimeout(() => {
          setLoadingEqubId(null);
          setConfirmModal({ visible: false, equbId: null });
        }, 150);
      }
    }
  }, [leaveEqub, preloadData, t]);

  const handleMembers = useCallback((equbId: string) => {
    InteractionManager.runAfterInteractions(() => router.push("/(tabs)/payment" as any));
  }, [router]);

  const handlePay = useCallback((equbId: string) => {
    InteractionManager.runAfterInteractions(() => router.push({ pathname: "/screen/myEqubTabScreen/equbDetails", params: { equbId } } as any));
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJoinedEqubs();
    setRefreshing(false);
  }, [loadJoinedEqubs]);

  const sections = useMemo(() => [
    { title: t.dailyEqub, data: joinedEqubs.filter((e: any) => e.type === "DAILY") },
    { title: t.weeklyEqub, data: joinedEqubs.filter((e: any) => e.type === "WEEKLY") },
    { title: t.monthlyEqub, data: joinedEqubs.filter((e: any) => e.type === "MONTHLY") },
    { title: t.houseEqub, data: joinedEqubs.filter((e: any) => e.type === "HOUSE") },
    { title: t.vehicleEqub, data: joinedEqubs.filter((e: any) => e.type === "VEHICLE") },
    { title: t.phoneEqub, data: joinedEqubs.filter((e: any) => e.type === "PHONE") },
    { title: (t as any).tvEqub || "TV Equb", data: joinedEqubs.filter((e: any) => e.type === "TV") },
    { title: (t as any).refrigeratorEqub || "Refrigerator Equb", data: joinedEqubs.filter((e: any) => e.type === "REFRIGERATOR") },
    { title: (t as any).sofaEqub || "Sofa Equb", data: joinedEqubs.filter((e: any) => e.type === "SOFA") },
  ].filter((s) => s.data.length > 0), [joinedEqubs, t]);

  const renderItem = useCallback(({ item }: any) => (
    <EqubItem item={item} t={t} language={language} onPay={handlePay} onLeaveRequest={(id: string) => setConfirmModal({ visible: true, equbId: id })} onMembers={handleMembers} loadingEqubId={loadingEqubId} getTextStyle={getTextStyle} styles={styles} />
  ), [t, language, handlePay, handleMembers, loadingEqubId, getTextStyle, styles]);

  return (
    <View style={{ flex: 1, backgroundColor: "#EFF1F5" }}>
      <Navbar
        title={t.myEqubsTab || "My Equbs"}
        secondIcon={<TouchableOpacity onPress={handleRefresh} disabled={refreshing || fetching} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><MaterialCommunityIcons name="refresh" size={24} color={(refreshing || fetching) ? "#ccc" : "#fff"} /></TouchableOpacity>}
      />

      <View style={{ flex: 1 }}>
      {fetching ? (
        <View style={styles.container}>{[...Array(2)].map((_, idx) => (
          <View key={idx} style={{ marginBottom: 24 }}>
            <SkeletonLoader width={100} height={18} style={{ marginBottom: 12, borderRadius: 8 }} />
            <SkeletonJoinedEqubItem /><SkeletonJoinedEqubItem />
          </View>
        ))}</View>
      ) : (
        <SectionList
          style={styles.container}
          contentContainerStyle={styles.listContent}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          removeClippedSubviews={true}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, getTextStyle(section.title, true)]}>{section.title}</Text>
              <View style={styles.sectionCount}><Text style={[styles.sectionCountText, getTextStyle(section.data.length.toString(), true)]}>{section.data.length}</Text></View>
            </View>
          )}
          ListEmptyComponent={<View style={styles.emptyBox}><Ionicons name="file-tray-outline" size={56} color="#C4CCD4" /><Text style={[styles.emptyTitle, getTextStyle(t.notJoined, true)]}>{t.notJoined}</Text></View>}
          stickySectionHeadersEnabled={false}
        />
      )}
      </View>

      <Modal 
        visible={confirmModal.visible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setConfirmModal({ visible: false, equbId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}><Ionicons name="warning-outline" size={28} color="#DC2626" /></View>
            <Text style={[styles.modalTitle, getTextStyle(t.confirmRemove, true)]}>{t.confirmRemove}</Text>
            <Text style={[styles.modalSubtext, getTextStyle((t as any).removeMessage)]}>{(t as any).removeMessage || "This action cannot be undone. You will lose your spot in this Equb cycle."}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModal({ visible: false, equbId: null })}><Text style={[styles.cancelBtnText, getTextStyle(t.cancel)]}>{t.cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmRemoveBtn} disabled={loadingEqubId === confirmModal.equbId} onPress={() => { if (confirmModal.equbId) handleLeave(confirmModal.equbId); }}>
                {loadingEqubId === confirmModal.equbId ? <IOSLoader size={16} color="#fff" /> : <Text style={[styles.confirmRemoveBtnText, getTextStyle(t.remove, true)]}>{t.remove}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
