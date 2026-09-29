import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
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
import {
  useHomeScreenStyles,
  useHomeUIStyles,
} from "../../styles/homeScreenStyles";
import { AuctionItem } from "../../api/chereta";
import { resolveAuctionImage } from "../../utils/auctionMedia";
import {
  formatCountdown,
  isAuctionEnded,
} from "../../utils/countdown";
import { StatusBar } from "expo-status-bar";
import { useLocalizedTypography } from "../../utils/useLocalizedTypography";
import CheretaTermsModal from "../../component/CheretaTermsModal";
import { placeBidWithTerms } from "../../utils/placeBidFlow";
import { useCheretaStore } from "../../store/cheretaStore";
import { useCheretaCache } from "../../store/cheretaCache";
import Toast from "react-native-toast-message";
import {
  LEMON_GREEN,
  CH_SUBMIT_GREEN,
  CH_VIEW_MORE_BLUE,
  CH_SUBMIT_GREEN_DARK,
} from "../../constants/theme";
import CheretaBidInput from "../../component/CheretaBidInput";
import { formatAuctionCodeDisplay } from "../../utils/formatAuctionCode";
import {
  CH_MIN_BID_ETB,
  CH_DEFAULT_MAX_BID,
} from "../../constants/bidding";
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
  onAuctionsPatch: (
    id: string,
    patch: Partial<AuctionItem>
  ) => void;
};

/* =========================================================
   FLEXIBLE SECTION HEADER
   ========================================================= */

type LocalSectionHeaderProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bold: any;
  regular: any;
};

const LocalSectionHeader = ({
  title,
  subtitle,
  icon,
  bold,
  regular,
}: LocalSectionHeaderProps) => {
  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: 16,
        marginBottom: 7,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        {/* SECTION ICON */}

        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#EAF2FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
            flexShrink: 0,
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={17}
            color="#3D5D96"
          />
        </View>

        {/* TITLE + SUBTITLE */}

        <View
          style={{
            flex: 1,
            minWidth: 0,
            paddingTop: 1,
          }}
        >
          <Text
            style={[
              bold,
              {
                fontSize: 17,
                lineHeight: 21,
                color: "#111827",
                flexShrink: 1,
              },
            ]}
          >
            {title}
          </Text>

          {!!subtitle && (
            <Text
              style={[
                regular,
                {
                  fontSize: 12,
                  lineHeight: 15,
                  color: "#6B7280",
                  marginTop: 1,
                  flexShrink: 1,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

/* =========================================================
   AUCTION METRIC CARD
   ========================================================= */

type MetricCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  label: string;
  timerDisplay?: boolean;
  value: string;
  valueColor?: string;
  width?: number;
  bold: any;
  regular: any;
  valueFontSize?: number;
  labelFontSize?: number;
  valueMarginTop?: number;
  flex?: number;
};

const AuctionMetricCard = ({
  icon,
  iconColor,
  iconBackground,
  label,
  timerDisplay = false,
  value,
  valueColor = "#111827",
  width,
  bold,
  regular,
  valueFontSize = 13,
  labelFontSize = 11,
  valueMarginTop = 1,
  flex,
}: MetricCardProps) => {
  return (
    <View
      style={{
        flex: width ? undefined : (flex ?? 1),
        width,
        minWidth: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 0,

        // No outer padding for metric cards
        paddingHorizontal: 0,
        paddingVertical: 0,

        justifyContent: "center",

        // No outer margin for metric cards
        marginHorizontal: 0,
        marginVertical: 0,

        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minWidth: 0,
        }}
      >
        {/* ICON */}

        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: iconBackground,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 4,
            flexShrink: 0,
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={13}
            color={iconColor}
          />
        </View>

        {/* TEXT */}

        <View
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: "center",
          }}
        >
          {/* LABEL */}

          <Text
            style={[
              regular,
              {
                fontSize: labelFontSize,
                color: "#6B7280",
                lineHeight: labelFontSize + 3,
              },
            ]}
            numberOfLines={1}
            {...(!timerDisplay
              ? {
                  adjustsFontSizeToFit: true,
                  minimumFontScale: 0.75,
                }
              : {})}
          >
            {label}
          </Text>

          {/* VALUE */}

          <Text
            style={[
              bold,
              {
                fontSize: valueFontSize,
                color: valueColor,
                lineHeight: valueFontSize + 3,
                marginTop: valueMarginTop,
              },
            ]}
            numberOfLines={1}
            {...(!timerDisplay
              ? {
                  adjustsFontSizeToFit: true,
                  minimumFontScale: 0.55,
                }
              : {})}
            ellipsizeMode="clip"
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
};

/* =========================================================
   TIMER FORMAT
   ========================================================= */

const formatTimerDisplay = (countdown: string) => {
  if (!countdown) {
    return "0s";
  }

  const trimmed = countdown.trim();

  if (
    trimmed.toLowerCase().includes("ended") ||
    trimmed.toLowerCase().includes("auction ended")
  ) {
    return trimmed;
  }

  const parts =
    trimmed.match(/\d+(?:\.\d+)?\s*[dhms]/gi) ?? [];

  if (parts.length > 0) {
    return parts
      .map((part) => part.replace(/\s+/g, ""))
      .join(":");
  }

  return trimmed;
};

/* =========================================================
   AUCTION CAROUSEL
   ========================================================= */

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

  const [bidAmounts, setBidAmounts] =
    useState<Record<string, string>>({});

  const [submittingId, setSubmittingId] =
    useState<string | null>(null);

  const [termsAuction, setTermsAuction] =
    useState<AuctionItem | null>(null);

  const { bold, regular } =
    useLocalizedTypography(language);

  const onScrollEnd = useCallback(
    (event: any) => {
      const index = Math.round(
        event?.nativeEvent?.contentOffset?.x / width
      );

      if (!isNaN(index)) {
        setCurrentIndex(index);
      }
    },
    [width]
  );

  const getBidAmount = (item: AuctionItem) =>
    bidAmounts[item.id] ??
    String(
      Math.max(
        CH_MIN_BID_ETB,
        item.minBid ?? CH_MIN_BID_ETB
      )
    );

  const runBid = async (item: AuctionItem) => {
    if (item.userHasBid) return;

    const amount = parseFloat(
      getBidAmount(item)
    );

    if (
      isNaN(amount) ||
      amount < CH_MIN_BID_ETB
    ) {
      Toast.show({
        type: "error",
        text1:
          t.minBidHint ||
          "Min. bid: 1 ETB",
      });

      return;
    }

    setSubmittingId(item.id);

    try {
      await placeBidWithTerms(
        item.id,
        amount
      );

      onAuctionsPatch(item.id, {
        userHasBid: true,
        userBidAmount: amount,
        bidCount:
          (item.bidCount ?? 0) + 1,
      });

      useCheretaStore
        .getState()
        .bumpMyBids();

      onBidPlaced();

      Toast.show({
        type: "success",
        text1:
          t.bidSuccessTitle ||
          "Bid placed",
        text2: `${item.title} — ${amount.toFixed(
          2
        )} ETB`,
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1:
          e?.response?.data?.message ||
          e?.message ||
          "Bid failed",
      });
    } finally {
      setSubmittingId(null);
      setTermsAuction(null);
    }
  };

  const onSubmitPress = (
    item: AuctionItem
  ) => {
    if (!token) {
      Alert.alert(
        t.signInToBid || "Sign in",
        t.signInToBid
      );

      router.push("/");
      return;
    }

    if (item.userHasBid) return;

    setTermsAuction(item);
  };

  if (!data.length) {
    return (
      <View
        style={{
          marginBottom: 18,
        }}
      >
        <LocalSectionHeader
          title={title}
          subtitle={subtitle}
          icon={sectionIcon}
          bold={bold}
          regular={regular}
        />

        <Text
          style={[
            regular,
            {
              color: "#6B7280",
              textAlign: "center",
              marginTop: 4,
              fontSize: 12,
            },
          ]}
        >
          {t.noCategoryAuctions}
        </Text>
      </View>
    );
  }

  const now =
    Date.now() + serverOffset;

  return (
    <View
      style={{
        marginBottom: 3,
        marginTop: 2,
      }}
    >
      <LocalSectionHeader
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

          const ended =
            isAuctionEnded(
              item.endTime,
              item.status,
              now
            );

          const countdown =
            formatCountdown(
              item.endTime,
              now
            );

          const hasBid =
            !!item.userHasBid;

          const isSubmitting =
            submittingId === item.id;

          const timerDisplay =
            formatTimerDisplay(
              countdown
            );

          const auctionCode =
            formatAuctionCodeDisplay(
              item.auctionCode
            );

          return (
            <View
              key={item.id}
              style={{
                width,
                paddingHorizontal: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 23,
                  overflow: "hidden",
                  elevation: 6,
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                }}
              >
                {/* AUCTION IMAGE */}

                <View
                  style={{
                    position: "relative",
                  }}
                >
                  <Image
                    source={resolveAuctionImage(
                      item.images?.[0] ||
                        "laptop"
                    )}
                    style={{
                      width: "100%",
                      height: 175,
                    }}
                    contentFit="cover"
                  />

                  {/* LIVE BADGE */}

                  {!ended && (
                    <View
                      style={{
                        position: "absolute",
                        top: 9,
                        left: 9,
                        backgroundColor:
                          "rgba(255,255,255,0.95)",
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 20,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor:
                            "#EF4444",
                          marginRight: 5,
                        }}
                      />

                      <Text
                        style={[
                          bold,
                          {
                            color: "#EF4444",
                            fontSize: 10,
                            textTransform:
                              "uppercase",
                            letterSpacing: 0.3,
                          },
                        ]}
                      >
                        {t.liveBadge}
                      </Text>
                    </View>
                  )}

                  {/* BID COUNT */}

                  <View
                    style={{
                      position: "absolute",
                      top: 9,
                      right: 9,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor:
                        "rgba(255,255,255,0.95)",
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: 20,
                      maxWidth: "55%",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="gavel"
                      size={14}
                      color="#3D5D96"
                    />

                    <Text
                      style={[
                        bold,
                        {
                          marginLeft: 4,
                          fontSize: 11,
                          color: "#3D5D96",
                          flexShrink: 1,
                        },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {item.bidCount ?? 0}{" "}
                      {t.bidsLabel || "Bids"}
                    </Text>
                  </View>
                </View>

                {/* CARD CONTENT */}

                <View
                  style={{
                    paddingTop: 7,
                  }}
                >
                  {/* TITLE */}

                  <View
                    style={{
                      paddingHorizontal: 7,
                    }}
                  >
                    <Text
                      style={[
                        bold,
                        {
                          fontSize: 14,
                          lineHeight: 17,
                          color: "#111827",
                          textAlign: "center",
                          marginBottom: 5,
                        },
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {item.title}
                    </Text>
                  </View>

                  {/* =====================================================
                      THREE METRIC CARDS
                      FULL WIDTH - NO OUTER PADDING OR MARGIN
                     ===================================================== */}

                  <View
                    style={{
                      width: "100%",
                      backgroundColor: "#F8FAFC",
                
                      borderWidth: 1,
                      borderColor: "#EEF2F7",

                      // Full-width metric container.
                      // No horizontal/vertical padding.
                      // No negative margin workaround.
                      margin: 0,
                      padding: 0,

                      flexDirection: "row",
                      alignItems: "stretch",
                      overflow: "hidden",
                    }}
                  >
                    {/* SERVICE FEE */}

                    <AuctionMetricCard
                      icon="gavel"
                      iconColor="#4CAF2F"
                      iconBackground="#E9F9C9"
                      label={
                        t.bidServiceFee ||
                        "Service Fee"
                      }
                      value={`${(
                        item.serviceFee ?? 75
                      ).toFixed(2)} Br`}
                      valueColor="#111827"
                      bold={bold}
                      regular={regular}

                      // Increased from 10 to 12
                      labelFontSize={12}

                      valueFontSize={13}
                      valueMarginTop={0}
                    />

                    {/* DIVIDER */}

                    <View
                      style={{
                        width: 1,
                        marginVertical: 4,
                        backgroundColor:
                          "#E5E7EB",
                      }}
                    />

                    {/* AUCTION CODE */}

                    <AuctionMetricCard
                      icon="tag-outline"
                      iconColor="#3574C8"
                      iconBackground="#EAF2FF"
                      label={
                        t.auctionCode ||
                        "Auction Code"
                      }
                      value={auctionCode}
                      valueColor="#111827"
                      bold={bold}
                      regular={regular}

                      // Increased from 10 to 12
                      labelFontSize={12}

                      valueFontSize={13}
                      valueMarginTop={0}
                    />

                    {/* DIVIDER */}

                    <View
                      style={{
                        width: 1,
                        marginVertical: 4,
                        backgroundColor:
                          "#E5E7EB",
                      }}
                    />

                    {/* TIME REMAINING */}

                    <AuctionMetricCard
                      icon="timer-outline"
                      iconColor="#C62828"
                      iconBackground="#FFF0F0"
                      label={
                        ended
                          ? t.auctionEnded ||
                            "Auction Ended"
                          : "Time Remaining"
                      }
                      value={
                        ended
                          ? t.auctionEnded ||
                            "Ended"
                          : timerDisplay
                      }
                      valueColor={
                        ended
                          ? "#6B7280"
                          : "#B91C1C"
                      }
                      bold={bold}
                      regular={regular}
                      timerDisplay={true}
                      labelFontSize={12}
                      valueFontSize={13}
                      valueMarginTop={2}
                      flex={1.28}
                    />
                  </View>

                  {/* BID INPUT + BUTTONS */}

                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingBottom: 7,
                    }}
                  >
                    {/* BID INPUT */}

                    {!ended && (
                      <View
                        style={{
                          opacity:
                            hasBid ? 0.55 : 1,
                          marginTop: 7,
                          marginBottom: 0,
                        }}
                      >
                        <CheretaBidInput
                          language={language}
                          label={
                            t.enterBidAmountLabel ||
                            "Enter bid amount"
                          }
                          value={getBidAmount(item)}
                          disabled={
                            hasBid ||
                            isSubmitting
                          }
                          min={CH_MIN_BID_ETB}
                          max={
                            item.maxBid ??
                            CH_DEFAULT_MAX_BID
                          }
                          step={
                            item.bidStep ?? 1
                          }
                          minHint={
                            t.minBidHint ||
                            "Min. bid: 1 ETB"
                          }
                          onChange={(v) =>
                            setBidAmounts(
                              (p) => ({
                                ...p,
                                [item.id]: v,
                              })
                            )
                          }
                          confirmLabel={
                            t.done || "OK"
                          }
                        />
                      </View>
                    )}

                    {/* SUBMIT + DETAILS */}

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 7,
                        marginTop: 4,
                      }}
                    >
                      {/* SUBMIT BID */}

                      {!ended && (
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent:
                              "center",
                            paddingVertical: 7,
                            paddingHorizontal: 7,
                            borderRadius: 999,
                            backgroundColor:
                              hasBid
                                ? "#9CA3AF"
                                : CH_SUBMIT_GREEN,
                            borderBottomWidth:
                              hasBid ? 0 : 3,
                            borderBottomColor:
                              CH_SUBMIT_GREEN_DARK,
                            shadowColor:
                              hasBid
                                ? "transparent"
                                : "#4A6B28",
                            shadowOffset: {
                              width: 0,
                              height: 2,
                            },
                            shadowOpacity: 0.28,
                            shadowRadius: 4,
                            elevation:
                              hasBid ? 0 : 5,
                            opacity:
                              hasBid ? 0.9 : 1,
                          }}
                          disabled={
                            hasBid ||
                            isSubmitting
                          }
                          onPress={() =>
                            onSubmitPress(item)
                          }
                          activeOpacity={0.85}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator
                              color="#fff"
                            />
                          ) : (
                            <>
                              <MaterialCommunityIcons
                                name="gavel"
                                size={16}
                                color="#fff"
                                style={{
                                  marginRight: 4,
                                }}
                              />

                              <Text
                                style={[
                                  bold,
                                  {
                                    color: "#fff",
                                    fontSize: 12,
                                    letterSpacing: 0,
                                  },
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.7}
                              >
                                {hasBid
                                  ? t.bidClosedForYou
                                  : t.submitBid}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      {/* DETAILS / RESULTS */}

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          paddingVertical: 7,
                          paddingHorizontal: 7,
                          borderRadius: 999,
                          backgroundColor:
                            ended
                              ? "#9CA3AF"
                              : "#fff",
                          borderWidth:
                            ended ? 0 : 2,
                          borderColor:
                            CH_VIEW_MORE_BLUE,
                          shadowColor:
                            ended
                              ? "#000"
                              : CH_VIEW_MORE_BLUE,
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity:
                            ended ? 0.1 : 0.14,
                          shadowRadius: 4,
                          elevation:
                            ended ? 2 : 3,
                        }}
                        onPress={() =>
                          ended
                            ? router.push(
                                `/screen/auction_results?id=${item.id}`
                              )
                            : router.push(
                                `/screen/auction_details?id=${item.id}`
                              )
                        }
                        activeOpacity={0.88}
                      >
                        <Text
                          style={[
                            bold,
                            {
                              color: ended
                                ? "#fff"
                                : CH_VIEW_MORE_BLUE,
                              fontSize: 12,
                              marginRight: 3,
                            },
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                        >
                          {ended
                            ? t.viewResults
                            : t.viewMore}
                        </Text>

                        <MaterialCommunityIcons
                          name={
                            ended
                              ? "trophy-outline"
                              : "arrow-right-circle-outline"
                          }
                          size={16}
                          color={
                            ended
                              ? "#fff"
                              : CH_VIEW_MORE_BLUE
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* CAROUSEL INDICATORS */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        {data.map((_, i) => (
          <View
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor:
                i === currentIndex
                  ? LEMON_GREEN
                  : "#E5E7EB",
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>

      {/* TERMS MODAL */}

      <CheretaTermsModal
        visible={!!termsAuction}
        language={language}
        t={t}
        auctionTitle={termsAuction?.title}
        bidAmount={
          termsAuction
            ? getBidAmount(termsAuction)
            : undefined
        }
        onClose={() =>
          setTermsAuction(null)
        }
        onConfirm={async () => {
          if (termsAuction) {
            await runBid(termsAuction);
          }
        }}
      />
    </View>
  );
};

/* =========================================================
   HOME SCREEN
   ========================================================= */

export default function HomeScreen() {
  const {
    width: windowWidth,
  } = useWindowDimensions();

  const width = Math.min(
    windowWidth,
    600
  );

  const router = useRouter();

  const language = useAuthStore(
    (state) => state.language
  );

  const token = useAuthStore(
    (state) => state.token
  );

  const t = useMemo(
    () =>
      translations[language] ??
      translations.English ??
      {},
    [language]
  );

  const {
    bold,
    regular,
  } = useLocalizedTypography(
    language
  );

  const styles =
    useHomeScreenStyles();

  const uiStyles =
    useHomeUIStyles();

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const cachedAuctions =
    useCheretaCache(
      (s) => s.auctions
    );

  const cachedOffset =
    useCheretaCache(
      (s) => s.serverOffset
    );

  const [
    auctions,
    setAuctions,
  ] = useState<AuctionItem[]>(
    cachedAuctions
  );

  const [
    serverOffset,
    setServerOffset,
  ] = useState(
    cachedOffset
  );

  const [
    tick,
    setTick,
  ] = useState(0);

  const loadAuctions =
    useCallback(
      async () => {
        const list =
          await useCheretaCache
            .getState()
            .refreshAuctions();

        setServerOffset(
          useCheretaCache
            .getState()
            .serverOffset
        );

        setAuctions(list);
      },
      []
    );

  useEffect(() => {
    if (
      cachedAuctions.length
    ) {
      setAuctions(
        cachedAuctions
      );

      setServerOffset(
        cachedOffset
      );
    }
  }, [
    cachedAuctions,
    cachedOffset,
  ]);

  useEffect(() => {
    loadAuctions();
  }, [
    loadAuctions,
  ]);

  useEffect(() => {
    const id =
      setInterval(
        () =>
          setTick(
            (x) => x + 1
          ),
        1000
      );

    return () =>
      clearInterval(id);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAuctions();

      const poll =
        setInterval(
          loadAuctions,
          4000
        );

      return () =>
        clearInterval(
          poll
        );
    }, [
      loadAuctions,
    ])
  );

  const onRefresh =
    useCallback(
      async () => {
        setRefreshing(true);

        await loadAuctions();

        setRefreshing(false);
      },
      [loadAuctions]
    );

  const patchAuction =
    useCallback(
      (
        id: string,
        patch: Partial<AuctionItem>
      ) => {
        setAuctions(
          (prev) =>
            prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    ...patch,
                  }
                : a
            )
        );
      },
      []
    );

  const now =
    Date.now() +
    serverOffset;

  const digital =
    useMemo(
      () =>
        (
          auctions ?? []
        ).filter(
          (a) =>
            a.category ===
              "DIGITAL" &&
            !isAuctionEnded(
              a.endTime,
              a.status,
              now
            )
        ),
      [
        auctions,
        serverOffset,
      ]
    );

  const appliances =
    useMemo(
      () =>
        (
          auctions ?? []
        ).filter(
          (a) =>
            a.category ===
              "APPLIANCE" &&
            !isAuctionEnded(
              a.endTime,
              a.status,
              now
            )
        ),
      [
        auctions,
        serverOffset,
      ]
    );

  return (
    <View
      style={styles.root}
    >
      {/* @ts-ignore */}

      <StatusBar
        style="light"
        backgroundColor="#3D5D96"
      />

      <ImmersiveNavScreen
        scroll={false}
        navbar={
          <Navbar
            leftIcon={
              <MaterialCommunityIcons
                name="gavel"
                size={22}
                color="#fff"
              />
            }
            title={
              t.appName ||
              "Digital Chereta"
            }
            firstIcon={
              <MaterialCommunityIcons
                name="bell"
                size={22}
                color="#fff"
              />
            }
            onFirstPress={() =>
              router.push(
                "/screen/notifications"
              )
            }
            showNotificationBadge
          />
        }
      >
        <CheretaRulesMarquee
          t={t}
          bold={bold}
          regular={regular}
        />

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              tintColor="#3D5D96"
            />
          }
        >
          {/* DIGITAL AUCTIONS */}

          <AuctionCarousel
            title={
              t.specialDigitalAuctions ||
              "Special Digital Auctions"
            }
            subtitle={
              t.specialDigitalAuctionsSubtitle
            }
            sectionIcon="cellphone-link"
            data={digital}
            width={width}
            router={router}
            serverOffset={
              serverOffset
            }
            tick={tick}
            t={t}
            language={
              language
            }
            token={token}
            onBidPlaced={
              loadAuctions
            }
            onAuctionsPatch={
              patchAuction
            }
          />

          <View
            style={
              uiStyles.divider
            }
          />

          {/* HOME APPLIANCES */}

          <AuctionCarousel
            title={
              t.homeAppliancesAuctions ||
              "Home Appliances Auctions"
            }
            subtitle={
              t.homeAppliancesAuctionsSubtitle
            }
            sectionIcon="sofa-outline"
            data={
              appliances
            }
            width={width}
            router={router}
            serverOffset={
              serverOffset
            }
            tick={tick}
            t={t}
            language={
              language
            }
            token={token}
            onBidPlaced={
              loadAuctions
            }
            onAuctionsPatch={
              patchAuction
            }
          />
        </ScrollView>
      </ImmersiveNavScreen>
    </View>
  );
}