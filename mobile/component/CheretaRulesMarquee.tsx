import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LEMON_GREEN } from "@/constants/theme";

type Props = {
  t: Record<string, string>;
  bold: any;
  regular: any;
};

export default function CheretaRulesMarquee({ t, bold, regular }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 600);
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const rules = [
    {
      icon: "gavel",
      title: t.auctionServiceFeeLabel || "Auction Service Fee",
      desc: t.serviceFeeDesc || "A non-refundable 75 ETB fee is required to participate. It is not deducted from your bid.",
    },
    {
      icon: "star-circle",
      title: t.lowestUniqueBid || "Lowest Unique Bid",
      desc: t.winnerDesc || "The winner is the participant who submits the lowest bid amount that no one else choose.",
    },
    {
      icon: "cash-check",
      title: t.winnerPays || "Only the Winner Pays",
      desc: t.onlyWinnerPaysDesc || "Only the auction winner will pay their unique bid amount in the end.",
    },
  ];

  const CARD_WIDTH = width;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % rules.length;
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [rules.length, CARD_WIDTH]);

  return (
    <View>
      
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        contentContainerStyle={{ paddingTop: 4 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
          setCurrentIndex(index);
        }}
      >
        {rules.map((rule, idx) => (
          <View key={idx} style={{ width: CARD_WIDTH, paddingHorizontal: 16 }}>
            <View style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name={rule.icon as any} size={22} color={LEMON_GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[bold, styles.title]}>{rule.title}</Text>
              <Text style={[regular, styles.desc]}>{rule.desc}</Text>
            </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "stretch",
    borderLeftWidth: 4,
    borderLeftColor: LEMON_GREEN,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 2,
    lineHeight: 22,
  },
  desc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
});
