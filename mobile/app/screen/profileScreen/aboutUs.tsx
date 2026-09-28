import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth";
import { translations } from "../../../translations";
import Navbar from "../../../component/Navbar";

const { width } = Dimensions.get("window");

export default function AboutUsScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const t = useMemo(() => translations[language] || {}, [language]);

  const getFontFamily = useCallback(
    (bold = false) => {
      if (language === "አማርኛ" || language === "ትግርኛ") {
        return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
      }
      return bold ? "NotoSans-Bold" : "NotoSans-Regular";
    },
    [language]
  );

  return (
    <View style={styles.root}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 350, 
          backgroundColor: "#8DB048",
        }}
      />
      <StatusBar barStyle="light-content" backgroundColor="#8DB048" translucent />
      <Navbar
        leftIcon={
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#fff"
            onPress={() => router.back()}
          />
        }
        title={t.aboutUs || "About Us"}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ backgroundColor: "transparent" }} 
      >
        {/* Background extension for top-overscroll on iOS/Android (Internal to Scroll) */}
        <View style={{ height: 1000, backgroundColor: "#8DB048", position: "absolute", top: -1000, left: 0, right: 0 }} />

        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrapper}>
            <Image
              source={require("../../../assets/images/transparentlogo.png")}
              style={{ width: "80%", height: "80%" }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.companyName, { fontFamily: getFontFamily(true) }]}>
            Digital Chereta
          </Text>
          <Text style={[styles.tagline, { fontFamily: getFontFamily(false) }]}>
            Financial Technology PLC
          </Text>
        </View>

        {/* Padding View to restore the light background for bottom sections if needed */}
        <View style={{ backgroundColor: "#F2F4F7", minHeight: 400 }}>
          {/* OUR STORY / ABOUT US SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
            </View>
            <Text style={[styles.cardBody, { fontFamily: getFontFamily(false) }]}>
              {"Digital Chereta is an Ethiopian digital auction platform that allows users to participate in online auctions for a variety of products. Our Unique Lowest Bid model gives participants the opportunity to win by submitting the lowest unique bid. The minimum bid starts at 1 ETB."}
            </Text>
          </View>
          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { fontFamily: getFontFamily(false) }]}>
              {t.regulatedPlatform || "Authorized & Regulated Technology Platform"}
            </Text>
            <Text style={[styles.version, { fontFamily: getFontFamily(false) }]}>
              Digital Chereta v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F4F7", 
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "#3D5D96",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  companyName: {
    fontSize: 28,
    color: "#fff",
  },
  tagline: {
    fontSize: 16,
    color: "#D1D5DB",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginTop: -20, 
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    color: "#1F2937",
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
    textAlign: "justify",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 20,
    gap: 16,
  },
  smallCard: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleSmall: {
    fontSize: 18,
    color: "#1F2937",
    marginBottom: 8,
  },
  cardBodySmall: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  version: {
    fontSize: 11,
    color: "#9CA3AF", 
    marginTop: 8,
  },
});