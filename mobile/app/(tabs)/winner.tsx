import { Text, View, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
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
import { LEMON_GREEN } from "../../constants/theme";

function maskPhone(phone?: string | null) {
  if (!phone || phone.length < 6) return "—";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

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
      const interval = setInterval(fetchData, 15000);
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
        <Text style={[regular, { color: "#6B7280", marginBottom: 12, textAlign: "center" }]}>
          {winners.length} {t.winners || "winners"}
        </Text>

        {winners.length === 0 ? (
          <Text style={[regular, { textAlign: "center", color: "#666", marginTop: 40 }]}>{t.noWinnersYet}</Text>
        ) : (
          winners.map((item, index) => (
            <View
              key={item.auction.id || index}
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
                overflow: "hidden",
              }}
            >
              <View style={{ position: "relative", backgroundColor: "#F9FAFB" }}>
                <Image
                  source={resolveAuctionImage(item.auction.images?.[0])}
                  style={{ height: 210, width: "100%" }}
                  contentFit="cover"
                />
                <View style={{ position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: 20, padding: 8, flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome5 name="trophy" size={14} color="#F59E0B" />
                </View>
                <View style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(255, 255, 255, 0.95)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
                  <Text style={[bold, { fontSize: 11, color: "#3D5D96" }]}>
                    {t.auctionCode} {item.auction.auctionCode}
                  </Text>
                </View>
              </View>

              <View style={{ padding: 18 }}>
                <Text style={[bold, { fontSize: 19, color: "#111827", textAlign: "center", marginBottom: 14 }]} numberOfLines={2}>
                  {item.auction.title}
                </Text>

                {item.winner && (
                  <View style={{ backgroundColor: "#F0FDF4", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#DCFCE7" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                      <FontAwesome5 name="crown" size={18} color="#F59E0B" />
                      <Text style={[bold, { marginLeft: 10, color: "#166534", fontSize: 17 }]}>{item.winner.name}</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 }}>
                      <Text style={[bold, { color: LEMON_GREEN, fontSize: 16 }]}>
                        {item.winner.amount.toFixed(2)} ETB
                      </Text>
                      <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: "#86EFAC" }} />
                      <Text style={[bold, { color: "#166534", fontSize: 14 }]}>
                        {maskPhone(item.winner.phone)}
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={{ marginTop: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                  onPress={() => router.push(`/screen/auction_results?id=${item.auction.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={[bold, { color: "#3D5D96", fontSize: 15 }]}>{t.viewResults || "View Results"}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#3D5D96" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
