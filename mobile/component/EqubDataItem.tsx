import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";
import { Image } from 'expo-image';
import { useAuthStore } from "@/store/auth";

interface RowProps {
  icon: any;
  label: string;
  value: string | number;
}

export const Row = memo(({ icon, label, value }: RowProps) => {
  const { language } = useAuthStore();

  const getFontFamily = (bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular"
      : bold ? "NotoSans-Bold" : "NotoSans-Regular";

  const labelFont = useMemo(() => getFontFamily(false), [language]);
  const valueFont = useMemo(() => getFontFamily(true), [language]);

  return (
    <View style={{ flex: 1, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <Image
          source={icon}
          style={{ width: 14, height: 14, marginRight: 6, tintColor: "#00A651" }}
          contentFit="contain"
        />
        <Text
          style={{
            fontFamily: labelFont,
            fontSize: 13,
            color: "#00A651",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: valueFont,
          fontSize: 14,
          color: "#000080",
          paddingLeft: 20,
        }}
      >
        {value}
      </Text>
    </View>
  );
});
