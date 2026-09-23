import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  InteractionManager,
} from "react-native";
import { Image } from 'expo-image';
import Navbar from "../../component/Navbar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CategoryItem from "../../component/CategoryItem";
import { typography } from "../../styles/typography";
import { useAuthStore } from "../../store/auth";
import { useEqubTypesStore } from "../../store/equbTypesStore";
import { translations } from "../../translations";
import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";

import SkeletonLoader from "../../component/SkeletonLoader";
import SkeletonEqubGrid from "../../component/SkeletonEqubGrids";
import SuspendedScreen from "../../component/SuspendedScreen";

import { useHomeScreenStyles, useHomeUIStyles } from "../../styles/homeScreenStyles";

const promoImages = [
  require("../../assets/images/carousel_1.jpg"),
  require("../../assets/images/carousel_2.jpg"),
  require("../../assets/images/carousel_3.jpg"),
];

const adImageSource = require("../../assets/images/graphics.jpg");

const dailyIcon = require("../../assets/images/icons/payment-method.png");
const weeklyIcon = require("../../assets/images/icons/weekly.png");
const monthlyIcon = require("../../assets/images/icons/monthly.png");
const vehicleIcon = require("../../assets/images/icons/electric-car.png");
const houseIcon = require("../../assets/images/icons/buy-home.png");
const phoneIcon = require("../../assets/images/icons/smartphone.png");
const refrigeratorIcon = require("../../assets/images/icons/Refrigrator.png");
const tvIcon = require("../../assets/images/icons/Tv.png");
const sofaIcon = require("../../assets/images/icons/Sofa.png");

const VEHICLE_STYLE = { transform: [{ scale: 2.0 }] };
const HOUSE_STYLE = { transform: [{ scale: 1.5 }] };
const PHONE_STYLE = { transform: [{ scale: 1.8 }] };
const REFRIGERATOR_STYLE = { transform: [{ scale: 1.5 }] };
const TV_STYLE = { transform: [{ scale: 1.5 }] };
const SOFA_STYLE = { transform: [{ scale: 1.5 }] };

const EQUB_TYPE_CONFIG: Record<string, {
  icon: any;
  labelKey: string;
  fallbackLabel: string;
  route: string;
  imageStyle?: any;
  tint?: boolean;
  category: "standard" | "property" | "appliance";
}> = {
  DAILY: { icon: dailyIcon, labelKey: "dailyEqub", fallbackLabel: "Daily", route: "/screen/dailyEqubList", category: "standard", tint: true },
  WEEKLY: { icon: weeklyIcon, labelKey: "weeklyEqub", fallbackLabel: "Weekly", route: "/screen/weeklyEqubList", category: "standard", tint: true },
  MONTHLY: { icon: monthlyIcon, labelKey: "monthlyEqub", fallbackLabel: "Monthly", route: "/screen/monthlyEqubList", category: "standard", tint: true },
  VEHICLE: { icon: vehicleIcon, labelKey: "vehicleEqub", fallbackLabel: "Vehicle", route: "/screen/equbRegistration?type=VEHICLE", imageStyle: VEHICLE_STYLE, category: "property" },
  HOUSE: { icon: houseIcon, labelKey: "houseEqub", fallbackLabel: "House", route: "/screen/equbRegistration?type=HOUSE", imageStyle: HOUSE_STYLE, category: "property" },
  PHONE: { icon: phoneIcon, labelKey: "phoneEqub", fallbackLabel: "Phone", route: "/screen/phoneEqubList", imageStyle: PHONE_STYLE, category: "property" },
  TV: { icon: tvIcon, labelKey: "tvEqub", fallbackLabel: "TV Equb", route: "/screen/phoneEqubList?type=tv", imageStyle: TV_STYLE, category: "appliance" },
  REFRIGERATOR: { icon: refrigeratorIcon, labelKey: "refrigeratorEqub", fallbackLabel: "Refrigerator Equb", route: "/screen/phoneEqubList?type=refrigerator", imageStyle: REFRIGERATOR_STYLE, category: "appliance" },
  SOFA: { icon: sofaIcon, labelKey: "sofaEqub", fallbackLabel: "Sofa Equb", route: "/screen/phoneEqubList?type=sofa", imageStyle: SOFA_STYLE, category: "appliance" },
};

const HomeScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 600);
  const scaleFactor = Math.min(1, windowWidth / 360);
  const styles = useHomeScreenStyles();
  const uiStyles = useHomeUIStyles();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const language = useAuthStore((state) => state.language);
  const profile = useAuthStore((state) => state.profile);

  const availableTypes = useEqubTypesStore((state) => state.availableTypes);
  const loadAvailableTypes = useEqubTypesStore((state) => state.loadAvailableTypes);

  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const t = useMemo(() => translations[language] ?? {}, [language]);
  const isNavigating = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadAvailableTypes();
      } catch (e) {
        console.warn("Failed to load equb types", e);
      } finally {
        if (mounted) setHasLoadedOnce(true);
      }
    })();
    return () => { mounted = false; };
  }, [loadAvailableTypes]);

  const handleNav = (path: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    InteractionManager.runAfterInteractions(() => {
      router.push(path as any);
      setTimeout(() => { isNavigating.current = false; }, 1000);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % promoImages.length;
        try {
          scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        } catch {}
        return nextIndex;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [width]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAvailableTypes();
    } catch (e) {
      console.warn("Refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  }, [loadAvailableTypes]);

  const handleNotifications = useCallback(() => handleNav("/screen/notifications"), [router]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const prevIndex = prev === 0 ? promoImages.length - 1 : prev - 1;
      try { scrollRef.current?.scrollTo({ x: prevIndex * width, animated: true }); } catch {}
      return prevIndex;
    });
  }, [width]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = (prev + 1) % promoImages.length;
      try { scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true }); } catch {}
      return nextIndex;
    });
  }, [width]);

  const onScrollEnd = useCallback((event: any) => {
    const index = Math.round(event?.nativeEvent?.contentOffset?.x / width);
    if (!isNaN(index)) setCurrentIndex(index);
  }, [width]);

  const navIcon = useMemo(() => <MaterialCommunityIcons name="home" size={22} color="#fff" />, []);
  const bellIcon = useMemo(() => <MaterialCommunityIcons name="bell" size={22} color="#fff" />, []);

  const carouselItems = useMemo(() => promoImages.map((img, index) => (
    <Image key={index} source={img} style={uiStyles.promoImage} contentFit="cover" transition={200} />
  )), [uiStyles.promoImage]);

  const standardEqubs = useMemo(() =>
    availableTypes
      .filter(type => EQUB_TYPE_CONFIG[type]?.category === "standard")
      .map(type => {
        const config = EQUB_TYPE_CONFIG[type];
        return { icon: config.icon, label: (t as any)?.[config.labelKey] ?? config.fallbackLabel, route: config.route, imageStyle: config.imageStyle, tint: config.tint !== false };
      }),
    [availableTypes, t]
  );

  const propertyEqubs = useMemo(() =>
    availableTypes
      .filter(type => EQUB_TYPE_CONFIG[type]?.category === "property")
      .map(type => {
        const config = EQUB_TYPE_CONFIG[type];
        return { icon: config.icon, label: (t as any)?.[config.labelKey] ?? config.fallbackLabel, route: config.route, imageStyle: config.imageStyle, tint: false };
      }),
    [availableTypes, t]
  );

  const applianceEqubs = useMemo(() =>
    availableTypes
      .filter(type => EQUB_TYPE_CONFIG[type]?.category === "appliance")
      .map(type => {
        const config = EQUB_TYPE_CONFIG[type];
        return { icon: config.icon, label: (t as any)?.[config.labelKey] ?? config.fallbackLabel, route: config.route, imageStyle: config.imageStyle, tint: false };
      }),
    [availableTypes, t]
  );

  const showSkeleton = !hasLoadedOnce || refreshing;

  return (
    <View style={styles.root}>
      <Navbar
        leftIcon={navIcon}
        title="Habesha Equb"
        firstIcon={bellIcon}
        onFirstPress={handleNotifications}
        showNotificationBadge={true}
      />

      {profile?.status === "SUSPENDED" ? (
        <SuspendedScreen />
      ) : showSkeleton ? (
        <View style={styles.skeletonPadding}>
          <SkeletonLoader width="60%" height={24 * scaleFactor} style={styles.skeletonTitleStyle} />
          <SkeletonEqubGrid />
          <SkeletonLoader width="100%" height={85 * scaleFactor} style={styles.skeletonCarouselStyle} />
          <SkeletonLoader width="60%" height={24 * scaleFactor} style={styles.skeletonTitleStyle} />
          <SkeletonEqubGrid />
          <SkeletonLoader width="100%" height={180 * scaleFactor} style={styles.skeletonAdStyle} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#fff"]}
              progressBackgroundColor="#0B3C8A"
              tintColor="#fff"
            />
          }
          bounces={true}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          renderToHardwareTextureAndroid={true}
          shouldRasterizeIOS={true}
        >
          {standardEqubs.length > 0 && (
            <>
              <Text style={[typography.englishBold, uiStyles.sectionTitle]}>
                {t?.startEqubToday ?? "Start Equb Today"}
              </Text>
              <View style={uiStyles.grid}>
                {standardEqubs.map((item, index) => (
                  <CategoryItem
                    key={`std-${index}`}
                    imageSource={item.icon}
                    label={item.label}
                    onPress={() => handleNav(item.route)}
                  />
                ))}
              </View>
              <View style={uiStyles.divider} />
            </>
          )}

          <View style={uiStyles.promoContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled={false}
              snapToInterval={width}
              snapToAlignment="center"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              scrollEventThrottle={16}
            >
              {carouselItems}
            </ScrollView>

            <View style={uiStyles.carouselControls}>
              <TouchableOpacity style={uiStyles.circleButton} onPress={goToPrev} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={uiStyles.circleButton} onPress={goToNext} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={uiStyles.dotsContainer}>
            {promoImages.map((_, index) => (
              <View key={index} style={[uiStyles.dot, currentIndex === index && uiStyles.activeDot]} />
            ))}
          </View>

          {propertyEqubs.length > 0 && (
            <>
              <View style={uiStyles.divider} />
              <Text style={[typography.amharicBold, uiStyles.sectionTitle]}>
                {t?.otherEqubTypes ?? "Other Equb Types"}
              </Text>
              <View style={uiStyles.grid}>
                {propertyEqubs.map((item, index) => (
                  <CategoryItem
                    key={`prop-${index}`}
                    imageSource={item.icon}
                    label={item.label}
                    tint={false}
                    imageStyle={item.imageStyle}
                    onPress={() => handleNav(item.route)}
                  />
                ))}
              </View>
            </>
          )}

          {applianceEqubs.length > 0 && (
            <>
              <View style={uiStyles.divider} />
              <Text style={[typography.amharicBold, uiStyles.sectionTitle]}>
                {t?.newEqubTypes ?? "Appliance Equb Types"}
              </Text>
              <View style={uiStyles.grid}>
                {applianceEqubs.map((item, index) => (
                  <CategoryItem
                    key={`app-${index}`}
                    imageSource={item.icon}
                    label={item.label}
                    tint={false}
                    imageStyle={item.imageStyle}
                    onPress={() => handleNav(item.route)}
                  />
                ))}
              </View>
            </>
          )}

          <View style={uiStyles.divider} />

          <View style={uiStyles.adImageContainer}>
            <Image source={adImageSource} style={styles.adImage} contentFit="cover" transition={200} />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default memo(HomeScreen);
