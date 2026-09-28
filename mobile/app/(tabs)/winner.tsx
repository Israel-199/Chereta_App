import { Text, View, RefreshControl, TouchableOpacity } from "react-native";
import Navbar from "../../component/Navbar";
import ImmersiveNavScreen from "../../component/ImmersiveNavScreen";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import { useLocalizedTypography } from "../../utils/useLocalizedTypography";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { resolveAuctionImage } from "../../utils/auctionMedia";
import { StatusBar } from "expo-status-bar";
import { useCheretaCache } from "../../store/cheretaCache";
import { LEMON_GREEN, LEMON_GREEN_DARK, CH_VIEW_MORE_BLUE } from "../../constants/theme";
import { formatAuctionShortDescription } from "../../utils/auctionDescription";

export default function WinnerScreen() {
  const language = useAuthStore((state) => state.language);
  const t = useMemo(() => translations[language] ?? translations.English ?? {}, [language]);
  const { bold, regular } = useLocalizedTypography(language);
  const cachedWinners = useCheretaCache((s) => s.winners);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [winners, setWinners] = useState<any[]>(cachedWinners);

  const fetchData = useCallback(async () => {
    const list = await useCheretaCache.getState().refreshWinners();
    setWinners(list);
  }, []);

  useEffect(() => {
    if (cachedWinners.length) setWinners(cachedWinners);
  }, [cachedWinners]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const interval = setInterval(fetchData, 8000);
      return () => clearInterval(interval);
    }, [fetchData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      {/* @ts-ignore */}
      <StatusBar style="light" backgroundColor={LEMON_GREEN} />
      <ImmersiveNavScreen
        navbar={
          <Navbar
            leftIcon={<MaterialCommunityIcons name="trophy" size={22} color="#fff" />}
            title={t.winners || "Winners Gallery"}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        scrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LEMON_GREEN} />,
        }}
      >
        {winners.length === 0 ? (
          <Text style={[regular, { textAlign: "center", color: "#666", marginTop: 40 }]}>{t.noWinnersYet}</Text>
        ) : (
          winners.map((item, index) => {
            const auction = item.auction;
            const winAmount = item.winner?.amount ?? auction?.winningAmount;
            const hasWinner = winAmount != null && item.winner;
            const description = formatAuctionShortDescription(auction?.specs, auction?.categoryLabel);

            return (
              <View
                key={auction?.id || index}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  marginBottom: 22,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <Image
                  source={resolveAuctionImage(auction?.images?.[0])}
                  style={{ width: "100%", height: 220 }}
                  contentFit="cover"
                />

                <View style={{ padding: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#ECFCCB",
                      borderRadius: 999,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                      <FontAwesome5 name="trophy" size={16} color="#CA8A04" />
                      <Text style={[bold, { marginLeft: 8, color: LEMON_GREEN_DARK, fontSize: 16 }]}>
                        {hasWinner ? t.winnerLabel || "Winner" : t.noWinnerLabel || "No winner"}
                      </Text>
                    </View>
                    {hasWinner ? (
                      <View
                        style={{
                          backgroundColor: LEMON_GREEN_DARK,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 999,
                        }}
                      >
                        <Text style={[bold, { color: "#fff", fontSize: 12 }]}>
                          {t.wonFor || "Won for"} {Number(winAmount).toFixed(2)} ETB
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {description ? (
                    <Text style={[regular, { color: "#6B7280", fontSize: 14, lineHeight: 21, marginBottom: 10 }]}>
                      {description}
                    </Text>
                  ) : null}

                  <Text style={[bold, { fontSize: 18, color: "#111827", marginBottom: 16, lineHeight: 24 }]}>
                    {auction?.title}
                  </Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: CH_VIEW_MORE_BLUE,
                      paddingVertical: 14,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => router.push(`/screen/auction_results?id=${auction?.id}`)}
                    activeOpacity={0.88}
                  >
                    <Text style={[bold, { color: "#fff", fontSize: 16 }]}>
                      {t.viewAuction || "View Auction"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
