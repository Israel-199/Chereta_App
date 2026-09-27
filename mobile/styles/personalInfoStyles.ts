import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const usePersonalInfoStyles = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 700;
  const scaleFactor = Math.min(1, width / 360);
  const baseSpacing = Math.min(width, height) * 0.02 * scaleFactor;

  const scaleFont = (size: number) => {
    if (isTablet) return moderateScale(size * 1.2);
    return moderateScale(size * scaleFactor);
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
      padding: scale(baseSpacing * 1.2),
      backgroundColor: "#fff",
    },
    header: {
      fontSize: scaleFont(18),
      marginBottom: verticalScale(baseSpacing * 1.5),
      textAlign: "center",
      color: "#8DB048",
    },
    sectionTitle: {
      fontSize: scaleFont(18),
      marginBottom: verticalScale(baseSpacing),
      color: "#111827",
      fontWeight: "600",
    },
    input: {
      borderWidth: verticalScale(1),
      borderColor: "#ccc",
      borderRadius: moderateScale(8 * scaleFactor),
      paddingHorizontal: scale(baseSpacing * 2),
      paddingVertical: verticalScale(baseSpacing * 1.3),
      marginBottom: verticalScale(baseSpacing * 2),
      fontSize: scaleFont(12),
      backgroundColor: "#fff",
    },
    label: {
      fontSize: scaleFont(12),
      color: "#6B7280",
      marginBottom: verticalScale(baseSpacing * 0.4),
    },
    button: {
      backgroundColor: "#8DB048",
      height: verticalScale(50 * scaleFactor),
      justifyContent: "center",
      borderRadius: moderateScale(8 * scaleFactor),
      alignItems: "center",
      marginTop: verticalScale(baseSpacing * 1.5),
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: scaleFont(14),
      fontWeight: "600",
    },
    footerNote: {
      textAlign: "center",
      fontSize: scaleFont(12),
      color: "#6B7280",
      marginTop: verticalScale(baseSpacing),
    },
    logoImage: {
      width: Math.min(width * 0.55, 240 * scaleFactor),
      height: Math.min(width * 0.55, 240 * scaleFactor),
      alignSelf: "center",
    },
  });
};
