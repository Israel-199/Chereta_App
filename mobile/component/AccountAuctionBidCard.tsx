import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveAuctionImage } from "@/utils/auctionMedia";
import { formatAuctionCodeDisplay } from "@/utils/formatAuctionCode";
import { CH_VIEW_MORE_BLUE, LEMON_GREEN } from "@/constants/theme";

type Props = {
  auction: any;
  bidAmount?: number;
  bidCount?: number;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
  bold: any;
  regular: any;
  footer?: React.ReactNode;
};

function AccountAuctionBidCard({
  auction,
  bidAmount,
  bidCount,
  badge,
  badgeColor = "#ECFCCB",
  onPress,
  bold,
  regular,
  footer,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Image
        source={resolveAuctionImage(auction.images?.[0])}
        style={{ width: "100%", height: 140 }}
        contentFit="cover"
      />
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <View style={{ backgroundColor: badgeColor, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={[bold, { fontSize: 11, color: "#166534" }]}>
              {badge || auction.categoryLabel || auction.category}
            </Text>
          </View>
          <Text style={[regular, { fontSize: 11, color: "#6B7280" }]}>
            {formatAuctionCodeDisplay(auction.auctionCode)}
          </Text>
        </View>
        <Text style={[bold, { fontSize: 17, color: "#111827", marginBottom: 8 }]} numberOfLines={2}>
          {auction.title}
        </Text>
        {bidAmount != null ? (
          <Text style={[bold, { color: CH_VIEW_MORE_BLUE, fontSize: 15 }]}>
            {bidAmount.toFixed(2)} ETB
          </Text>
        ) : null}
        {bidCount != null ? (
          <Text style={[regular, { color: "#6B7280", fontSize: 13, marginTop: 4 }]}>
            {bidCount} bid(s)
          </Text>
        ) : null}
        {footer}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
          <Text style={[bold, { color: LEMON_GREEN, fontSize: 13 }]}>View details</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={LEMON_GREEN} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(AccountAuctionBidCard);
