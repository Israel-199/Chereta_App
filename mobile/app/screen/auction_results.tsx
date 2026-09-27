import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Navbar from "../../component/Navbar";
import ImmersiveNavScreen from "../../component/ImmersiveNavScreen";
import CheretaResultsTable, { ResultsTableRow } from "../../component/CheretaResultsTable";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import { useLocalizedTypography } from "../../utils/useLocalizedTypography";
import { fetchAuctionResults } from "../../api/chereta";
import ConfettiBurst from "../../component/ConfettiBurst";
import {
  LEMON_GREEN,
  LEMON_GREEN_DARK,
  SCREEN_BG,
  NAV_HEADER_GREEN,
  CH_VIEW_MORE_BLUE,
} from "../../constants/theme";
import { StatusBar } from "expo-status-bar";
import { formatAuctionCodeDisplay } from "../../utils/formatAuctionCode";

export default function AuctionResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const language = useAuthStore((s) => s.language);
  const t = useMemo(() => translations[language] ?? translations.English ?? {}, [language]);
  const { bold, regular } = useLocalizedTypography(language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetchAuctionResults(String(id));
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const rows: ResultsTableRow[] = useMemo(() => {
    if (!data) return [];
    const list: ResultsTableRow[] = [];
    if (data.winner) {
      list.push({
        ...data.winner,
        auctionCode: formatAuctionCodeDisplay(data.winner.auctionCode),
        kind: "winner",
      });
    }
    for (const d of data.duplicateLosers ?? []) {
      list.push({
        ...d,
        auctionCode: formatAuctionCodeDisplay(d.auctionCode),
        kind: "duplicate",
      });
    }
    return list;
  }, [data]);

  const statusMeta = useMemo(() => {
    if (!data) return { subtitle: "", icon: "party-popper" as const, badge: "", badgeBg: LEMON_GREEN };
    if (data.viewerStatus === "WON") {
      return {
        subtitle: t.resultsCongratsWinner || "You won this auction!",
        icon: "trophy" as const,
        badge: t.resultsWinnerBadge || "Winner",
        badgeBg: LEMON_GREEN_DARK,
      };
    }
    if (data.viewerStatus === "LOST_DUPLICATE") {
      return {
        subtitle: t.resultsDuplicateBid || "Duplicate bid — not unique",
        icon: "alert-circle-outline" as const,
        badge: t.resultsDuplicateBadge || "Duplicate",
        badgeBg: "#DC2626",
      };
    }
    if (data.viewerStatus === "LOST") {
      return {
        subtitle: t.resultsNotWinner || "Thank you for bidding",
        icon: "account-heart-outline" as const,
        badge: t.resultsParticipantBadge || "Participant",
        badgeBg: CH_VIEW_MORE_BLUE,
      };
    }
    return {
      subtitle: data.auction?.title || "",
      icon: "party-popper" as const,
      badge: t.auctionEnded || "Ended",
      badgeBg: "#6B7280",
    };
  }, [data, t]);

  const tableLabels = useMemo(
    () => ({
      phone: t.phoneNumber || "Phone",
      category: t.resultsCategory || "Category",
      bid: t.bidsLabel || "Bid",
      code: t.auctionCode || "Code",
      empty: t.noResultsYet || "No bids recorded yet.",
      swipeHint: t.resultsSwipeHint || "Swipe",
      winnerLegend: t.resultsWinnerLegend || "Unique winner",
      duplicateLegend: t.resultsDuplicateLegend || "Duplicate bids",
      tableTitle: t.resultsTableTitle || "Bid breakdown",
    }),
    [t],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: SCREEN_BG }}>
        <ActivityIndicator color={LEMON_GREEN} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <ConfettiBurst active />
      {/* @ts-ignore */}
      <StatusBar style="light" backgroundColor={NAV_HEADER_GREEN} />
      <ImmersiveNavScreen
        navbar={
          <Navbar
            leftIcon={<MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />}
            onLeftPress={() => router.back()}
            title={t.viewResults || "Results"}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
      >
        <View
          style={{
            marginTop: 8,
            marginBottom: 20,
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 22,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            shadowColor: LEMON_GREEN,
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#ECFCCB",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <MaterialCommunityIcons name={statusMeta.icon} size={36} color={LEMON_GREEN_DARK} />
          </View>
          <View
            style={{
              backgroundColor: statusMeta.badgeBg,
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 999,
              marginBottom: 12,
            }}
          >
            <Text style={[bold, { color: "#fff", fontSize: 12, letterSpacing: 0.6 }]}>
              {statusMeta.badge.toUpperCase()}
            </Text>
          </View>
          <Text style={[bold, { fontSize: 28, textAlign: "center", color: LEMON_GREEN_DARK, lineHeight: 34 }]}>
            {t.resultsCelebrationTitle || "Congratulations!"}
          </Text>
          <Text style={[regular, { fontSize: 15, textAlign: "center", color: "#6B7280", marginTop: 10, lineHeight: 22 }]}>
            {statusMeta.subtitle}
          </Text>
          {data?.auction?.title ? (
            <Text style={[bold, { fontSize: 14, color: CH_VIEW_MORE_BLUE, marginTop: 12, textAlign: "center" }]}>
              {data.auction.title}
            </Text>
          ) : null}
        </View>

        <CheretaResultsTable rows={rows} labels={tableLabels} bold={bold} regular={regular} />
      </ImmersiveNavScreen>
    </View>
  );
}
