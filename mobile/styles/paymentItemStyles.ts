import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { verticalScale, moderateScale, scale } from "react-native-size-matters";

export const usePaymentScreenStyles = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isSmallPhone = width < 360;
    const isTablet = width >= 768 && width < 1024;
    const isLargeScreen = width >= 1024;

    const scaleFactor = Math.min(1, width / 360);
    const baseSpacing = Math.min(width, height) * 0.02 * scaleFactor;

    const safeFont = (size: number) => {
      if (isLargeScreen) return moderateScale(size * 1.35);
      if (isTablet) return moderateScale(size * 1.2);
      return moderateScale(size * scaleFactor);
    };

    return StyleSheet.create({
      center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFF",
      },

      sectionTitle: {
        fontSize: safeFont(isTablet ? 20 : 16),
        marginVertical: verticalScale(baseSpacing * 1.5),
        color: "#000080",
        textAlign: "center",
        fontWeight: "600",
        letterSpacing: 0.2,
      },

      carouselContainer: {
        width: "98%",
        maxWidth: 600,
        height: height * (isLargeScreen ? 0.38 : isTablet ? 0.35 : 0.44),

        borderRadius: moderateScale(isTablet ? 24 : 18 * scaleFactor),
        overflow: "hidden",
        marginTop: verticalScale(baseSpacing * 1.2),
        alignSelf: "center",
      },

      carouselImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },

      gridContainer: {
        width: "100%",
        maxWidth: 600,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignSelf: "center",
        paddingHorizontal: scale(10 * scaleFactor),
        paddingVertical: verticalScale(15 * scaleFactor),
        rowGap: verticalScale(15 * scaleFactor),
      },
    });
  }, [width, height]);
};
