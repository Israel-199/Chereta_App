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
import { getCompletedEqubs } from "@/api/equbSevice";
import SkeletonLoader from "@/component/SkeletonLoader";
import Navbar from "@/component/Navbar";
import { formatAppDate } from "@/utils/dateUtils";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

const { width } = Dimensions.get("window");

export default function SuccessStoryScreen() {
  const [equbs, setEqubs] = useState<any[]>([]);
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

  const fetchCompletedEqubs = async () => {
    setLoading(true);
    try {
      const data = await getCompletedEqubs();
      setEqubs(data);
    } catch (error) {
      console.error("Failed to fetch completed equbs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompletedEqubs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompletedEqubs();
  };

  const formatCurrency = (amount: number) => {
    return `${(amount || 0).toLocaleString()} ${t.currencyBirr}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar title={t.successStory} />
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
          {[...Array(3)].map((_, i) => (
            <SkeletonLoader
              key={i}
              width={width - 40}
              height={120}
              borderRadius={24}
              style={{ marginBottom: 16 }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar
        title={t.successStory}
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0B3C8A"
            colors={["#0B3C8A"]}
          />
        }
      >
        {equbs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="trophy-outline" size={80} color="#CBD5E1" />
            </View>
            <Text style={[styles.emptyTitle, { fontFamily: getFontFamily(true) }]}>
              {t.noCompletedEqubs}
            </Text>
          </View>
        ) : (
          equbs.map((equb) => (
            <View key={equb.id} style={styles.equbCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="check-decagram" size={28} color="#22C55E" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.equbName, { fontFamily: getFontFamily(true) }]}>
                    {equb.name}
                  </Text>
                  <Text style={[styles.equbType, { fontFamily: getFontFamily(false) }]}>
                    {t[`${equb.type?.toLowerCase()}Equb`] || equb.type}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, { fontFamily: getFontFamily(true) }]}>
                    {t.completed}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Text style={[styles.footerLabel, { fontFamily: getFontFamily(false) }]}>
                    {t.received}
                  </Text>
                  <Text style={[styles.footerValue, { fontFamily: getFontFamily(true) }]}>
                    {formatCurrency(equb.total)}
                  </Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.footerItem}>
                  <Text style={[styles.footerLabel, { fontFamily: getFontFamily(false) }]}>
                    {t.endedOn}
                  </Text>
                  <Text style={[styles.footerValue, { fontFamily: getFontFamily(true) }]}>
                    {formatAppDate(equb.endDate, language, t)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  equbCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  equbName: {
    fontSize: 17,
    color: "#1E293B",
  },
  equbType: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#15803D",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: {
    flex: 1,
    alignItems: "center",
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F1F5F9",
  },
  footerLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    color: "#0B3C8A",
  },
});