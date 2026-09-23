import React, { useCallback, useMemo, useState, memo, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Modal, InteractionManager, Platform, Pressable, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { usePhoneEqubStore } from "@/store/phoneEqubStore";
import { useRefrigeratorEqubStore } from "@/store/refrigeratorEqubStore";
import { useTvEqubStore } from "@/store/tvEqubStore";
import { useSofaEqubStore } from "@/store/sofaEqubStore";
import SkeletonEqubItem from "@/component/SkeletonEqubItem";
import LoadingDots from "@/component/LoadingDots";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";
import Navbar from "@/component/Navbar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { formatAppDate } from "@/utils/dateUtils";
import SuspendedScreen from "@/component/SuspendedScreen";

const PROPERTY_TYPES = ['TV', 'SOFA', 'REFRIGERATOR', 'PHONE'];
const CARD_PADDING_PERCENT = 5;

const PropertyImageCarousel = memo(({ images, containerWidth }: { images: string[]; containerWidth: number }) => {
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTouching = useRef(false);
  const imgWidth = containerWidth;
  const imgHeight = imgWidth * 0.75; // 4:3 aspect ratio better accommodates mixed product types

  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (isTouching.current) return;
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        scrollRef.current?.scrollTo({ x: nextIndex * imgWidth, animated: true });
        return nextIndex;
      });
    }, 4000);
  }, [images.length, imgWidth]);

  useEffect(() => {
    startAutoSlide();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startAutoSlide]);

  const handleScrollEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / imgWidth);
    setCurrentIndex(idx);
  }, [imgWidth]);

  return (
    <View style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6' }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onTouchStart={() => { isTouching.current = true; }}
        onTouchEnd={() => { isTouching.current = false; startAutoSlide(); }}
        scrollEventThrottle={16}
      >
        {images.map((uri, i) => (
          <View key={i} style={{ width: imgWidth, height: imgHeight, justifyContent: 'center', alignItems: 'center', padding: 8 }}>
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
              resizeMode="contain" // Prevents cropping
            />
          </View>
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 10, paddingTop: 4 }}>
          {images.map((_, i) => (
            <View 
              key={i} 
              style={{ 
                width: i === currentIndex ? 14 : 6, 
                height: 6, 
                borderRadius: 3, 
                backgroundColor: i === currentIndex ? '#000080' : '#D1D5DB', 
                marginHorizontal: 3 
              }} 
            />
          ))}
        </View>
      )}
    </View>
  );
});

const EqubItem = memo(({ item, t, language, onJoin, loadingEqubId, getFontFamily, cardWidth }: any) => {
  const isJoining = loadingEqubId === item.id;
  const router = useRouter();
  const isNavigating = useRef(false);

  const isPropertyType = PROPERTY_TYPES.includes(item.type);
  const propertyImages = useMemo(() => {
    const imgs: string[] = [];
    if (item.frontImage) imgs.push(item.frontImage);
    if (item.backImage) imgs.push(item.backImage);
    return imgs;
  }, [item.frontImage, item.backImage]);

  const handlePayPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    InteractionManager.runAfterInteractions(() => {
      router.push("/(tabs)/payment" as any);
      setTimeout(() => { isNavigating.current = false; }, 1000);
    });
  };

  // Calculate the inner width for the image carousel (card width minus horizontal padding)
  const innerWidth = cardWidth ? cardWidth - (cardWidth * CARD_PADDING_PERCENT * 2 / 100) : Dimensions.get('window').width - 64;

  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: `${CARD_PADDING_PERCENT}%`,
      marginBottom: 12,
    }}>
      <View style={{ minHeight: 48, justifyContent: 'center', marginBottom: 12 }}>
        <Text style={{ fontFamily: getFontFamily(true), fontSize: 16, color: "#000080" }}>
          {item.name} |{" "}
          <Text style={{ color: "#81CE06" }}>
            {item.contributionAmount.toLocaleString()} {t.currencyBirr}
          </Text>
        </Text>
      </View>

      {isPropertyType && propertyImages.length > 0 && (
        <PropertyImageCarousel images={propertyImages} containerWidth={innerWidth} />
      )}

      {isPropertyType && item.propertyModel && (
        <View style={{ backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' }}>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: '#374151', textAlign: 'center' }}>
            {item.propertyModel}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.equbMembers}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{item.numberOfMembers} {t.members}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.startDate}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{formatAppDate(item.startDate, language, t)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.endDate}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{formatAppDate(item.endDate, language, t)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: getFontFamily(false), fontSize: 13, color: "#6B7280" }}>{t.total}</Text>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: "#000000" }}>{item.total.toLocaleString()} {t.currencyBirr}</Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: "#E8ECF0", marginTop: 8, marginBottom: 18, width: "100%" }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={handlePayPress}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => ({
            backgroundColor: "#0B3C8A",
            height: 48,
            paddingHorizontal: "6%",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            maxWidth: "45%",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: "#fff", textAlign: "center", fontFamily: getFontFamily(true), fontSize: 13 }}>
            {t.pay}
          </Text>
        </Pressable>

        <Pressable
          disabled={item.isMember || isJoining}
          onPress={() => onJoin(item.id)}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => ({
            backgroundColor: item.isMember ? "#ccc" : "#81CE06",
            height: 48,
            paddingHorizontal: "6%",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            maxWidth: "45%",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: "#fff", textAlign: "center", fontFamily: getFontFamily(true), fontSize: 13, flexShrink: 1 }}>
            {item.isMember ? t.joined : t.joinEqub}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

// Map of equb type to store hook, load function name, and join type for terms
const EQUB_TYPE_CONFIG: Record<string, { storeHook: any; loadFn: string; joinType: string }> = {
  phone: { storeHook: usePhoneEqubStore, loadFn: "loadPhoneEqubs", joinType: "phone" },
  refrigerator: { storeHook: useRefrigeratorEqubStore, loadFn: "loadRefrigeratorEqubs", joinType: "refrigerator" },
  tv: { storeHook: useTvEqubStore, loadFn: "loadTvEqubs", joinType: "tv" },
  sofa: { storeHook: useSofaEqubStore, loadFn: "loadSofaEqubs", joinType: "sofa" },
};

// Map of equb type to translation key for title
const TITLE_KEYS: Record<string, string> = {
  phone: "phoneEqub",
  refrigerator: "refrigeratorEqub",
  tv: "tvEqub",
  sofa: "sofaEqub",
};

export default function PhoneEqubList() {
  const insets = useSafeAreaInsets();
  const { type: rawType } = useLocalSearchParams<{ type?: string }>();
  const equbType = (rawType || "phone").toLowerCase();

  const language = useAuthStore((state) => state.language);
  const profile = useAuthStore((state) => state.profile);
  const router = useRouter();
  const [loadingEqubId, setLoadingEqubId] = useState<string | null>(null);

  // Select the right store based on equb type
  const config = EQUB_TYPE_CONFIG[equbType] || EQUB_TYPE_CONFIG.phone;
  const equbs = config.storeHook((state: any) => state.equbs);
  const fetching = config.storeHook((state: any) => state.fetching);
  const loadEqubs = config.storeHook((state: any) => state[config.loadFn]);

  useFocusEffect(
    useCallback(() => {
      // Always refresh when the screen is focused — silently in the background
      // If we already have cached data, the user sees it instantly while new data loads
      InteractionManager.runAfterInteractions(() => loadEqubs());
    }, [loadEqubs])
  );

  const t = useMemo(() => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  }, [language]);

  const titleKey = TITLE_KEYS[equbType] || "phoneEqub";
  const screenTitle = (t as any)[titleKey] || "Equb";

  const getFontFamily = useCallback((bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular"
      : bold ? "NotoSans-Bold" : "NotoSans-Regular",
    [language]
  );

  const handleJoin = useCallback((equbId: string) => {
    setLoadingEqubId(equbId);
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        router.push({ pathname: "/screen/termsOfService", params: { equbId, type: config.joinType } });
        setLoadingEqubId(null);
      });
    }, 400);
  }, [router, config.joinType]);

  const renderSkeleton = useCallback((_: any, idx: number) => <SkeletonEqubItem key={idx} />, []);
  const renderItem = useCallback(({ item }: any) => (
    <EqubItem item={item} t={t} language={language} onJoin={handleJoin} loadingEqubId={loadingEqubId} getFontFamily={getFontFamily} />
  ), [t, language, handleJoin, loadingEqubId, getFontFamily]);

  const navBackIcon = useMemo(() => (
    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
  ), [router]);

  const refreshIcon = useMemo(() => (
    <TouchableOpacity onPress={() => loadEqubs(true)} disabled={fetching} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <MaterialCommunityIcons name="refresh" size={22} color={fetching ? "#ccc" : "#fff"} />
    </TouchableOpacity>
  ), [fetching, loadEqubs]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <Navbar leftIcon={navBackIcon} title={screenTitle} secondIcon={refreshIcon} />
      {profile?.status === "SUSPENDED" ? (
        <SuspendedScreen />
      ) : fetching ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, width: "100%", maxWidth: 600, alignSelf: "center" }}>
          {[...Array(3)].map(renderSkeleton)}
        </ScrollView>
      ) : equbs.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 16, color: "#8E99A4" }}>{t.noEqubs}</Text>
        </View>
      ) : (
        <FlatList
          data={equbs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom, width: "100%", maxWidth: 600, alignSelf: "center" }}
          getItemLayout={(_, index) => (
            { length: 240, offset: 240 * index, index }
          )}
        />
      )}
      <Modal transparent visible={loadingEqubId !== null} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" }}>
          <LoadingDots />
        </View>
      </Modal>
    </View>
  );
}
