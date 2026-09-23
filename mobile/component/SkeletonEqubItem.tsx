import React from "react";
import { View, useWindowDimensions } from "react-native";
import SkeletonLoader from "./SkeletonLoader";
import { scale } from "react-native-size-matters";

export const SkeletonEqubItem = () => {
  const { width } = useWindowDimensions();
  const scaleFactor = Math.min(1, width / 360);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12 * scaleFactor,
        paddingVertical: 20 * scaleFactor,
        paddingHorizontal: "5%",
        marginBottom: 12 * scaleFactor,
      }}
    >
      {/* Header: Type | Amount */}
      <SkeletonLoader
        width="80%"
        height={scale(18)}
        style={{ marginBottom: scale(20), borderRadius: 4 }}
      />

      {/* Rows Container - 4 Rows matching EqubItem */}
      <View style={{ flexDirection: "column", gap: scale(12), marginBottom: scale(24) }}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <SkeletonLoader
              width="35%"
              height={scale(13)}
              style={{ borderRadius: 4 }}
            />
            <SkeletonLoader
              width="40%"
              height={scale(13)}
              style={{ borderRadius: 4 }}
            />
          </View>
        ))}
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#E8ECF0",
          marginTop: scale(8),
          marginBottom: scale(18),
          width: "100%",
        }}
      />

      {/* Footer Actions: Two Side-by-Side Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: scale(8),
        }}
      >
        <SkeletonLoader
          width="46%"
          height={scale(48)}
          style={{ borderRadius: 8 }}
        />
        <SkeletonLoader
          width="46%"
          height={scale(48)}
          style={{ borderRadius: 8 }}
        />
      </View>
    </View>
  );
};

export default SkeletonEqubItem;
