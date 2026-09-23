import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useHomeScreenStyles = () => {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  const scaleFactor = Math.min(1, width / 360);
  const baseSpacing = Math.min(width, height) * 0.02;

  const responsiveSize = (size: number) => {
    if (isLargeScreen) return moderateScale(size * 1.35);
    if (isTablet) return moderateScale(size * 1.2);
    return moderateScale(size * scaleFactor);
  };

  return StyleSheet.create({
    root: {
      flex: 1,
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
      backgroundColor: "#F2F4F7",
    },

    skeletonPadding: {
      padding: verticalScale(14),
    },

    skeletonTitleStyle: {
      borderRadius: responsiveSize(6),
      alignSelf: "center",
      marginVertical: verticalScale(baseSpacing * 0.8),
    },

    skeletonCarouselStyle: {
      borderRadius: responsiveSize(8),
      marginVertical: verticalScale(baseSpacing * 0.8),
    },

    skeletonAdStyle: {
      borderRadius: responsiveSize(isTablet ? 24 : 20),
      marginHorizontal: scale(baseSpacing * 0.6),
      marginVertical: verticalScale(baseSpacing * 0.8),
    },

    scrollContent: {
      paddingBottom: verticalScale(baseSpacing * 0.5),
    },

    adImage: {
      width: "100%",
      height: "100%",
    },
  });
};

export const useHomeUIStyles = () => {
  const { width: windowWidth, height } = useWindowDimensions();
  const width = Math.min(windowWidth, 600);

  const isSmallPhone = width < 360;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  const scaleFactor = Math.min(1, width / 360);
  const baseSpacing = Math.min(width, height) * 0.02;

  const responsiveSize = (size: number) => {
    if (isLargeScreen) return moderateScale(size * 1.35);
    if (isTablet) return moderateScale(size * 1.2);
    return moderateScale(size * scaleFactor);
  };

  return StyleSheet.create({
    adImageContainer: {
      marginHorizontal: scale(baseSpacing * 0.6),
      height: verticalScale(
        isLargeScreen ? 220 : isTablet ? 220 : 180 * scaleFactor,
      ),
      borderRadius: responsiveSize(isTablet ? 24 : 20),
      overflow: "hidden",
      marginTop: verticalScale(8),
      marginBottom: 0,
      backgroundColor: "#fff",
      // Add subtle shadow for premium feel
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    sectionTitle: {
      marginVertical: verticalScale(baseSpacing * 1.2),
      fontSize: responsiveSize(isTablet ? 20 : 16),
      textAlign: "center",
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between", // Distribute 3 items evenly

      marginVertical: verticalScale(baseSpacing * 0.6),

      backgroundColor: "#0B3C8A",
      paddingVertical: verticalScale(baseSpacing * 1.5),
      paddingHorizontal: scale(baseSpacing * 1.5),

      borderRadius: responsiveSize(isTablet ? 24 : 20),

      marginHorizontal: scale(baseSpacing * 0.6),
      marginBottom: verticalScale(baseSpacing),
    },


    divider: {
      height: verticalScale(1),
      backgroundColor: "#d3d3e9",
      width: "100%",
    },

    promoContainer: {
      width: "100%",
      height: verticalScale(
        isLargeScreen ? 140 : isTablet ? 100 : 80 * scaleFactor, // Decreased a bit more
      ),
      marginTop: verticalScale(baseSpacing * 0.8),
      position: "relative",
    },

    promoImage: {
      width: width - scale(baseSpacing * 2.8), // Smaller width to allow peeking
      height: "100%",
      resizeMode: "cover",
      borderRadius: responsiveSize(8),
      marginHorizontal: scale(baseSpacing * 1.4), // Center it with space for peeking
    },

    carouselControls: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: scale(baseSpacing),
    },

    circleButton: {
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: responsiveSize(18),
      padding: scale(isSmallPhone ? baseSpacing * 0.5 : baseSpacing * 0.4),
      justifyContent: "center",
      alignItems: "center",
    },

    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: verticalScale(baseSpacing * 0.4),
      alignSelf: "center",
      paddingVertical: verticalScale(4),
    },

    dot: {
      width: responsiveSize(6),
      height: responsiveSize(6),
      borderRadius: responsiveSize(3),
      backgroundColor: "#D1D5DB",
      marginHorizontal: scale(4),
    },
    activeDot: {
      backgroundColor: "#0B3C8A",
    },

  });
};
