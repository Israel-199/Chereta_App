import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const spacing = StyleSheet.create({
  mbXSmall: { marginBottom: verticalScale(4) },
  mbSmall: { marginBottom: verticalScale(8) },
  mbMedium: { marginBottom: verticalScale(20) },
  mbLarge: { marginBottom: verticalScale(30) },
});

export const useResponsiveStyles = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 700;
  const scaleFactor = Math.min(1, width / 360);

  const baseSpacing = Math.min(width, height) * 0.02 * scaleFactor;

  const headerFontSize = moderateScale((isTablet ? 22 : 20) * scaleFactor);
  const textFontSize = moderateScale((isTablet ? 16 : 12) * scaleFactor);
  const otpSize = Math.min(width, height) * 0.12 * scaleFactor;

  const rs = (size: number) => moderateScale(size * scaleFactor);

  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: scale(baseSpacing * 2),
      backgroundColor: "#F8FAFC",
    },
    container: {
      width: "90%",
      maxWidth: 400,
      alignSelf: "center",
    },
    subtitle: {
      fontSize: headerFontSize,
      fontWeight: "600",
      textAlign: "center",
    },
    desc: {
      textAlign: "center",
      color: "#6B7280",
      marginTop: verticalScale(baseSpacing * 0.6),
      fontSize: textFontSize,
    },
    phone: {
      textAlign: "center",
      fontWeight: "600",
      marginTop: verticalScale(baseSpacing * 0.5),
      fontSize: textFontSize,
    },
    otpRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: verticalScale(baseSpacing * 2),
    },
    otpInput: {
      borderWidth: verticalScale(1),
      borderColor: "#E5E7EB",
      borderRadius: moderateScale(10 * scaleFactor),
      width: Math.max(35, Math.min(70, otpSize)),
      height: Math.max(35, Math.min(70, otpSize)),
      textAlign: "center",
      fontSize: headerFontSize,
      backgroundColor: "#fff",
      marginHorizontal: scale(baseSpacing * 0.6),
    },
    logoImage: {
      width: Math.min(width * 0.4, 200 * scaleFactor),
      height: Math.min(width * 0.4, 200 * scaleFactor),
      marginBottom: verticalScale(baseSpacing),
      alignContent: "center",
    },
    logoContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(baseSpacing),
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: scale(baseSpacing * 0.5),
    },
    resendText: {
      color: "#6B7280",
      fontSize: textFontSize,
    },
    timer: {
      backgroundColor: "#E5E7EB",
      borderRadius: moderateScale(12 * scaleFactor),
      paddingHorizontal: scale(baseSpacing * 1.2),
      paddingVertical: verticalScale(baseSpacing * 0.4),
      fontWeight: "600",
      color: "#0B3C8A",
    },
    resendLink: {
      color: "#0B3C8A",
      fontWeight: "600",
      fontSize: textFontSize,
    },
    button: {
      backgroundColor: "#0B3C8A",
      paddingVertical: verticalScale(10 * scaleFactor),
      paddingHorizontal: scale(baseSpacing * 1.5),
      maxWidth: 400,
      borderRadius: moderateScale(10 * scaleFactor),
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 48 * scaleFactor,
    },
    buttonText: {
      color: "#fff",
      fontSize: textFontSize,
      fontWeight: "600",
    },
    securityRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    securityText: {
      marginLeft: scale(baseSpacing * 0.4),
      color: "#6B7280",
      fontSize: rs(12),
      fontWeight: "500",
    },
    dropdownOverlay: {
      position: "absolute",
      top: verticalScale(baseSpacing * 3),
      right: scale(baseSpacing),
      width: Math.min(width * 0.4, 160 * scaleFactor),
      backgroundColor: "#fff",
      borderWidth: verticalScale(1),
      borderColor: "#E5E7EB",
      borderRadius: moderateScale(8 * scaleFactor),
      zIndex: 1000,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4 * scaleFactor),
      elevation: 5,
    },
    dropdownItem: {
      paddingVertical: verticalScale(baseSpacing * 0.8),
      paddingHorizontal: scale(baseSpacing),
      borderBottomWidth: verticalScale(1),
      borderBottomColor: "#E5E7EB",
    },
    dropdownText: {
      fontSize: textFontSize,
      color: "#374151",
    },
  });
};
