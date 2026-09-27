import { StyleSheet, useWindowDimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const useJoinedEqubStyles = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 700;
  const scaleFactor = Math.min(1, width / 360);
  const baseSpacing = Math.min(width, height) * 0.02 * scaleFactor;

  const rs = (size: number) => moderateScale(size * scaleFactor);

  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
      backgroundColor: "#EFF1F5",
      paddingLeft: scale(baseSpacing),
      paddingRight: scale(baseSpacing),
    },
    listContent: {
      flexGrow: 1,
      padding: scale(baseSpacing),
      paddingBottom: verticalScale(baseSpacing * 4),
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(baseSpacing * 0.8),
      marginTop: verticalScale(baseSpacing * 1.2),
    },
    sectionIcon: {
      fontSize: rs(18),
      marginRight: scale(6 * scaleFactor),
    },
    sectionTitle: {
      fontSize: isTablet ? moderateScale(18) : rs(16),
      color: "#8DB048",
    },
    sectionCount: {
      marginLeft: "auto",
      backgroundColor: "rgba(11, 60, 138, 0.1)",
      paddingHorizontal: scale(10 * scaleFactor),
      paddingVertical: verticalScale(2 * scaleFactor),
      borderRadius: 12,
    },
    sectionCountText: {
      fontSize: rs(11),
      color: "#8DB048",
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: moderateScale(12 * scaleFactor),
      padding: moderateScale(16 * scaleFactor),
      marginBottom: verticalScale(baseSpacing * 0.8),
      borderWidth: 1,
      borderColor: "#E5E7EB",
      shadowColor: "#8DB048",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: verticalScale(baseSpacing * 0.8),
    },
    cardHeaderLeft: {
      flex: 1,
      marginRight: scale(8 * scaleFactor),
    },
    cardTitle: {
      fontSize: isTablet ? moderateScale(16) : rs(14),
      color: "#111827",
      marginBottom: verticalScale(4 * scaleFactor),
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    amountText: {
      fontSize: isTablet ? moderateScale(13) : rs(12),
      color: "#81CE06",
    },
    typeBadge: {
      backgroundColor: "rgba(11, 60, 138, 0.08)",
      paddingHorizontal: scale(10 * scaleFactor),
      paddingVertical: verticalScale(4 * scaleFactor),
      borderRadius: 20,
    },
    typeBadgeText: {
      fontSize: rs(10),
      color: "#8DB048",
    },

    cardDetails: {
      gap: verticalScale(6 * scaleFactor),
      marginBottom: verticalScale(baseSpacing),
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6 * scaleFactor),
    },
    cardText: {
      fontSize: isTablet ? moderateScale(12) : rs(11),
      color: "#000000",
    },

    cardActions: {
      flexDirection: "column",
      gap: scale(10 * scaleFactor),
    },
    topActionsRow: {
      flexDirection: "row",
      gap: scale(10 * scaleFactor),
    },
    removeBtn: {
      flex: 1,
      backgroundColor: "#FEF2F2",
      height: rs(44),
      borderRadius: moderateScale(8 * scaleFactor),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#FEE2E2",
    },
    payBtn: {
      width: "100%",
      backgroundColor: "#8DB048",
      height: rs(48),
      borderRadius: moderateScale(8 * scaleFactor),
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#8DB048",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    membersBtn: {
      flex: 1,
      backgroundColor: "#F0F9FF",
      height: rs(44),
      borderRadius: moderateScale(8 * scaleFactor),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#E0F2FE",
    },
    disabledBtn: {
      opacity: 0.5,
    },
    btnContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    btnText: {
      color: "#fff",
      fontSize: isTablet ? moderateScale(13) : rs(12),
    },
    emptyBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: isTablet ? moderateScale(17) : rs(15),
      color: "#6B7280",
      marginTop: verticalScale(12 * scaleFactor),
    },
    emptySubtext: {
      fontSize: isTablet ? moderateScale(13) : rs(11),
      color: "#9CA3AF",
      marginTop: verticalScale(4 * scaleFactor),
    },
    emptyText: {
      fontSize: isTablet ? moderateScale(16) : rs(14),
      color: "#8E99A4",
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      width: "88%",
      maxWidth: 380,
      backgroundColor: "#fff",
      borderRadius: moderateScale(16 * scaleFactor),
      paddingVertical: verticalScale(28 * scaleFactor),
      paddingHorizontal: scale(24 * scaleFactor),
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    modalIconCircle: {
      width: 48 * scaleFactor,
      height: 48 * scaleFactor,
      borderRadius: 24 * scaleFactor,
      backgroundColor: "rgba(220, 38, 38, 0.08)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(16 * scaleFactor),
    },
    modalTitle: {
      fontSize: isTablet ? moderateScale(18) : rs(16),
      color: "#111827",
      marginBottom: verticalScale(6 * scaleFactor),
      textAlign: "center",
    },
    modalSubtext: {
      fontSize: isTablet ? moderateScale(12) : rs(11),
      color: "#6B7280",
      textAlign: "center",
      lineHeight: rs(18),
      marginBottom: verticalScale(20 * scaleFactor),
    },
    modalActions: {
      flexDirection: "row",
      gap: scale(10 * scaleFactor),
      width: "100%",
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: "#6B7280",
      paddingVertical: verticalScale(12 * scaleFactor),
      borderRadius: moderateScale(10 * scaleFactor),
      alignItems: "center",
    },
    cancelBtnText: {
      color: "#fff",
      fontSize: isTablet ? moderateScale(13) : rs(12),
    },
    confirmRemoveBtn: {
      flex: 1,
      backgroundColor: "#DC2626",
      paddingVertical: verticalScale(12 * scaleFactor),
      borderRadius: moderateScale(10 * scaleFactor),
      alignItems: "center",
    },
    confirmRemoveBtnText: {
      color: "#fff",
      fontSize: isTablet ? moderateScale(13) : rs(12),
    },
  });
};
