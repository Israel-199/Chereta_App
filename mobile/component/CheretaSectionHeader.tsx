import React, { memo } from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LEMON_GREEN } from "@/constants/theme";

type Variant = "hero" | "section";

type Props = {
  title: string;
  subtitle?: string;
  variant?: Variant;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  bold: any;
  regular: any;
};

function CheretaSectionHeader({
  title,
  subtitle,
  variant = "section",
  icon = "tag-multiple-outline",
  style,
  bold,
  regular,
}: Props) {
  if (variant === "hero") {
    return (
      <View
        style={[
          {
            marginHorizontal: 16,
            marginTop: 4,
            marginBottom: 16,
            backgroundColor: "#fff",
            borderRadius: 20,
            paddingVertical: 18,
            paddingHorizontal: 18,
            borderLeftWidth: 5,
            borderLeftColor: LEMON_GREEN,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
          },
          style,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: subtitle ? 8 : 0 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#ECFCCB",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons name="fire" size={22} color={LEMON_GREEN} />
          </View>
          <Text style={[bold, { flex: 1, fontSize: 22, color: "#111827", paddingVertical: 2 }]}>{title}</Text>
        </View>
        {subtitle ? (
          <Text style={[regular, { fontSize: 14, color: "#6B7280", paddingLeft: 52, paddingVertical: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[{ marginHorizontal: 16, marginBottom: 14, marginTop: 4 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <MaterialCommunityIcons name={icon} size={22} color={LEMON_GREEN} />
        </View>
        <View style={{ flex: 1, paddingTop: 2 }}>
          <Text style={[bold, { fontSize: 19, color: "#111827", marginBottom: 2, paddingVertical: 2 }]}>{title}</Text>
          {subtitle ? (
            <Text style={[regular, { fontSize: 13, color: "#6B7280", paddingVertical: 2 }]}>{subtitle}</Text>
          ) : null}
          <View
            style={{
              marginTop: 10,
              height: 3,
              width: 48,
              borderRadius: 2,
              backgroundColor: LEMON_GREEN,
            }}
          />
        </View>
      </View>
    </View>
  );
}

export default memo(CheretaSectionHeader);
