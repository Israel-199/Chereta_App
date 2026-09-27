import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useProfileStyles = () => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const scaleFactor = Math.min(1, width / 360);
    const rs = (size: number) => moderateScale(size * scaleFactor);

    return StyleSheet.create({
      container: { flex: 1, backgroundColor: "#F8FAFC" },
      constrainedContainer: {
        width: "100%",
        maxWidth: 600,
        alignSelf: "center",
        flexGrow: 1,
      },

      profileHeader: {
        alignItems: "center",
        paddingVertical: verticalScale(30 * scaleFactor),
        backgroundColor: "#fff",
        marginBottom: verticalScale(20 * scaleFactor),
        marginHorizontal: "3%",
        borderRadius: moderateScale(12 * scaleFactor),
        height: verticalScale(280 * scaleFactor), // Increased constant height for 2-line names
        justifyContent: 'center',
      },
      profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: moderateScale(1000),
        backgroundColor: "#E5E7EB",
      },
      avatarWrapper: {
        width: scale(110 * scaleFactor),
        height: scale(110 * scaleFactor),
        borderRadius: scale(55 * scaleFactor),
        borderWidth: moderateScale(3 * scaleFactor),
        borderColor: "#F0F7FF",
        backgroundColor: "#fff",
        elevation: 8,
        shadowColor: "#3D5D96",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        position: "relative",
        marginBottom: verticalScale(12 * scaleFactor),
        alignItems: "center",
        justifyContent: "center",
      },
      cameraIcon: {
        position: "absolute",
        bottom: moderateScale(2 * scaleFactor),
        right: moderateScale(2 * scaleFactor),
        backgroundColor: "#3D5D96",
        borderRadius: moderateScale(25 * scaleFactor),
        padding: scale(8 * scaleFactor),
        borderWidth: 3,
        borderColor: "#fff",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      profileName: {
        fontSize: rs(18),
        color: "#3D5D96",
        textAlign: "center",
        marginTop: verticalScale(5 * scaleFactor),
        lineHeight: rs(22),
      },
      profilePhone: {
        fontSize: rs(14),
        color: "#6B7280",
        marginTop: verticalScale(5 * scaleFactor),
        textAlign: "center",
        lineHeight: rs(18),
      },
      memberBadge: {
        marginTop: verticalScale(7 * scaleFactor),
        color: "#3D5D96",
      },

      section: {
        backgroundColor: "#fff",
        marginBottom: verticalScale(20 * scaleFactor),
        marginHorizontal: "3%",
        paddingHorizontal: "5%",
        paddingVertical: verticalScale(15 * scaleFactor),
        borderRadius: moderateScale(12 * scaleFactor),
      },
      sectionTitle: {
        fontSize: rs(14),
        marginBottom: verticalScale(10 * scaleFactor),
        color: "#3D5D96",
        lineHeight: rs(18),
      },
      profileLevel: {
        fontSize: rs(16),
        lineHeight: rs(20),
      },

      item: {
        paddingVertical: verticalScale(12 * scaleFactor),
        borderBottomWidth: verticalScale(1),
        borderBottomColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
      },
      itemText: {
        fontSize: rs(13),
        color: "#374151",
        flexShrink: 1,
        lineHeight: rs(17),
      },
      itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: verticalScale(12 * scaleFactor),
        borderBottomWidth: verticalScale(1),
        borderBottomColor: "#E5E7EB",
      },

      logoutButton: {
        flexDirection: "row",
        justifyContent: "center",
        gap: scale(5 * scaleFactor),
        backgroundColor: "#fff",
        borderColor: "#DC2626",
        borderWidth: verticalScale(1),
        marginHorizontal: "10%",
        paddingVertical: verticalScale(13 * scaleFactor),
        borderRadius: moderateScale(10 * scaleFactor),
        alignItems: "center",
        marginBottom: verticalScale(20 * scaleFactor),
      },
      logoutText: {
        color: "#DC2626",
        fontSize: rs(12),
      },
      version: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: rs(11),
        marginBottom: verticalScale(15 * scaleFactor),
      },

      modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
      },
      bottomSheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
      },
      bottomSheetContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: moderateScale(28 * scaleFactor),
        borderTopRightRadius: moderateScale(28 * scaleFactor),
        padding: scale(25 * scaleFactor),
        paddingBottom: verticalScale(40 * scaleFactor),
        alignItems: "stretch",
      },
      bottomSheetTitle: {
        fontSize: rs(20),
        color: "#1F2937",
        marginBottom: verticalScale(20 * scaleFactor),
        textAlign: "center",
      },
      pickerRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: verticalScale(15 * scaleFactor),
      },
      pickerOption: {
        alignItems: "center",
        gap: verticalScale(8 * scaleFactor),
      },
      pickerIconCircle: {
        width: scale(65 * scaleFactor),
        height: scale(65 * scaleFactor),
        borderRadius: scale(32.5 * scaleFactor),
        backgroundColor: "#F3F7FF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E9F9",
      },
      pickerLabel: {
        fontSize: rs(14),
        color: "#374151",
      },
      modalBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12 * scaleFactor),
        padding: scale(20 * scaleFactor),
        alignItems: "center",
      },
      modalTitle: {
        fontSize: rs(18),
        fontWeight: "700",
        marginBottom: verticalScale(10 * scaleFactor),
        textAlign: "center",
      },
      modalMessage: {
        fontSize: rs(15),
        color: "#374151",
        textAlign: "center",
        marginBottom: verticalScale(20 * scaleFactor),
      },
      modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      },
      modalButton: {
        flex: 1,
        marginHorizontal: scale(5 * scaleFactor),
        paddingVertical: verticalScale(12 * scaleFactor),
        borderRadius: moderateScale(8 * scaleFactor),
        alignItems: "center",
      },
      modalButtonText: { color: "#fff", fontWeight: "600" },

      langBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12 * scaleFactor),
        padding: scale(20 * scaleFactor),
        alignItems: "stretch",
      },
      langItem: {
        paddingVertical: verticalScale(12 * scaleFactor),
        borderBottomWidth: verticalScale(1),
        borderBottomColor: "#E5E7EB",
      },
      langText: {
        fontSize: rs(16),
        color: "#374151",
      },
    });
  }, [width]);
};