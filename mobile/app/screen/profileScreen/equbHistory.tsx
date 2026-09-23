import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { getEqubHistory } from "@/api/equbSevice";
import SkeletonLoader from "@/component/SkeletonLoader";
import Navbar from "@/component/Navbar";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

const { width } = Dimensions.get("window");

export default function EqubHistoryScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useAuthStore();
  const router = useRouter();

  const getFontFamily = (bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold
        ? "NotoSansEthiopic-Bold"
        : "NotoSansEthiopic-Regular"
      : bold
      ? "NotoSans-Bold"
      : "NotoSans-Regular";

  const getT = () => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  };

  const t = getT() as any;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getEqubHistory();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatCurrency = (amount: number) => {
    return `${(amount || 0).toLocaleString()} ${t.currencyBirr}`;
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statTitle, { fontFamily: getFontFamily(false) }]}>
          {title}
        </Text>
        <Text style={[styles.statValue, { fontFamily: getFontFamily(true), color }]}>
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.statSubtitle, { fontFamily: getFontFamily(false) }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar title={t.equbHistory} />
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0B3C8A"
              colors={["#0B3C8A"]}
            />
          }
        >
          {/* Header Skeleton */}
          <SkeletonLoader
            width={width - 40}
            height={width * 0.45}
            borderRadius={24}
            style={{ marginBottom: 20 }}
          />

          <View style={styles.grid}>
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={i === 0 ? styles.fullWidthItem : styles.gridItem}
              >
                <SkeletonLoader
                  width="100%"
                  height={i === 0 ? 120 : 150}
                  borderRadius={20}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar
        title={t.equbHistory}
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B3C8A" colors={["#0B3C8A"]} />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroOverlay}>
            <MaterialCommunityIcons name="piggy-bank" size={48} color="#fff" style={styles.heroIcon} />
            <Text style={[styles.heroLabel, { fontFamily: getFontFamily(false) }]}>
              {t.totalAmountSaved}
            </Text>
            <Text style={[styles.heroValue, { fontFamily: getFontFamily(true) }]}>
              {formatCurrency(stats?.totalAmountSaved)}
            </Text>
            <View style={styles.heroDecoration} />
          </View>
        </View>

        {/* Global Statistics Grid */}
        <View style={styles.grid}>
          <View style={styles.fullWidthItem}>
            <StatCard
              title={t.totalAmountReceived}
              value={formatCurrency(stats?.totalAmountReceived)}
              icon="cash-receive"
              color="#22C55E"
              subtitle={t.successStory}
            />
          </View>
          <View style={styles.gridItem}>
            <StatCard
              title={t.totalRemainingBalance}
              value={formatCurrency(stats?.totalRemainingBalance)}
              icon="wallet-outline"
              color="#F59E0B"
            />
          </View>

          <View style={styles.gridItem}>
            <StatCard
              title={t.completedEqubsCount}
              value={stats?.completedEqubsCount || 0}
              icon="check-decagram"
              color="#8B5CF6"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#64748B" />
        <Text style={[styles.infoText, { fontFamily: getFontFamily(false) }]}>
          {t.footerRights}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    height: width * 0.45,
    minHeight: 180,
    backgroundColor: "#0B3C8A",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#0B3C8A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  heroOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIcon: {
    marginBottom: 12,
    opacity: 0.9,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroValue: {
    color: "#fff",
    fontSize: 28,
    marginTop: 8,
  },
  heroDecoration: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  fullWidthItem: {
    width: "100%",
    marginBottom: 16,
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statInfo: {
    alignItems: "center",
  },
  statTitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
});