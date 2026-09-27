import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Navbar from "../../component/Navbar";
import ImmersiveNavScreen from "../../component/ImmersiveNavScreen";
import Toast from "react-native-toast-message";
import { fetchAuctionById, AuctionItem } from "../../api/chereta";
import { resolveAuctionImages } from "../../utils/auctionMedia";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";
import { LEMON_GREEN, LEMON_GREEN_DARK, SCREEN_BG } from "../../constants/theme";
import { applyAndroidSystemNavigationBar } from "../../utils/androidSystemBar";
import { useLocalizedTypography } from "../../utils/useLocalizedTypography";
import { formatAuctionCodeDisplay } from "../../utils/formatAuctionCode";

const { width: SCREEN_W } = Dimensions.get("window");

export default function AuctionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const language = useAuthStore((state) => state.language);
  const t = useMemo(() => translations[language] ?? translations.English ?? {}, [language]);
  const { bold, regular } = useLocalizedTypography(language);

  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchAuctionById(String(id));
      setAuction(data);
    } catch {
      Toast.show({ type: "error", text1: t.failed || "Failed" });
    } finally {
      setLoading(false);
    }
  }, [id, t.failed]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      applyAndroidSystemNavigationBar();
    }, []),
  );

  const images = useMemo(() => resolveAuctionImages(auction?.images), [auction?.images]);
  const specs = (auction?.specs || {}) as Record<string, string>;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: SCREEN_BG }}>
        <ActivityIndicator color={LEMON_GREEN} size="large" />
      </View>
    );
  }

  if (!auction) {
    return (
      <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
        <Navbar
          leftIcon={<MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />}
          onLeftPress={() => router.back()}
          title={t.auctionDetails || "Auction Details"}
        />
        <Text style={[regular, { textAlign: "center", marginTop: 40, color: "#666" }]}>{t.equbNotFound}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      {Platform.OS === "android" && <NavigationBar style="dark" hidden={false} />}
      {/* @ts-ignore */}
      <StatusBar style="light" backgroundColor={LEMON_GREEN} translucent={Platform.OS === "android"} />
      <ImmersiveNavScreen
        navbar={
          <Navbar
            leftIcon={<MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />}
            onLeftPress={() => router.back()}
            title={t.auctionDetails || "Auction Details"}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View
          style={{
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View
            style={{
              height: 290,
              backgroundColor: "#F8FAFC",
              justifyContent: "center",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Image
              source={images[selectedIndex]}
              style={{ width: SCREEN_W - 80, height: 250 }}
              contentFit="contain"
              transition={200}
            />
            <View
              style={{
                position: "absolute",
                bottom: 14,
                right: 14,
                backgroundColor: LEMON_GREEN,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 14,
              }}
            >
              <Text style={[bold, { color: "#fff", fontSize: 12 }]}>
                {selectedIndex + 1} / {images.length}
              </Text>
            </View>
          </View>

          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 14, gap: 10 }}>
              {images.map((img, idx) => (
                <TouchableOpacity key={idx} onPress={() => setSelectedIndex(idx)} activeOpacity={0.85}>
                  <Image
                    source={img}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: selectedIndex === idx ? LEMON_GREEN : "#E5E7EB",
                      backgroundColor: "#F9FAFB",
                    }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View
          style={{
            marginTop: 16,
            backgroundColor: "#fff",
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text style={[bold, { fontSize: 22, color: "#111827", textAlign: "center" }]}>{auction.title}</Text>
          <Text style={[regular, { color: "#6B7280", marginTop: 8, textAlign: "center", fontSize: 13 }]}>
            {t.auctionCode}: {formatAuctionCodeDisplay(auction.auctionCode)}
            {auction.itemNumber ? ` · #${auction.itemNumber}` : ""}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 18, gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: "#ECFCCB", borderRadius: 14, padding: 12, alignItems: "center" }}>
              <MaterialCommunityIcons name="gavel" size={22} color={LEMON_GREEN_DARK} />
              <Text style={[regular, { color: "#6B7280", fontSize: 11, marginTop: 4 }]}>{t.bidServiceFee}</Text>
              <Text style={[bold, { color: "#111827", marginTop: 2 }]}>{(auction.serviceFee ?? 75).toFixed(2)} Br</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#F0FDF4", borderRadius: 14, padding: 12, alignItems: "center" }}>
              <MaterialCommunityIcons name="counter" size={22} color="#22C55E" />
              <Text style={[regular, { color: "#6B7280", fontSize: 11, marginTop: 4 }]}>{t.bidsLabel}</Text>
              <Text style={[bold, { color: "#111827", marginTop: 2 }]}>{auction.bidCount ?? 0}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#FFFBEB", borderRadius: 14, padding: 12, alignItems: "center" }}>
              <MaterialCommunityIcons name="eye" size={22} color={LEMON_GREEN} />
              <Text style={[regular, { color: "#6B7280", fontSize: 11, marginTop: 4 }]}>{t.termsAgreedViews}</Text>
              <Text style={[bold, { color: "#111827", marginTop: 2 }]}>{auction.termsAcceptedCount ?? 0}</Text>
            </View>
          </View>

          {Object.keys(specs).length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={[bold, { fontSize: 16, color: "#111827", marginBottom: 10 }]}>{t.productSpecifications}</Text>
              <View style={{ backgroundColor: "#F9FAFB", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E5E7EB" }}>
                {Object.entries(specs).map(([key, value]) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: "#E5E7EB",
                    }}
                  >
                    <Text style={[regular, { color: "#6B7280", textTransform: "capitalize", flex: 1 }]}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </Text>
                    <Text style={[bold, { color: "#374151", flex: 1, textAlign: "right" }]}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View
            style={{
              marginTop: 20,
              backgroundColor: "#ECFCCB",
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: "#D9F99D",
            }}
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={LEMON_GREEN_DARK} />
            <Text style={[regular, { flex: 1, color: LEMON_GREEN_DARK, fontSize: 13 }]}>{t.cheretaTerm2}</Text>
          </View>
        </View>
      </ImmersiveNavScreen>
    </View>
  );
}
