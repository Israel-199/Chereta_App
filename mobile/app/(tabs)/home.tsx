import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Modal, 
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import Navbar from "../../component/Navbar";
import ImmersiveNavScreen from "../../component/ImmersiveNavScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import { useHomeScreenStyles, useHomeUIStyles } from "../../styles/homeScreenStyles";
import { AuctionItem } from "../../api/chereta";
import { resolveAuctionImage } from "../../utils/auctionMedia";
import { formatCountdown, isAuctionEnded } from "../../utils/countdown";
import { StatusBar } from "expo-status-bar";
import { useLocalizedTypography } from "../../utils/useLocalizedTypography";
import CheretaTermsModal from "../../component/CheretaTermsModal";
import { placeBidWithTerms } from "../../utils/placeBidFlow";
import { useCheretaStore } from "../../store/cheretaStore";
import { useCheretaCache } from "../../store/cheretaCache";
import Toast from "react-native-toast-message";
import { LEMON_GREEN, CH_SUBMIT_GREEN, CH_VIEW_MORE_BLUE, CH_SUBMIT_GREEN_DARK } from "../../constants/theme";
import CheretaBidInput from "../../component/CheretaBidInput";
import CheretaSectionHeader from "../../component/CheretaSectionHeader";
import AuctionMetricCarousel, { buildAuctionMetrics } from "../../component/AuctionMetricCarousel";
import { formatAuctionCodeDisplay } from "../../utils/formatAuctionCode";
import { CH_MIN_BID_ETB, CH_DEFAULT_MAX_BID } from "../../constants/bidding";
import CheretaRulesMarquee from "../../component/CheretaRulesMarquee";



type CarouselProps = {
  title: string;
  subtitle?: string;
  sectionIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  data: AuctionItem[];
  width: number;
  router: ReturnType<typeof useRouter>;
  serverOffset: number;
  tick: number;
  t: Record<string, string>;
  language: string;
  token: string | null;
  onBidPlaced: () => void;
  onAuctionsPatch: (id: string, patch: Partial<AuctionItem>) => void;
};

const AuctionCarousel = ({
  title,
  subtitle,
  sectionIcon = "tag-multiple-outline",
  data,
  width,
  router,
  serverOffset,
  tick,
  t,
  language,
  token,
  onBidPlaced,
  onAuctionsPatch,
}: CarouselProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [termsAuction, setTermsAuction] = useState<AuctionItem | null>(null);
  const { bold, regular } = useLocalizedTypography(language);

  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % data.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [data.length, width]);

  const onScrollEnd = useCallback(
    (event: any) => {
      const index = Math.round(event?.nativeEvent?.contentOffset?.x / width);
      if (!isNaN(index)) setCurrentIndex(index);
    },
    [width],
  );

  const getBidAmount = (item: AuctionItem) =>
    bidAmounts[item.id] ?? String(Math.max(CH_MIN_BID_ETB, item.minBid ?? CH_MIN_BID_ETB));

  const cardBidDisplay = (item: AuctionItem) => {
    if (item.userHasBid && item.userBidAmount != null) {
      return `${item.userBidAmount.toFixed(2)} ETB`;
    }
    const raw = getBidAmount(item);
    const n = parseFloat(raw);
    return `${Number.isNaN(n) ? CH_MIN_BID_ETB : n} ETB`;
  };

  const runBid = async (item: AuctionItem) => {
    if (item.userHasBid) return;
    const amount = parseFloat(getBidAmount(item));
    if (isNaN(amount) || amount < CH_MIN_BID_ETB) {
      Toast.show({ type: "error", text1: t.minBidHint || "Min. bid: 1 ETB" });
      return;
    }
    setSubmittingId(item.id);
    try {
      await placeBidWithTerms(item.id, amount);
      onAuctionsPatch(item.id, {
        userHasBid: true,
        userBidAmount: amount,
        bidCount: (item.bidCount ?? 0) + 1,
      });
      useCheretaStore.getState().bumpMyBids();
      onBidPlaced();
      Toast.show({
        type: "success",
        text1: t.bidSuccessTitle || "Bid placed",
        text2: `${item.title} — ${amount.toFixed(2)} ETB`,
      });
    } catch (e: any) {
      Toast.show({ type: "error", text1: e?.response?.data?.message || e?.message || "Bid failed" });
    } finally {
      setSubmittingId(null);
      setTermsAuction(null);
    }
  };

  const onSubmitPress = (item: AuctionItem) => {
    if (!token) {
      Alert.alert(t.signInToBid || "Sign in", t.signInToBid);
      router.push("/");
      return;
    }
    if (item.userHasBid) return;
    setTermsAuction(item);
  };

  if (!data.length) {
    return (
      <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
        <CheretaSectionHeader
          title={title}
          subtitle={subtitle}
          icon={sectionIcon}
          bold={bold}
          regular={regular}
        />
        <Text style={[regular, { color: "#6B7280", textAlign: "center", marginTop: 8 }]}>
          {t.noCategoryAuctions}
        </Text>
      </View>
    );
  }

  const now = Date.now() + serverOffset;

  return (
    <View style={{ marginBottom: 24, marginTop: 4 }}>
      <CheretaSectionHeader
        title={title}
        subtitle={subtitle}
        icon={sectionIcon}
        bold={bold}
        regular={regular}
      />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {data.map((item) => {
          void tick;
          const ended = isAuctionEnded(item.endTime, item.status, now);
          const countdown = formatCountdown(item.endTime, now);
          const hasBid = !!item.userHasBid;
          const isSubmitting = submittingId === item.id;

          return (
            <View key={item.id} style={{ width, paddingHorizontal: 16 }}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 26,
                  overflow: "hidden",
                  elevation: 6,
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={resolveAuctionImage(item.images?.[0] || "laptop")}
                    style={{ width: "100%", height: 210 }}
                    contentFit="cover"
                  />
                  {!ended && (
                    <View
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                      }}
                    >
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#EF4444", marginRight: 6 }} />
                      <Text style={[bold, { color: "#EF4444", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }]}>{t.liveBadge}</Text>
                    </View>
                  )}
                  <View
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.95)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      maxWidth: "55%",
                    }}
                  >
                    <MaterialCommunityIcons name="gavel" size={16} color="#3D5D96" />
                    <Text
                      style={[bold, { marginLeft: 6, fontSize: 13, color: "#3D5D96", flexShrink: 1 }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {item.bidCount ?? 0} {t.bidsLabel || "Bids"}
                    </Text>
                  </View>
                </View>

                <View style={{ padding: 18 }}>
                  <Text style={[bold, { fontSize: 19, color: "#111827", textAlign: "center", marginBottom: 16 }]} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#F3F4F6",
                    }}
                  >
                    <AuctionMetricCarousel
                      bold={bold}
                      regular={regular}
                      metrics={buildAuctionMetrics({
                        serviceFeeLabel: t.bidServiceFee,
                        serviceFee: item.serviceFee ?? 75,
                        codeLabel: t.auctionCode,
                        auctionCode: formatAuctionCodeDisplay(item.auctionCode),
                        ended,
                        countdown,
                        endedLabel: t.auctionEnded,
                        bidsLabel: t.bidsLabel,
                        bidCount: item.bidCount ?? 0,
                      })}
                    />
                  </View>

                  {!ended && (
                    <View style={{ marginTop: 14, opacity: hasBid ? 0.55 : 1 }}>
                      <CheretaBidInput
                        language={language}
                        label={t.enterBidAmountLabel || "Enter bid amount"}
                        value={getBidAmount(item)}
                        disabled={hasBid || isSubmitting}
                        min={CH_MIN_BID_ETB}
                        max={item.maxBid ?? CH_DEFAULT_MAX_BID}
                        step={item.bidStep ?? 1}
                        minHint={t.minBidHint || "Min. bid: 1 ETB"}
                        onChange={(v) => setBidAmounts((p) => ({ ...p, [item.id]: v }))}
                        confirmLabel={t.done || "OK"}
                      />

                      <TouchableOpacity
                        style={{
                          marginTop: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 15,
                          paddingHorizontal: 20,
                          borderRadius: 999,
                          backgroundColor: hasBid ? "#9CA3AF" : CH_SUBMIT_GREEN,
                          borderBottomWidth: hasBid ? 0 : 4,
                          borderBottomColor: CH_SUBMIT_GREEN_DARK,
                          shadowColor: hasBid ? "transparent" : "#4A6B28",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.35,
                          shadowRadius: 6,
                          elevation: hasBid ? 0 : 8,
                          opacity: hasBid ? 0.9 : 1,
                        }}
                        disabled={hasBid || isSubmitting}
                        onPress={() => onSubmitPress(item)}
                        activeOpacity={0.85}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <MaterialCommunityIcons name="gavel" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={[bold, { color: "#fff", fontSize: 16, letterSpacing: 0.3 }]}>
                              {hasBid ? t.bidClosedForYou : t.submitBid}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderRadius: 999,
                      backgroundColor: ended ? "#9CA3AF" : "#fff",
                      borderWidth: ended ? 0 : 2,
                      borderColor: CH_VIEW_MORE_BLUE,
                      shadowColor: ended ? "#000" : CH_VIEW_MORE_BLUE,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: ended ? 0.1 : 0.18,
                      shadowRadius: 6,
                      elevation: ended ? 2 : 4,
                    }}
                    onPress={() =>
                      ended
                        ? router.push(`/screen/auction_results?id=${item.id}`)
                        : router.push(`/screen/auction_details?id=${item.id}`)
                    }
                    activeOpacity={0.88}
                  >
                    <Text style={[bold, { color: ended ? "#fff" : CH_VIEW_MORE_BLUE, fontSize: 15, marginRight: 6 }]}>
                      {ended ? t.viewResults : t.viewMore}
                    </Text>
                    <MaterialCommunityIcons
                      name={ended ? "trophy-outline" : "arrow-right-circle-outline"}
                      size={20}
                      color={ended ? "#fff" : CH_VIEW_MORE_BLUE}
                    />
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, justifyContent: "center" }}>
                    <MaterialCommunityIcons name="shield-check" size={16} color="#22C55E" />
                    <Text style={[regular, { marginLeft: 6, fontSize: 11, color: "#6B7280", letterSpacing: 0.5, textAlign: "center" }]}>
                      {t.termsFooter?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12 }}>
        {data.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIndex ? LEMON_GREEN : "#E5E7EB",
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      <CheretaTermsModal
        visible={!!termsAuction}
        language={language}
        t={t}
        auctionTitle={termsAuction?.title}
        bidAmount={termsAuction ? getBidAmount(termsAuction) : undefined}
        onClose={() => setTermsAuction(null)}
        onConfirm={async () => {
          if (termsAuction) await runBid(termsAuction);
        }}
      />
    </View>
  );
};

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 600);
  const router = useRouter();
  const language = useAuthStore((state) => state.language);
  const token = useAuthStore((state) => state.token);
  const t = useMemo(() => translations[language] ?? translations.English ?? {}, [language]);
  const { bold, regular } = useLocalizedTypography(language);
  const styles = useHomeScreenStyles();
  const uiStyles = useHomeUIStyles();
  const [refreshing, setRefreshing] = useState(false);
  const cachedAuctions = useCheretaCache((s) => s.auctions);
  const cachedOffset = useCheretaCache((s) => s.serverOffset);
  const [auctions, setAuctions] = useState<AuctionItem[]>(cachedAuctions);
  const [serverOffset, setServerOffset] = useState(cachedOffset);
  const [tick, setTick] = useState(0);

  const mainScrollRef = useRef<ScrollView>(null);
  const [mainIndex, setMainIndex] = useState(0);

  const loadAuctions = useCallback(async () => {
    const list = await useCheretaCache.getState().refreshAuctions();
    setServerOffset(useCheretaCache.getState().serverOffset);
    setAuctions(list);
  }, []);

  useEffect(() => {
    if (cachedAuctions.length) {
      setAuctions(cachedAuctions);
      setServerOffset(cachedOffset);
    }
  }, [cachedAuctions, cachedOffset]);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAuctions();
      const poll = setInterval(loadAuctions, 4000);
      return () => clearInterval(poll);
    }, [loadAuctions]),
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAuctions();
    setRefreshing(false);
  }, [loadAuctions]);

  const patchAuction = useCallback((id: string, patch: Partial<AuctionItem>) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const now = Date.now() + serverOffset;
  const digital = useMemo(() => (auctions ?? []).filter((a) => a.category === "DIGITAL" && !isAuctionEnded(a.endTime, a.status, now)), [auctions, serverOffset]);
  const appliances = useMemo(() => (auctions ?? []).filter((a) => a.category === "APPLIANCE" && !isAuctionEnded(a.endTime, a.status, now)), [auctions, serverOffset]);
  const endedAuctions = useMemo(() => (auctions ?? []).filter((a) => isAuctionEnded(a.endTime, a.status, now)), [auctions, serverOffset]);

  return (
    <View style={styles.root}>
      {/* @ts-ignore */}
      <StatusBar style="light" backgroundColor="#3D5D96" />
      <ImmersiveNavScreen
        navbar={
          <Navbar
            leftIcon={<MaterialCommunityIcons name="gavel" size={22} color="#fff" />}
            title={t.appName || "Digital Chereta"}
            firstIcon={<MaterialCommunityIcons name="bell" size={22} color="#fff" />}
            onFirstPress={() => router.push("/screen/notifications")}
            showNotificationBadge
          />
        }
        contentContainerStyle={styles.scrollContent}
        scrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5D96" />,
        }}
      >
        <CheretaRulesMarquee
          t={t}
          bold={bold}
          regular={regular}
        />

        <AuctionCarousel
          title={t.specialDigitalAuctions || "Special Digital Auctions"}
          subtitle={t.specialDigitalAuctionsSubtitle}
          sectionIcon="cellphone-link"
          data={digital}
          width={width}
          router={router}
          serverOffset={serverOffset}
          tick={tick}
          t={t}
          language={language}
          token={token}
          onBidPlaced={loadAuctions}
          onAuctionsPatch={patchAuction}
        />

        <View style={uiStyles.divider} />

        <AuctionCarousel
          title={t.homeAppliancesAuctions || "Home Appliances Auctions"}
          subtitle={t.homeAppliancesAuctionsSubtitle}
          sectionIcon="sofa-outline"
          data={appliances}
          width={width}
          router={router}
          serverOffset={serverOffset}
          tick={tick}
          t={t}
          language={language}
          token={token}
          onBidPlaced={loadAuctions}
          onAuctionsPatch={patchAuction}
        />
        
        {endedAuctions.length > 0 && (
          <>
            <View style={uiStyles.divider} />
            <AuctionCarousel
              title={t.auctionEnded || "Ended Auctions"}
              subtitle={t.endedAuctionsSubtitle}
              sectionIcon="flag-checkered"
              data={endedAuctions}
              width={width}
              router={router}
              serverOffset={serverOffset}
              tick={tick}
              t={t}
              language={language}
              token={token}
              onBidPlaced={loadAuctions}
              onAuctionsPatch={patchAuction}
            />
          </>
        )}
      </ImmersiveNavScreen>
    </View>
  );
}
