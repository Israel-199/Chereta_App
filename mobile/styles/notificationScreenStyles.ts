import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useNotificationStyles = () => {
  const { width } = useWindowDimensions();
  const scaleFactor = Math.min(1, width / 360);
  const rs = (size: number) => moderateScale(size * scaleFactor);

  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
      backgroundColor: "#fff",
      paddingHorizontal: scale(16 * scaleFactor),
      paddingTop: verticalScale(20 * scaleFactor),
    },
    header: {
      fontSize: rs(20),
      fontWeight: "700",
      color: "#8DB048",
      marginBottom: verticalScale(12 * scaleFactor),
      textAlign: "center",
    },
    emptyText: {
      fontSize: rs(16),
      color: "#6B7280",
      textAlign: "center",
      marginTop: verticalScale(40 * scaleFactor),
    },
    listItem: {
      paddingVertical: verticalScale(12 * scaleFactor),
      borderBottomWidth: verticalScale(1),
      borderBottomColor: "#E5E7EB",
    },
    listText: {
      fontSize: rs(16),
      color: "#111827",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      width: "90%",
      maxWidth: 400,
      maxHeight: "70%",
      backgroundColor: "#fff",
      borderRadius: moderateScale(12 * scaleFactor),
      padding: scale(16 * scaleFactor),
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: moderateScale(6 * scaleFactor),
      elevation: 5,
    },
  });
};
