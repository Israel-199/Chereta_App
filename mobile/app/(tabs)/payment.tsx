import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  InteractionManager,
} from "react-native";
import { Image } from 'expo-image';
import Navbar from "../../component/Navbar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CategoryItem from "../../component/CategoryItem";
import { scale, verticalScale } from "react-native-size-matters";
import { useAuthStore } from "@/store/auth";
import { usePaymentScreenStyles } from "../../styles/paymentItemStyles";

import am from "../../translations/am";
import en from "../../translations/en";
import or from "../../translations/or";
import so from "../../translations/so";
import ti from "../../translations/ti";

import SkeletonLoader from "../../component/SkeletonLoader";
import SuspendedScreen from "../../component/SuspendedScreen";

type ChannelKey =
  | "Telebirr"
  | "CBE"
  | "Dashen"
  | "Coop"
  | "Amhara"
  | "Abyssinia"
  | "Awash"
  | "Safaricom"
  | "Mastercard";

interface Translation {
  paymentTitle: string;
  ourPaymentChannels: string;
  channels: Record<ChannelKey, string>;
}

const SCALE_MAP: Record<string, number> = {
  Telebirr: 2.2,
  CBE: 1.6,
  Coop: 1.7,
  Abyssinia: 2.4,
  Safaricom: 2.2,
  Dashen: 1.3,
  Amhara: 1.3,
  Awash: 1.3,
  Mastercard: 1.8,
};

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const styles = usePaymentScreenStyles();
  const { width } = useWindowDimensions();
  const language = useAuthStore((state) => state.language);
  const profile = useAuthStore((state) => state.profile);
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const t: Translation = useMemo(() => {
    if (language === "አማርኛ") return am as Translation;
    if (language === "Afaan Oromo") return or as Translation;
    if (language === "Af Somali") return so as Translation;
    if (language === "ትግርኛ") return ti as Translation;
    return en as Translation;
  }, [language]);

  const getFontFamily = useCallback(
    (bold = false) => {
      if (language === "አማርኛ" || language === "ትግርኛ") {
        return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
      }
      return bold ? "NotoSans-Bold" : "NotoSans-Regular";
    },
    [language]
  );

  const carouselImages = useMemo(() => [
    require("../../assets/images/carouselpay1.jpg"),
    require("../../assets/images/carouselpay2.jpg"),
    require("../../assets/images/carouselpay3.jpg"),
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % carouselImages.length;
        try {
            scrollRef.current?.scrollTo({ x: next * width, animated: true });
        } catch {}
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [width, carouselImages.length]);

  const triggerLoading = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const paymentChannels = useMemo(() => [
    { key: "Telebirr" as ChannelKey, logo: require("../../assets/images/icons/Telebirr_Logo.png") },
    { key: "CBE" as ChannelKey, logo: require("../../assets/images/icons/CBE_Logo.png") },
    { key: "Dashen" as ChannelKey, logo: require("../../assets/images/icons/dash.png") },
    { key: "Coop" as ChannelKey, logo: require("../../assets/images/icons/coop.png") },
    { key: "Amhara" as ChannelKey, logo: require("../../assets/images/icons/ama.png") },
    { key: "Abyssinia" as ChannelKey, logo: require("../../assets/images/icons/aby.png") },
    { key: "Awash" as ChannelKey, logo: require("../../assets/images/icons/awa.png") },
    { key: "Safaricom" as ChannelKey, logo: require("../../assets/images/icons/saf.png") },
    { key: "Mastercard" as ChannelKey, logo: require("../../assets/images/icons/mastercard.png") },
  ], []);

  const handleChannelPress = useCallback((key: string) => {
  }, []);

  const navIcon = useMemo(() => <MaterialCommunityIcons name="cash" size={22} color="#fff" />, []);
  const refreshIcon = useMemo(() => (
    <MaterialCommunityIcons name="refresh" size={22} color={loading ? "#ccc" : "#fff"} />
  ), [loading]);

  const onScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (!isNaN(index)) setCurrentIndex(index);
  }, [width]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar
        leftIcon={navIcon}
        title={t.paymentTitle}
        firstIcon={refreshIcon}
        onFirstPress={triggerLoading}
      />

      {profile?.status === "SUSPENDED" ? (
        <SuspendedScreen />
      ) : (
        <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
        scrollEventThrottle={16}
      >
        {loading ? (
          <View style={{ padding: scale(5) }}>
            {/* Title Skeleton */}
            <View style={{ alignItems: 'center', marginVertical: verticalScale(10) }}>
              <SkeletonLoader width="60%" height={24} />
            </View>

            {/* Grid Container Skeleton */}
            <View style={{ backgroundColor: "#F9FAFB", borderRadius: 12, marginHorizontal: 10, paddingVertical: verticalScale(10), borderWidth: 1, borderColor: '#E5E7EB' }}>
              <View style={styles.gridContainer}>
                {[...Array(9)].map((_, idx) => (
                  <View key={idx} style={{ width: "31%", alignItems: 'center', marginBottom: 15 }}>
                    {/* Square Icon with Border Radius */}
                    <SkeletonLoader width={55} height={55} style={{ borderRadius: 12 }} />
                    {/* Text Line */}
                    <SkeletonLoader width="80%" height={10} style={{ marginTop: 10, borderRadius: 4 }} />
                  </View>
                ))}
              </View>
            </View>

            {/* Carousel Skeleton */}
            <View style={[styles.carouselContainer, { backgroundColor: '#F3F4F6', borderRadius: 8 }]}>
               <SkeletonLoader width="100%" height="100%" />
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { fontFamily: getFontFamily(true) }]}>{t.ourPaymentChannels}</Text>
            <View style={{ backgroundColor: "#0B3C8A", borderRadius: 25, marginHorizontal: 10, elevation: 4 }}>
             <View style={styles.gridContainer}>
              {paymentChannels.map((channel, idx) => (
                  <CategoryItem
                    key={idx}
                    imageSource={channel.logo}
                    label={t.channels[channel.key]}
                    tint={false}
                    textStyle={{ fontFamily: getFontFamily() }}
                    onPress={() => handleChannelPress(channel.key)}
                    imageStyle={SCALE_MAP[channel.key] ? { transform: [{ scale: SCALE_MAP[channel.key] }] } : {}}
                  />
              ))}
            </View>
            </View>

            <View style={[styles.carouselContainer, { marginTop: 20 }]}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                scrollEventThrottle={16}
              >
                {carouselImages.map((img, index) => (
                  <Image key={index} source={img} style={[styles.carouselImage, { width }]} contentFit="cover" transition={200} />
                ))}
              </ScrollView>
              <View style={{ position: "absolute", bottom: 12, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, flexDirection: "row" }}>
                {carouselImages.map((_, index) => (
                  <View key={index} style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 5, backgroundColor: currentIndex === index ? "#0B3C8A" : "rgba(255,255,255,0.5)" }} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      )}
    </View>
  );
}

export default memo(PaymentScreen);