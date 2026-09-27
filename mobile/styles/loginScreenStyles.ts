import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useLoginScreenStyles = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 700;
  const isSmall = width < 360;
  const isShort = height < 650;
  const scaleFactor = Math.min(1, width / 360);
  const fontScale = isTablet ? 1.2 : 1;

  const rs = (size: number) => {
    if (isTablet) return moderateScale(size * fontScale);
    return moderateScale(size * scaleFactor);
  };

  return StyleSheet.create({
    navbarContainer: {
      backgroundColor: "#3D5D96",
    },

    navbar: {
      height: verticalScale(isTablet ? 58 : 52),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: scale(16 * scaleFactor),
      backgroundColor: "#3D5D96",
    },


    navLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12 * scaleFactor),
    },

    navTitle: {
      fontSize: rs(16),
      color: "#fff",
      includeFontPadding: false,
      lineHeight: rs(20),
    },


    navRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(2 * scaleFactor),
    },

    navLang: {
      fontSize: rs(14),
      color: "#fff",
    },
    logoContainer: {
      alignItems: "center",
      marginTop: verticalScale((isShort ? 15 : isTablet ? 40 : 30) * scaleFactor),
      marginBottom: verticalScale((isShort ? 15 : 25) * scaleFactor),
      width: "95%",
      maxWidth: 500,
      alignSelf: "center",
    },
    logoImage: {
      width: scale((isTablet ? 180 : isSmall ? 100 : 120) * scaleFactor),
      height: verticalScale((isTablet ? 180 : isSmall ? 140 : 160) * scaleFactor),
    },
    title: {
      fontSize: rs(22),
      color: "#3D5D96",
      textAlign: "center",
      marginTop: verticalScale(5 * scaleFactor),
      paddingHorizontal: scale(5 * scaleFactor),
    },
    subtitle: {
      textAlign: "center",
      color: "#6B7280",
      fontSize: rs(13),
      marginBottom: verticalScale((isShort ? 5 : 10) * scaleFactor),
      paddingHorizontal: scale(10 * scaleFactor),
    },
    textContainer: {
      width: "90%",
      maxWidth: 400,
      alignSelf: "center",
      marginBottom: verticalScale((isShort ? 5 : 10) * scaleFactor),
    },
    desc: {
      color: "#6B7280",
      fontSize: rs(13),
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
      marginTop: verticalScale((isShort ? 5 : 10) * scaleFactor),
    },
    countryBox: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      paddingHorizontal: scale(10 * scaleFactor),
      paddingVertical: verticalScale(10 * scaleFactor),
      borderRadius: moderateScale(12 * scaleFactor),
      backgroundColor: "#fff",
      marginRight: scale(8 * scaleFactor),
      height: verticalScale((isTablet ? 54 : 48) * scaleFactor),
    },
    countryText: {
      fontSize: rs(16),
      textAlign: "center",
      includeFontPadding: false,
    },
    input: {
      flex: 1,
      minWidth: 0,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: moderateScale(12 * scaleFactor),
      paddingHorizontal: scale(15 * scaleFactor),
      height: verticalScale((isTablet ? 54 : 48) * scaleFactor),
      backgroundColor: "#fff",
      fontSize: rs(16),
      textAlign: "left",
    },
    button: {
      flexDirection: "row",
      justifyContent: "center",
      gap: scale(10 * scaleFactor),
      backgroundColor: "#3D5D96",
      height: verticalScale((isTablet ? 50 : 44) * scaleFactor),
      borderRadius: moderateScale(12 * scaleFactor),
      alignItems: "center",
      marginTop: verticalScale((isShort ? 25 : isTablet ? 45 : 35) * scaleFactor),
      paddingHorizontal: scale(15 * scaleFactor),
      width: "90%",
      maxWidth: 400,
      alignSelf: "center",
      shadowColor: "#3D5D96",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      color: "#fff",
      fontSize: rs(17),
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    security: {
      textAlign: "center",
      marginTop: verticalScale((isShort ? 15 : 25) * scaleFactor),
      color: "#6B7280",
      fontSize: rs(12),
      marginBottom: verticalScale(5 * scaleFactor),
    },
    terms: {
      textAlign: "center",
      fontSize: rs(14),
      color: "#939cae",
      paddingBottom: verticalScale(30 * scaleFactor),
      width: "92%",
      maxWidth: 400,
      alignSelf: "center",
      lineHeight: rs(18),
    },
    link: {
      color: "#3D5D96",
      fontWeight: "700",
    },
    dropdownOverlay: {
      position: "absolute",
      top: verticalScale((isTablet ? 66 : 56) * scaleFactor),
      right: scale(15 * scaleFactor),
      width: scale((isTablet ? 180 : 160) * scaleFactor),
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: moderateScale(12 * scaleFactor),
      zIndex: 1000,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    dropdownItem: {
      paddingVertical: verticalScale(14 * scaleFactor),
      paddingHorizontal: scale(16 * scaleFactor),
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    },
    dropdownText: {
      fontSize: rs(15),
      color: "#374151",
    },
  });
};
