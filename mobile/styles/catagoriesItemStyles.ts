import { StyleSheet, useWindowDimensions, Platform } from "react-native";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";

export const useCategoryItemStyles = (size: "small" | "medium" | "large" = "medium") => {
  const { width } = useWindowDimensions();
  const scaleFactor = Math.min(1, width / 360);

  // Number of columns based on width
  const columns = width > 1000 ? 6 : width > 768 ? 4 : 3;

  // Proportional Percentages: We mathematically clone the Samsung A10's 
  // exact spatial aesthetic and lock it via strict percentage constraints.
  // This guarantees shape, aspect gap, and geometry will never break on iPads/other phones.
  const containerPadding = width * 0.08; 
  const itemGap = width * 0.033; // Exactly equal to 12px gap on a 360px screen
  
  // Calculate width to fit perfectly in columns
  const boxWidth = (width - containerPadding - (itemGap * (columns - 1))) / columns;

  // Proportional scaling: Strictly map internal font and image sizes to the calculated card dimension.
  // This guarantees that if the square gets larger/smaller, the inside content perfectly follows suit.
  const fontSize = Math.max(9, boxWidth * 0.095); // Slightly decreased font scaling ratio
  
  const imageSize = Math.max(24, boxWidth * 0.32); // Slightly decreased image scaling ratio

  return StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: width * 0.04,
      paddingVertical: verticalScale(10 * scaleFactor),
    },

    item: {
      width: boxWidth,
      height: boxWidth * 0.9, // Slightly shorter than the width for a landscape rectangle look
      alignItems: "center",
      justifyContent: "center",
    },

    iconBox: {
      width: "100%",
      height: "100%",
      borderRadius: moderateScale(16 * scaleFactor),
      borderTopRightRadius: moderateScale(30 * scaleFactor),
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F3F7",
      
      shadowColor: "#0B3C8A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
      padding: verticalScale(5 * scaleFactor),
      overflow: Platform.OS === 'ios' ? "hidden" : "visible",
    },

    image: {
      width: imageSize,
      height: imageSize * 0.8,
      resizeMode: "contain",
      marginBottom: verticalScale(6 * scaleFactor),
    },

    label: {
      fontSize: fontSize,
      color: "#1F2937",
      textAlign: "center",
      lineHeight: fontSize * 1.2,
      paddingHorizontal: 4,
    },

    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(136, 148, 216, 0.75)",
      justifyContent: "center",
      alignItems: "center",
      // Z-index ensures it covers the icon and text
      zIndex: 10,
      borderRadius: moderateScale(16 * scaleFactor),
      borderTopRightRadius: moderateScale(30 * scaleFactor),
    },

    overlayText: {
      color: "#fff",
      fontSize: fontSize * 1.1, // Slightly larger than standard label
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: 0.5,
      paddingHorizontal: 4,
    },
  });
};

export const useCategoryIconSize = () => {
  const { width } = useWindowDimensions();
  const columns = width > 1000 ? 6 : width > 768 ? 4 : 3;
  
  const containerPadding = width * 0.08; 
  const itemGap = width * 0.033; 
  
  const boxWidth = (width - containerPadding - (itemGap * (columns - 1))) / columns;
  
  // Vector icons scale perfectly to 32% of the card width, identical to the image scaling natively
  return Math.max(24, boxWidth * 0.32);
};
