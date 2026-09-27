import { Text, View, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import Navbar from "../../component/Navbar";
import ImmersiveNavScreen from "../../component/ImmersiveNavScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { resolveAuctionImage } from "../../utils/auctionMedia";
import { StatusBar } from "expo-status-bar";
import { useLocalizedTypography } from "../../utils/useLocalizedTypography";
import { useCheretaStore } from "../../store/cheretaStore";
import { useCheretaCache } from "../../store/cheretaCache";
import { LEMON_GREEN } from "../../constants/theme";
import { formatAuctionCodeDisplay } from "../../utils/formatAuctionCode";

export default function MyCheretaScreen() {
  const language = useAuthStore((state) => state.language);
  const token = useAuthStore((state) => state.token);
  const t = useMemo(() => translations[language] ?? translations.English ?? {}, [language]);
  const { bold, regular } = useLocalizedTypography(language);
  const myBidsVersion = useCheretaStore((s) => s.myBidsVersion);
  const cachedBids = useCheretaCache((s) => s.myBids);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [bids, setBids] = useState<any[]>(cachedBids);

  const load = useCallback(async () => {
    const data = await useCheretaCache.getState().refreshMyBids(token);
    setBids(data);
  }, [token]);

  useEffect(() => {
    if (cachedBids.length) setBids(cachedBids);
  }, [cachedBids]);

  useEffect(() => {
    load();
  }, [load, myBidsVersion]);

  useFocusEffect(
    useCallback(() => {
      load();
      const poll = setInterval(load, 8000);
      return () => clearInterval(poll);
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, { auction: any; bids: any[] }>();
    for (const b of bids) {
      const a = b.auctionItem;
      if (!a) continue;
      if (!map.has(a.id)) map.set(a.id, { auction: a, bids: [] });
      map.get(a.id)!.bids.push(b);
    }
    return Array.from(map.values());
  }, [bids]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      {/* @ts-ignore */}
      <StatusBar style="light" backgroundColor={LEMON_GREEN} />
      <ImmersiveNavScreen
        navbar={
          <Navbar
            leftIcon={<MaterialCommunityIcons name="gavel" size={22} color="#fff" />}
            title={t.myChereta || "My Chereta"}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        scrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LEMON_GREEN} />,
        }}
      >
        {!token ? (
          <Text style={[regular, { marginTop: 40, color: "#666", textAlign: "center" }]}>{t.signInForBids}</Text>
        ) : grouped.length === 0 ? (
          <Text style={[regular, { marginTop: 40, color: "#666", textAlign: "center" }]}>{t.noBidsYet}</Text>
        ) : (
          grouped.map(({ auction, bids: userBids }) => (
            <TouchableOpacity
              key={auction.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/screen/auction_results?id=${auction.id}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                <Image
                  source={resolveAuctionImage(auction.images?.[0])}
                  style={{ width: 68, height: 68, borderRadius: 16, backgroundColor: "#F9FAFB" }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[bold, { fontSize: 17, color: "#111827", marginBottom: 4 }]} numberOfLines={2}>
                    {auction.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <View style={{ backgroundColor: "#F0FDF4", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={[bold, { color: "#166534", fontSize: 11 }]}>{auction.categoryLabel || auction.category}</Text>
                    </View>
                    <Text style={[regular, { color: "#6B7280", fontSize: 12, marginLeft: 8 }]}>
                      {formatAuctionCodeDisplay(auction.auctionCode)}
                    </Text>
                  </View>
                  <Text style={[bold, { color: "#3D5D96", fontSize: 13 }]}>
                    {userBids.length} {t.bidsPlaced || "bids placed"}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" style={{ alignSelf: "center" }} />
              </View>

              <View style={{ backgroundColor: "#F9FAFB", borderRadius: 16, padding: 14 }}>
                <Text style={[bold, { color: "#4B5563", fontSize: 12, marginBottom: 10 }]}>RECENT BIDS (MAX 5)</Text>
                
                <View style={{ paddingLeft: 6 }}>
                  {userBids.slice(0, 5).map((b, idx, arr) => (
                    <View key={b.id} style={{ flexDirection: "row", alignItems: "flex-start", position: "relative" }}>
                      {/* Timeline Line */}
                      {idx !== arr.length - 1 && (
                        <View style={{ position: "absolute", left: 3, top: 18, bottom: -12, width: 2, backgroundColor: "#E5E7EB" }} />
                      )}
                      {/* Dot */}
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: LEMON_GREEN, marginTop: 5, marginRight: 12 }} />
                      
                      <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text style={[regular, { color: "#6B7280", fontSize: 13 }]}>
                          {new Date(b.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </Text>
                        <Text style={[bold, { color: "#1F2937", fontSize: 14 }]}>
                          {b.amount.toFixed(2)} ETB
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
