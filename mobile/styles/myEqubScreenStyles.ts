import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useMyEqubsScreenStyles = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 700;
  const scaleFactor = Math.min(1, width / 360);
  const baseSpacing = Math.min(width, height) * 0.02 * scaleFactor;

  const rs = (size: number) => moderateScale(size * scaleFactor);

  return StyleSheet.create({
    scrollRoot: { flex: 1, backgroundColor: "#F2F4F7" },
    scrollContent: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
    },
    root: {
      flex: 1,
      backgroundColor: "#F2F4F7",
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
    },

    mainPadding: {
      flex: 1,
      paddingVertical: scale(baseSpacing),
      marginTop: verticalScale(baseSpacing),
    },

    card: {
      backgroundColor: "#fff",
      borderRadius: moderateScale(isTablet ? 16 : 12 * scaleFactor),
      padding: scale(baseSpacing * 1.4),
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: moderateScale(6),
      elevation: 2,
      width: width - scale(baseSpacing * 2), // Card width based on screen width
      marginHorizontal: scale(baseSpacing), // Padding between cards
    },

    carouselContainer: {
      marginVertical: verticalScale(baseSpacing),
    },

    cardTag: {
      position: "absolute",
      top: moderateScale(10),
      right: moderateScale(10),
      backgroundColor: "#81CE06",
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: moderateScale(20),
      justifyContent: "center",
      alignItems: "center",
      minWidth: scale(60),
    },

    tagText: {
      fontSize: rs(9),
      color: "#fff",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      textAlign: "center",
      includeFontPadding: false,
      textAlignVertical: "center",
    },

    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: verticalScale(10),
      marginBottom: verticalScale(10),
    },

    dot: {
      width: rs(6),
      height: rs(6),
      borderRadius: rs(3),
      backgroundColor: "#D1D5DB",
      marginHorizontal: scale(4),
    },

    activeDot: {
      backgroundColor: "#8DB048",
      width: rs(12), // Slightly longer active dot
    },

    nameText: {
      fontSize: isTablet ? moderateScale(20) : rs(16),
      color: "#000080",
      textAlign: "center",
      marginBottom: verticalScale(8),
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(5),
      marginVertical: verticalScale(5),
    },

    balanceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(10),
      marginTop: verticalScale(5),
      marginBottom: verticalScale(20),
    },

    infoLabel: {
      fontSize: isTablet ? moderateScale(18) : rs(15),
      color: "#000080",
    },

    divider: {
      borderTopWidth: 1,
      borderTopColor: "#eee",
      marginBottom: verticalScale(10),
    },

    userIdText: {
      fontSize: isTablet ? moderateScale(14) : rs(12),
      color: "#000080",
      marginBottom: verticalScale(10),
    },

    dateContainer: { alignItems: "flex-end" },
    dateText: {
      fontSize: isTablet ? moderateScale(13) : rs(11),
      color: "#000080",
    },

    columnWrapper: {
      justifyContent: "center",
      marginBottom: verticalScale(baseSpacing),
      // mathematically tuned padding (2.3%) to force FlatList cells to
      // visually expand, rendering gaps identically sized to the Home Screen grid gaps.
      paddingHorizontal: width * 0.023,
    },

    categoryWrapper: {
      flex: 1,
      marginVertical: verticalScale(8),
      alignItems: "center",
      justifyContent: "center",
    },

    logoContainer: {
      alignItems: "center",
    },
    logo: {
      width: isTablet ? scale(220) : scale(130),
      height: isTablet ? verticalScale(220) : verticalScale(180 * scaleFactor),
    },

    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(baseSpacing),
    },
    emptyStateInner: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    },

    iconContainer: {
      backgroundColor: "#fff",
      borderRadius: moderateScale(100),
      padding: scale(30),
      marginBottom: verticalScale(20),
      shadowColor: "#8DB048",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
      borderWidth: 1,
      borderColor: "#E6EEF9",
    },

    iconImage: {
      width: isTablet ? scale(120) : scale(100),
      height: isTablet ? verticalScale(100) : verticalScale(80 * scaleFactor),
      resizeMode: "contain",
    },

    notJoinedText: {
      fontSize: isTablet ? moderateScale(18) : rs(15),
      color: "#1F2937",
      textAlign: "center",
      marginBottom: verticalScale(10),
      paddingHorizontal: scale(20),
      lineHeight: verticalScale(22),
    },

    ctaButton: {
      backgroundColor: "#8DB048",
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(baseSpacing * 1.5),
      borderRadius: moderateScale(12),
      width: "80%",
      shadowColor: "#8DB048",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    ctaText: {
      color: "#fff",
      textAlign: "center",
      fontSize: isTablet ? moderateScale(15) : rs(14),
      letterSpacing: 0.5,
    },
  });
};
