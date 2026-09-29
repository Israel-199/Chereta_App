import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CH_TIMER_RED } from "@/constants/theme";

type Metric = {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
  valueBold?: boolean;
};

type Props = {
  metrics: Metric[];
  bold: any;
  regular: any;
};

function AuctionMetricCarousel({ metrics, bold, regular }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={142}
      contentContainerStyle={{ paddingVertical: 4, paddingRight: 8, gap: 10 }}
    >
      {metrics.map((m) => (
        <View
          key={m.key}
          style={{
            minWidth: 140,
            alignSelf: "flex-start",
            backgroundColor: "#F9FAFB",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            paddingVertical: 12,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: m.iconBg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <MaterialCommunityIcons name={m.icon} size={16} color={m.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            {m.label ? (
              <Text style={[regular, { fontSize: 10, color: "#6B7280", marginBottom: 2 }]}>
                {m.label}
              </Text>
            ) : null}
            <Text
              style={[
                m.valueBold !== false ? bold : regular,
                { fontSize: 13, color: m.valueColor ?? "#111827" },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {m.value}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default memo(AuctionMetricCarousel);

export function buildAuctionMetrics(input: {
  serviceFeeLabel: string;
  serviceFee: number;
  codeLabel: string;
  auctionCode: string;
  ended: boolean;
  countdown: string;
  endedLabel: string;
  bidsLabel: string;
  bidCount: number;
}): Metric[] {
  if (input.ended) {
    return [
      {
        key: "bids",
        icon: "history",
        iconBg: "#E0E7FF",
        iconColor: "#3D5D96",
        label: input.bidsLabel,
        value: String(input.bidCount),
        valueColor: "#3D5D96",
      },
    ];
  }

  return [
    {
      key: "timer",
      icon: "timer-outline",
      iconBg: "#FEE2E2",
      iconColor: CH_TIMER_RED,
      label: "",
      value: input.countdown,
      valueColor: CH_TIMER_RED,
    },
    {
      key: "fee",
      icon: "gavel",
      iconBg: "#ECFCCB",
      iconColor: "#65A30D",
      label: input.serviceFeeLabel,
      value: `${input.serviceFee.toFixed(2)} Br`,
    },
    {
      key: "code",
      icon: "tag-outline",
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
      label: input.codeLabel,
      value: input.auctionCode,
    },
    {
      key: "bids",
      icon: "history",
      iconBg: "#E0E7FF",
      iconColor: "#3D5D96",
      label: input.bidsLabel,
      value: String(input.bidCount),
      valueColor: "#3D5D96",
    },
  ];
}
