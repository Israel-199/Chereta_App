import React, { useCallback, useMemo, useState } from "react";
import { View, Text, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Navbar from "@/component/Navbar";
import ImmersiveNavScreen from "@/component/ImmersiveNavScreen";
import AccountAuctionBidCard from "@/component/AccountAuctionBidCard";
import { useAuthStore } from "@/store/auth";
import { translations } from "@/translations";
import { useLocalizedTypography } from "@/utils/useLocalizedTypography";
import { useCheretaCache } from "@/store/cheretaCache";
import { groupBidsByAuction } from "@/utils/groupUserBids";
import { LEMON_GREEN } from "@/constants/theme";

export default function MyBidsScreen() {
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

  const grouped = useMemo(() => groupBidsByAuction(bids), [bids]);

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
            title={t.myBidsTitle || "My Bids"}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        scrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LEMON_GREEN} />,
        }}
      >
        <Text style={[regular, { color: "#6B7280", marginBottom: 14, lineHeight: 20 }]}>
          {t.myBidsSubtitle || "Auctions and categories you have bid on."}
        </Text>
        {!token ? (
          <Text style={[regular, { textAlign: "center", marginTop: 32, color: "#666" }]}>{t.signInForBids}</Text>
        ) : grouped.length === 0 ? (
          <Text style={[regular, { textAlign: "center", marginTop: 32, color: "#666" }]}>{t.noBidsYet}</Text>
        ) : (
          grouped.map(({ auction, bids: userBids }) => (
            <AccountAuctionBidCard
              key={auction.id}
              auction={auction}
              bidAmount={userBids[0]?.amount}
              bidCount={userBids.length}
              badge={auction.categoryLabel || auction.category}
              onPress={() => router.push(`/screen/auction_details?id=${auction.id}`)}
              bold={bold}
              regular={regular}
            />
          ))
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
