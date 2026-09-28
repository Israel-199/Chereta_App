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
  const { width } = useWindowDimensions();
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
      desc: t.winnerDesc || "The winner is the participant who submits the lowest bid amount that no one else chose.",
    },
    {
      icon: "cash-check",
      title: t.winnerPays || "Only the Winner Pays",
      desc: t.onlyWinnerPaysDesc || "Only the auction winner will pay their unique bid amount in the end.",
    },
  ];

  const CARD_WIDTH = Math.min(width * 0.95, 300);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % rules.length;
        scrollRef.current?.scrollTo({ x: next * (CARD_WIDTH + 12), animated: true });
        return next;
      });
    }, 4500); // Auto-scroll every 4.5 seconds
    return () => clearInterval(timer);
  }, [rules.length, CARD_WIDTH]);

  return (
    <View style={styles.container}>
      <Text style={[bold, styles.header]}>{t.howItWorks || "How it works"}</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4, gap: 12 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
          setCurrentIndex(index);
        }}
      >
        {rules.map((rule, idx) => (
          <View key={idx} style={[styles.card, { width: CARD_WIDTH }]}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name={rule.icon as any} size={22} color={LEMON_GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[bold, styles.title]}>{rule.title}</Text>
              <Text style={[regular, styles.desc]}>{rule.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    fontSize: 18,
    color: "#111827",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
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
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
    lineHeight: 22,
  },
  desc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
