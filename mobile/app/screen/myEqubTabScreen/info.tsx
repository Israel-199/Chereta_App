import React, { useCallback } from "react";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEqubMemberStore } from "@/store/equbMemberStore";
import { useAuthStore } from "@/store/auth";
import SkeletonLoader from "@/component/SkeletonLoader";
import Navbar from "@/component/Navbar";
import { formatAppDate } from "@/utils/dateUtils";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

const { width } = Dimensions.get("window");

export default function EqubInfoScreen() {
  const { equbId } = useLocalSearchParams<{ equbId: string }>();
  const { equb, fetching, loadEqub } = useEqubMemberStore();
  const [refreshing, setRefreshing] = React.useState(false);
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

  useFocusEffect(
    useCallback(() => {
      if (equbId) {
        loadEqub(equbId);
      }
    }, [equbId, loadEqub])
  );

  const onRefresh = async () => {
    if (equbId) {
      setRefreshing(true);
      await loadEqub(equbId);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${t.currencyBirr}`;
  };

  const InfoCard = ({ title, value, icon, color }: any) => (
    <View style={styles.infoCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { fontFamily: getFontFamily(false) }]}>
          {title}
        </Text>
        <Text style={[styles.cardValue, { fontFamily: getFontFamily(true), color }]}>
          {value}
        </Text>
      </View>
    </View>
  );

  if (fetching) {
    return (
      <View style={styles.container}>
        <Navbar title={t.equbInfo} />
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
          <SkeletonLoader width={width - 40} height={160} borderRadius={24} style={{ marginBottom: 20 }} />

          <View style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.gridItem}>
                <SkeletonLoader width="100%" height={120} borderRadius={20} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!equb) {
    return (
      <View style={styles.container}>
        <Navbar title={t.equbInfo} leftIcon={<TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>} />
        <View style={styles.center}>
          <Text style={{ fontFamily: getFontFamily(true) }}>{t.equbNotFound}</Text>
        </View>
      </View>
    );
  }

  const progress = equb.stats ? (equb.stats.completedRounds / equb.numberOfMembers) : 0;

  let displayName = equb.name || "";
  if (equb.contributionAmount) {
    const amountStr = String(equb.contributionAmount);
    if (displayName.endsWith(amountStr)) {
      displayName = displayName.slice(0, -amountStr.length).replace(/\|?\s*$/, "").trim();
    }
  }

  return (
    <View style={styles.container}>
      <Navbar
        title={t.equbInfo}
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
        {/* Header Summary Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.equbName, { fontFamily: getFontFamily(true) }]}>
                {displayName} {equb.contributionAmount ? `| ${equb.contributionAmount}` : ""}
              </Text>
            </View>
            <View 
              style={[
                styles.statusBadge, 
                { 
                  borderColor: (equb.status?.toLowerCase() === "completed" || (equb.endDate && new Date(equb.endDate) < new Date())) ? "#FEE2E2" : "#DCFCE7", 
                  backgroundColor: (equb.status?.toLowerCase() === "completed" || (equb.endDate && new Date(equb.endDate) < new Date())) ? "#FEF2F2" : "#F0FDF4" 
                }
              ]}
            >
              <Text 
                style={[
                  styles.statusText, 
                  { 
                    fontFamily: getFontFamily(true), 
                    color: (equb.status?.toLowerCase() === "completed" || (equb.endDate && new Date(equb.endDate) < new Date())) ? "#EF4444" : "#22C55E" 
                  }
                ]}
              >
                {(equb.status?.toLowerCase() === "completed" || (equb.endDate && new Date(equb.endDate) < new Date())) ? `🔴 ${t.completed || "Completed"}` : `🟢 ${t.active || "Active"}`}
              </Text>
            </View>
          </View>

          <View style={styles.headerDivider} />

          <View style={styles.contributionRow}>
            <Text style={[styles.contributionLabel, { fontFamily: getFontFamily(false) }]}>
              {t.total} :
            </Text>
            <Text style={[styles.contributionValue, { fontFamily: getFontFamily(true) }]}>
               {formatCurrency(equb.stats?.amountPaid || 0)}
            </Text>
          </View>

          <View style={styles.dateLabelRow}>
            <Text style={[styles.headerDateLabel, { fontFamily: getFontFamily(false) }]}>{t.startDate}</Text>
            <Text style={[styles.headerDateLabel, { fontFamily: getFontFamily(false) }]}>{t.endDate}</Text>
          </View>

          <View style={styles.dateValueRow}>
            <Text style={[styles.headerDateValue, { fontFamily: getFontFamily(true) }]}>
              {formatAppDate(equb.startDate, language, t)}
            </Text>
            <Text style={[styles.headerDateValue, { fontFamily: getFontFamily(true) }]}>
              {formatAppDate(equb.endDate, language, t)}
            </Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <InfoCard
              title={t.amountPaid}
              value={formatCurrency(equb.stats?.amountPaid || 0)}
              icon="cash-check"
              color="#0B3C8A"
            />
          </View>
          <View style={styles.gridItem}>
            <InfoCard
              title={t.amountSaved}
              value={formatCurrency(equb.stats?.amountSaved || 0)}
              icon="piggy-bank"
              color="#22C55E"
            />
          </View>
          <View style={styles.gridItem}>
            <InfoCard
              title={t.unpaidAmount}
              value={formatCurrency(equb.stats?.unpaidAmount || 0)}
              icon="cash-remove"
              color="#EF4444"
            />
          </View>
          <View style={styles.gridItem}>
            <InfoCard
              title={t.remainingBalance}
              value={formatCurrency(equb.stats?.remainingBalance || 0)}
              icon="wallet-outline"
              color="#F59E0B"
            />
          </View>
          <View style={styles.gridItem}>
            <InfoCard
              title={t.completedRounds}
              value={equb.stats?.completedRounds || 0}
              icon="refresh"
              color="#8B5CF6"
            />
          </View>
          <View style={styles.gridItem}>
            <InfoCard
              title={t.remainingRounds}
              value={equb.stats?.remainingRounds || 0}
              icon="calendar-clock"
              color="#6366F1"
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#0B3C8A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  equbName: {
    fontSize: 18,
    color: "#1E293B",
  },
  equbType: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  statusText: {
    fontSize: 10,
    color: "#0284C7",
    textTransform: "uppercase",
  },
  progressContainer: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  progressPercent: {
    fontSize: 15,
    color: "#0B3C8A",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0B3C8A",
    borderRadius: 5,
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  contributionRow: {
    marginBottom: 16,
  },
  contributionLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  contributionValue: {
    fontSize: 18,
    color: "#1E293B",
  },
  dateLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dateValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerDateLabel: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
  headerDateValue: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTextContainer: {
    width: "100%",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 14,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#1E293B",
    textAlign: "center",
  },
  bottomDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 15,
  },
  payoutSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  payoutText: {
    fontSize: 14,
    color: "#475569",
  },
});