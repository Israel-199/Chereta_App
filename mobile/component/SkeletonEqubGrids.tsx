import React, { memo, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const SkeletonEqubGrid = () => {
  const { width } = useWindowDimensions();
  const dimensions = useMemo(() => {
    const horizontalPadding = 14;
    const availableWidth = width - horizontalPadding * 2;
    const boxWidth = availableWidth / 3.5;
    const boxHeight = boxWidth - 6;
    return { boxWidth, boxHeight, horizontalPadding };
  }, [width]);

  return (
    <View style={[styles.container, { paddingHorizontal: dimensions.horizontalPadding }]}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={[styles.item, { width: dimensions.boxWidth }]}>
          <SkeletonLoader width={dimensions.boxWidth} height={dimensions.boxHeight} style={{ borderTopRightRadius: 26 }} />
          <SkeletonLoader width={dimensions.boxWidth * 0.8} height={16} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  item: {
    alignItems: "center",
    marginBottom: 6,
  },
});

export default memo(SkeletonEqubGrid);
