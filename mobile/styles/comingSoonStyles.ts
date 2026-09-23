import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useComingSoonStyles = () => {
  const { width } = useWindowDimensions();
  const isTablet = width > 700;
  const scaleFactor = Math.min(1, width / 360);
  const rs = (size: number) => moderateScale(size * scaleFactor);

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    logoImage: {
      width: scale((isTablet ? 200 : 140) * scaleFactor),
      height: verticalScale((isTablet ? 200 : 130) * scaleFactor),
      marginBottom: verticalScale(2 * scaleFactor),
    },
    logoContainer: {
      backgroundColor: "white",
      marginTop: 10 * scaleFactor,
      borderRadius: 12 * scaleFactor,
    },
    badge: {
      backgroundColor: "#0fca2e",
      paddingHorizontal: 14 * scaleFactor,
      paddingVertical: 6 * scaleFactor,
      borderRadius: 20 * scaleFactor,
    },
    subtitle: {
      color: "#0fca2e",
      marginTop: 20 * scaleFactor,
      textAlign: "center",
      fontSize: rs(18),
    },
    ethiopianDate: {
      color: "#0fca2e",
      fontSize: rs(16),
      marginTop: 10 * scaleFactor,
    },
    countdownContainer: {
      flexDirection: "row",
      marginTop: 30 * scaleFactor,
    },
    timeBox: {
      backgroundColor: "#fff",
      marginHorizontal: 6 * scaleFactor,
      padding: 12 * scaleFactor,
      borderRadius: 12 * scaleFactor,
      alignItems: "center",
      minWidth: 70 * scaleFactor,
    },
    timeValue: {
      fontSize: rs(20),
      color: "#0B3C8A",
    },
    timeLabel: {
      fontSize: rs(12),
      color: "#0fca2e",
    },
  });
};
