import React, { useCallback, useMemo, useState } from "react";
import { View, Text, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Navbar from "@/component/Navbar";
import ImmersiveNavScreen from "@/component/ImmersiveNavScreen";
import AccountAuctionBidCard from "@/component/AccountAuctionBidCard";
import { useAuthStore } from "@/store/auth";
import { translations } from "@/translations";
import { useLocalizedTypography } from "@/utils/useLocalizedTypography";
import { useCheretaCache } from "@/store/cheretaCache";
import { filterUserWins } from "@/utils/groupUserBids";
import { LEMON_GREEN, LEMON_GREEN_DARK } from "@/constants/theme";

export default function MyWinningsScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const profile = useAuthStore((s) => s.profile);
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

  const wins = useMemo(() => filterUserWins(bids, profile?.id), [bids, profile?.id]);

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
            title={t.myWinningsTitle || "My Winnings"}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        scrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LEMON_GREEN} />,
        }}
      >
        <Text style={[regular, { color: "#6B7280", marginBottom: 14, lineHeight: 20 }]}>
          {t.myWinningsSubtitle || "Items you won"}
        </Text>
        {!token ? (
          <Text style={[regular, { textAlign: "center", marginTop: 32, color: "#666" }]}>{t.signInForBids}</Text>
        ) : wins.length === 0 ? (
          <Text style={[regular, { textAlign: "center", marginTop: 32, color: "#666" }]}>{t.noWinningsYet || "No wins yet."}</Text>
        ) : (
          wins.map(({ auction, bids: userBids }) => {
            const amount = auction.winningAmount ?? userBids[0]?.amount;
            return (
              <AccountAuctionBidCard
                key={auction.id}
                auction={auction}
                bidAmount={amount}
                badge={t.winnerLabel || "Winner"}
                badgeColor="#DCFCE7"
                onPress={() => router.push(`/screen/auction_results?id=${auction.id}`)}
                bold={bold}
                regular={regular}
                footer={
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    <FontAwesome5 name="trophy" size={14} color="#CA8A04" />
                    <Text style={[bold, { marginLeft: 6, color: LEMON_GREEN_DARK, fontSize: 13 }]}>
                      {t.wonFor || "Won for"} {Number(amount).toFixed(2)} ETB
                    </Text>
                  </View>
                }
              />
            );
          })
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
