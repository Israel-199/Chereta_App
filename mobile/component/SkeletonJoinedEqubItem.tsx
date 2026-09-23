import React from "react";
import { View, useWindowDimensions } from "react-native";
import SkeletonLoader from "./SkeletonLoader";
import { useJoinedEqubStyles } from "@/styles/joinedEqubStyles";
import { moderateScale, verticalScale } from "react-native-size-matters";

export const SkeletonJoinedEqubItem = () => {
  const styles = useJoinedEqubStyles();
  const { width } = useWindowDimensions();
  const scaleFactor = Math.min(1, width / 360);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <SkeletonLoader
            width="75%"
            height={moderateScale(16 * scaleFactor)}
            style={{ marginBottom: verticalScale(6 * scaleFactor), borderRadius: 4 * scaleFactor }}
          />
          <View style={styles.amountRow}>
            <SkeletonLoader width={14 * scaleFactor} height={14 * scaleFactor} style={{ borderRadius: 4 * scaleFactor }} />
            <SkeletonLoader width="40%" height={moderateScale(12 * scaleFactor)} style={{ borderRadius: 4 * scaleFactor }} />
          </View>
        </View>
        <View style={styles.typeBadge}>
          <SkeletonLoader width={moderateScale(50 * scaleFactor)} height={moderateScale(10 * scaleFactor)} style={{ borderRadius: 10 * scaleFactor }} />
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <SkeletonLoader width={14 * scaleFactor} height={14 * scaleFactor} style={{ borderRadius: 4 * scaleFactor }} />
          <SkeletonLoader width="35%" height={moderateScale(11 * scaleFactor)} style={{ borderRadius: 4 * scaleFactor }} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={14 * scaleFactor} height={14 * scaleFactor} style={{ borderRadius: 4 * scaleFactor }} />
          <SkeletonLoader width="55%" height={moderateScale(11 * scaleFactor)} style={{ borderRadius: 4 * scaleFactor }} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={14 * scaleFactor} height={14 * scaleFactor} style={{ borderRadius: 4 * scaleFactor }} />
          <SkeletonLoader width="45%" height={moderateScale(11 * scaleFactor)} style={{ borderRadius: 4 * scaleFactor }} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={14 * scaleFactor} height={14 * scaleFactor} style={{ borderRadius: 4 * scaleFactor }} />
          <SkeletonLoader width="30%" height={moderateScale(11 * scaleFactor)} style={{ borderRadius: 4 * scaleFactor }} />
        </View>
      </View>

      <View style={styles.cardActions}>
        <View style={[styles.payBtn, { width: "100%", justifyContent: "center" }]}>
           <SkeletonLoader width="40%" height={moderateScale(12 * scaleFactor)} style={{ borderRadius: 4 * scaleFactor }} />
        </View>
      </View>
    </View>
  );
};

export default SkeletonJoinedEqubItem;
