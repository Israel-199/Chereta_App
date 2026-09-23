import React, { useCallback, useMemo, useState, memo, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Modal, InteractionManager, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useWeeklyEqubStore } from "@/store/weeklyEqubStore";
import SkeletonEqubItem from "@/component/SkeletonEqubItem";
import LoadingDots from "@/component/LoadingDots";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";
import Navbar from "@/component/Navbar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { formatAppDate } from "@/utils/dateUtils";
import SuspendedScreen from "@/component/SuspendedScreen";

const EqubItem = memo(({ item, t, language, onJoin, loadingEqubId, getFontFamily }: any) => {
  const isJoining = loadingEqubId === item.id;
  const router = useRouter();
  const isNavigating = useRef(false);

  const handlePayPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    InteractionManager.runAfterInteractions(() => {
      router.push("/(tabs)/payment" as any);
      setTimeout(() => { isNavigating.current = false; }, 1000);
    });
  };

  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: "5%",
      marginBottom: 12,
    }}>
      <Text style={{ fontFamily: getFontFamily(true), fontSize: 16, color: "#000080", marginBottom: 20 }}>
        {item.name} |{" "}
        <Text style={{ color: "#81CE06" }}>
          {item.contributionAmount.toLocaleString()} {t.currencyBirr}
        </Text>
      </Text>

      <View style={{ flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.equbMembers}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{item.numberOfMembers} {t.members}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.startDate}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{formatAppDate(item.startDate, language, t)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.endDate}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{formatAppDate(item.endDate, language, t)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.total}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{item.total} {t.currencyBirr}</Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: "#E8ECF0", marginTop: 8, marginBottom: 18, width: "100%" }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={handlePayPress}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => ({
            backgroundColor: "#0B3C8A",
            height: 48,
            paddingHorizontal: "6%",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            maxWidth: "45%",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: "#fff", textAlign: "center", fontFamily: getFontFamily(true), fontSize: 13 }}>
            {t.pay}
          </Text>
        </Pressable>

        <Pressable
          disabled={item.isMember || isJoining}
          onPress={() => onJoin(item.id)}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => ({
            backgroundColor: item.isMember ? "#ccc" : "#81CE06",
            height: 48,
            paddingHorizontal: "6%",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            maxWidth: "45%",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: "#fff", textAlign: "center", fontFamily: getFontFamily(true), fontSize: 13, flexShrink: 1 }}>
            {item.isMember ? t.joined : t.joinEqub}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function WeeklyEqubList() {
  const insets = useSafeAreaInsets();
  const language = useAuthStore((state) => state.language);
  const profile = useAuthStore((state) => state.profile);
  const equbs = useWeeklyEqubStore((state) => state.equbs);
  const fetching = useWeeklyEqubStore((state) => state.fetching);
  const loadWeeklyEqubs = useWeeklyEqubStore((state) => state.loadWeeklyEqubs);
  const router = useRouter();
  const [loadingEqubId, setLoadingEqubId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (equbs.length === 0) InteractionManager.runAfterInteractions(() => loadWeeklyEqubs());
    }, [equbs.length, loadWeeklyEqubs])
  );

  const t = useMemo(() => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  }, [language]);

  const getFontFamily = useCallback((bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular"
      : bold ? "NotoSans-Bold" : "NotoSans-Regular",
    [language]
  );

  const handleJoin = useCallback((equbId: string) => {
    setLoadingEqubId(equbId);
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        router.push({ pathname: "/screen/termsOfService", params: { equbId, type: "weekly" } });
        setLoadingEqubId(null);
      });
    }, 400);
  }, [router]);

  const renderSkeleton = useCallback((_: any, idx: number) => <SkeletonEqubItem key={idx} />, []);
  const renderItem = useCallback(({ item }: any) => (
    <EqubItem item={item} t={t} language={language} onJoin={handleJoin} loadingEqubId={loadingEqubId} getFontFamily={getFontFamily} />
  ), [t, language, handleJoin, loadingEqubId, getFontFamily]);

  const navBackIcon = useMemo(() => (
    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
  ), [router]);

  const refreshIcon = useMemo(() => (
    <TouchableOpacity onPress={loadWeeklyEqubs} disabled={fetching} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <MaterialCommunityIcons name="refresh" size={22} color={fetching ? "#ccc" : "#fff"} />
    </TouchableOpacity>
  ), [fetching, loadWeeklyEqubs]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <Navbar leftIcon={navBackIcon} title={t.weeklyEqub} secondIcon={refreshIcon} />
      {profile?.status === "SUSPENDED" ? (
        <SuspendedScreen />
      ) : fetching ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, width: "100%", maxWidth: 600, alignSelf: "center" }}>
          {[...Array(3)].map(renderSkeleton)}
        </ScrollView>
      ) : equbs.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 16, color: "#8E99A4" }}>{t.noEqubs}</Text>
        </View>
      ) : (
        <FlatList
          data={equbs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom, width: "100%", maxWidth: 600, alignSelf: "center" }}
          getItemLayout={(_, index) => (
            { length: 240, offset: 240 * index, index }
          )}
        />
      )}
      <Modal transparent visible={loadingEqubId !== null} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" }}>
          <LoadingDots />
        </View>
      </Modal>
    </View>
  );
}
