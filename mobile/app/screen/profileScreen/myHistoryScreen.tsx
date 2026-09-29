import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Navbar from "@/component/Navbar";
import ImmersiveNavScreen from "@/component/ImmersiveNavScreen";
import { useAuthStore } from "@/store/auth";
import { translations } from "@/translations";
import { useLocalizedTypography } from "@/utils/useLocalizedTypography";
import { useCheretaCache } from "@/store/cheretaCache";
import { LEMON_GREEN, CH_VIEW_MORE_BLUE } from "@/constants/theme";
import { formatAuctionCodeDisplay } from "@/utils/formatAuctionCode";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function MyHistoryScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const language = useAuthStore((s) => s.language);
  const t = useMemo(() => translations[language] ?? translations.English ?? {}, [language]);
  const { bold, regular } = useLocalizedTypography(language);
  const [refreshing, setRefreshing] = useState(false);
  const [bids, setBids] = useState<any[]>(useCheretaCache.getState().myBids);

  const load = useCallback(async () => {
    const data = await useCheretaCache.getState().refreshMyBids(token);
    setBids(data);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const rows = useMemo(
    () =>
      [...bids].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [bids],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <ImmersiveNavScreen
        navbar={
          <Navbar
            leftIcon={<MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />}
            onLeftPress={() => router.back()}
            title={t.myHistoryTitle || "My History"}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        scrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LEMON_GREEN} />,
        }}
      >
        <Text style={[regular, { color: "#6B7280", marginBottom: 12, lineHeight: 20 }]}>
          {t.myHistorySubtitle || "Your bid activity by date and time."}
        </Text>
        {!token ? (
          <Text style={[regular, { textAlign: "center", marginTop: 32, color: "#666" }]}>{t.signInForBids}</Text>
        ) : rows.length === 0 ? (
          <Text style={[regular, { textAlign: "center", marginTop: 32, color: "#666" }]}>{t.noBidsYet}</Text>
        ) : (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {rows.map((b, idx) => {
              const a = b.auctionItem;
              if (!a) return null;
              return (
                <TouchableOpacity
                  key={b.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/screen/auction_details?id=${a.id}`)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: "#F3F4F6",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: LEMON_GREEN,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[bold, { fontSize: 13, color: "#111827" }]} numberOfLines={1}>
                      {a.title}
                    </Text>
                    <Text style={[regular, { fontSize: 11, color: "#6B7280", marginTop: 2 }]} numberOfLines={1}>
                      {a.categoryLabel || a.category} · {formatAuctionCodeDisplay(a.auctionCode)} · {formatWhen(b.createdAt)}
                    </Text>
                  </View>
                  <Text style={[bold, { fontSize: 13, color: CH_VIEW_MORE_BLUE, marginLeft: 8 }]}>
                    {b.amount.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
