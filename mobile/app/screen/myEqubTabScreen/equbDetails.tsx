import React, { useState, useMemo, useCallback, memo, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  InteractionManager,
  useWindowDimensions,
  Animated,
} from "react-native";
import { Image } from 'expo-image';
import Navbar from "@/component/Navbar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, Href } from "expo-router";
import CategoryItem from "@/component/CategoryItem";
import SuspendedScreen from "@/component/SuspendedScreen";

import { useAuthStore } from "@/store/auth";
import { translations } from "@/translations";
import { useMyEqubsScreenStyles } from "@/styles/myEqubScreenStyles";
import { formatProfessionalCurrentDate } from "@/utils/dateUtils";
import { useEffect } from "react";

const savingsIcon = require("@/assets/images/icons/savings.png");
const memberIcon = require("@/assets/images/icons/member.png");
const lotteryIcon = require("@/assets/images/icons/lottery.png");
const infoIcon = require("@/assets/images/icons/info.png");
const joinedIcon = require("@/assets/images/icons/joined.png");
const helpIcon = require("@/assets/images/icons/help.png");
const historyIcon = require("@/assets/images/icons/history.png");
const transparentLogo = require("@/assets/images/transparentlogo.png");

const ETHIOPIC_LANGUAGES = new Set(["አማርኛ", "ትግርኛ"]);

type Category = {
  label: string;
  route: Href;
  icon: any;
};

const formatUserId = (id?: string) => {
  if (!id) return "N/A";
  return id;
};

const MyEqubsScreen = () => {
  const styles = useMyEqubsScreenStyles();
  const router = useRouter();
  const { language, profile, myEqubs, preloadData } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMoney, setShowMoney] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const [activeEqubIndex, setActiveEqubIndex] = useState(0);
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const t = useMemo(() => translations[language] ?? {}, [language]);
  const [loadingRouteLabel, setLoadingRouteLabel] = useState<string | null>(null);
  const isNavigating = useRef(false);

  const handleNav = useCallback((route: Href, label: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    // Show loading effect ONLY for the lottery tab
    const isLotteryTab = label === (t?.lottery ?? "Lottery") || label === "Lottery";
    if (isLotteryTab) {
      setLoadingRouteLabel(label);
    }

    InteractionManager.runAfterInteractions(() => {
      router.push(route);
      setTimeout(() => {
        isNavigating.current = false;
        setLoadingRouteLabel(null);
      }, 800);
    });
  }, [router, t]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await preloadData();
    } catch (err) {
      console.warn("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [preloadData]);

  const getFontFamily = useCallback(
    (bold = false) => {
      if (ETHIOPIC_LANGUAGES.has(language)) {
        return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
      }
      return bold ? "NotoSans-Bold" : "NotoSans-Regular";
    },
    [language]
  );

  const nameFontStyle = useMemo(() => ({ fontFamily: getFontFamily(true) }), [getFontFamily]);
  const regularFontStyle = useMemo(() => ({ fontFamily: getFontFamily(false) }), [getFontFamily]);

  const hasJoinedEqub = Array.isArray(myEqubs) && myEqubs.length > 0;
  const currentEqub = hasJoinedEqub ? myEqubs[activeEqubIndex] : null;
  const currentEqubId = currentEqub?.id;

  const categories = useMemo((): Category[] => [
    { label: t?.equbMembers ?? "Members", route: "/screen/myEqubTabScreen/equbMembers" as any, icon: memberIcon },
    { label: t?.lottery ?? "Lottery", route: { pathname: "/screen/myEqubTabScreen/lottery", params: { equbId: currentEqubId } } as any, icon: lotteryIcon },
    { label: t?.equbInfo ?? "Info", route: { pathname: "/screen/myEqubTabScreen/info", params: { equbId: currentEqubId } } as any, icon: infoIcon },
    { label: t?.equbBuy ?? "Equb Buy", route: "/screen/myEqubTabScreen/equbBuy" as any, iconName: "cart-arrow-down" } as any,
    { label: t?.helpCenter ?? "Help", route: "/screen/myEqubTabScreen/help" as any, icon: helpIcon },
    { label: t?.equbSells ?? "Equb Sells", route: "/screen/myEqubTabScreen/equbSells" as any, iconName: "tag-outline" } as any,
  ], [t, currentEqubId]);

  const toggleMoney = useCallback(() => setShowMoney((v) => !v), []);
  const toggleBalance = useCallback(() => setShowBalance((v) => !v), []);

  const displayName = useMemo(() => 
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : "User",
    [profile]
  );

  const formattedUserId = useMemo(() => formatUserId(profile?.userCode), [profile?.userCode]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => (
    <View style={styles.categoryWrapper}>
      <CategoryItem
        label={item.label}
        imageSource={item.icon}
        iconName={(item as any).iconName}
        isLoading={loadingRouteLabel === item.label}
        onPress={() => handleNav(item.route, item.label)}
      />
    </View>
  ), [handleNav, loadingRouteLabel, styles.categoryWrapper]);

  const navIcon = useMemo(() => <MaterialIcons name="savings" size={22} color="#fff" />, []);
  const refreshIcon = useMemo(() => (
    <MaterialCommunityIcons 
      name="refresh" 
      size={22} 
      color={isRefreshing ? "#ccc" : "#fff"} 
    />
  ), [isRefreshing]);

  const renderEqubCard = useCallback(({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardTag}>
        <Text style={[styles.tagText, nameFontStyle]}>
          {((t as any).types?.[item.type?.toLowerCase()] || item.type || "DAILY").toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.nameText, nameFontStyle]}>{displayName}</Text>
      <View style={styles.infoRow}>
        <MaterialIcons name="attach-money" size={22} color="#32CD32" />
        <Text style={[styles.infoLabel, nameFontStyle]}>{t?.contributedMoney ?? "Contributed"}:</Text>
        <Text style={[styles.infoLabel, nameFontStyle]}>
          {showMoney ? `${item.contributedAmount || 0} ${t?.currencyBirr ?? "Birr"}` : `*** ${t?.currencyBirr ?? "Birr"}`}
        </Text>
        <TouchableOpacity onPress={toggleMoney} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name={showMoney ? "eye-outline" : "eye-off-outline"} size={21} color="#32CD32" />
        </TouchableOpacity>
      </View>
      <View style={styles.balanceRow}>
        <Ionicons name="wallet" size={22} color="#32CD32" />
        <Text style={[styles.infoLabel, nameFontStyle]}>{t?.balance ?? "Balance"}:</Text>
        <Text style={[styles.infoLabel, nameFontStyle]}>
          {showBalance ? `${item.balance || 0} ${t?.currencyBirr ?? "Birr"}` : `*** ${t?.currencyBirr ?? "Birr"}`}
        </Text>
        <TouchableOpacity onPress={toggleBalance} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={21} color="#32CD32" />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <Text style={[styles.userIdText, regularFontStyle, { marginBottom: 0 }]}>{t?.userId || "User ID"} - {formattedUserId}</Text>
        <View style={[styles.dateContainer, { marginTop: 0 }]}>
          <Text style={[styles.dateText, regularFontStyle]}>
            {formatProfessionalCurrentDate(now, language, t)}
          </Text>
        </View>
      </View>
    </View>
  ), [displayName, nameFontStyle, regularFontStyle, t, showMoney, showBalance, toggleMoney, toggleBalance, formattedUserId, styles]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    if (index !== activeEqubIndex) {
      setActiveEqubIndex(index);
    }
  }, [activeEqubIndex]);

  const ListHeader = useMemo(() => {
    const scaleFactor = Math.min(1, width / 360);
    const dotSize = 6 * scaleFactor;
    const dotActiveSize = 12 * scaleFactor;

    return (
      <View style={styles.mainPadding}>
        <Animated.FlatList
          data={myEqubs}
          renderItem={renderEqubCard}
          keyExtractor={(item: any) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          snapToAlignment="center"
          decelerationRate="fast"
        />

        {myEqubs.length > 1 && (
          <View style={styles.dotsContainer}>
            {myEqubs.map((_, index) => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [dotSize, dotActiveSize, dotSize],
                extrapolate: "clamp",
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: "clamp",
              });

              const backgroundColor = scrollX.interpolate({
                inputRange,
                outputRange: ["#D1D5DB", "#0B3C8A", "#D1D5DB"],
                extrapolate: "clamp",
              });

              return (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.dot, 
                    { width: dotWidth, backgroundColor, opacity }
                  ]} 
                />
              );
            })}
          </View>
        )}
      </View>
    );
  }, [myEqubs, renderEqubCard, onMomentumScrollEnd, styles, scrollX, width]);

  const ListFooter = useMemo(() => (
    <View style={styles.logoContainer}>
      <Image source={transparentLogo} style={styles.logo} contentFit="contain" />
    </View>
  ), [styles.logo]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <Navbar
        leftIcon={navIcon}
        title={t?.myEqubsTab ?? "My Equbs"}
        firstIcon={refreshIcon}
        onFirstPress={handleRefresh}
      />

      {profile?.status === "SUSPENDED" ? (
        <SuspendedScreen />
      ) : !hasJoinedEqub ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateInner}>
            <View style={styles.iconContainer}>
              <Image source={savingsIcon} style={styles.iconImage} contentFit="contain" />
            </View>
            <Text style={[styles.notJoinedText, nameFontStyle]}>{t?.notJoined ?? "Not joined yet"}</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={() => InteractionManager.runAfterInteractions(() => router.replace("/home" as any))} activeOpacity={0.8}>
              <Text style={[styles.ctaText, nameFontStyle]}>{t?.chooseEqub ?? "Choose Equb"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={categories}
          keyExtractor={(item) => item.label}
          renderItem={renderCategoryItem}
          numColumns={3}
          bounces={true}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          contentContainerStyle={{ paddingBottom: 10 }}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
        />
      )}
    </View>
  );
}

export default memo(MyEqubsScreen);