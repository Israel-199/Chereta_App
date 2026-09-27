import React, { memo, ReactNode } from "react";
import {
  View,
  ScrollView,
  StyleProp,
  ViewStyle,
  ScrollViewProps,
} from "react-native";
import { SCREEN_BG } from "@/constants/theme";
import { useFloatingNavPadding } from "@/utils/floatingNavLayout";

type Props = {
  navbar: ReactNode;
  children: ReactNode;
  /** When false, children fill the screen below the nav without an outer ScrollView. */
  scroll?: boolean;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, "contentContainerStyle" | "children">;
};

function ImmersiveNavScreen({
  navbar,
  children,
  scroll = true,
  backgroundColor = SCREEN_BG,
  contentContainerStyle,
  scrollViewProps,
}: Props) {
  const paddingTop = useFloatingNavPadding(true);

  return (
    <View style={{ flex: 1, width: "100%", backgroundColor }}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ paddingTop }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop }}>{children}</View>
      )}
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 }}
      >
        {navbar}
      </View>
    </View>
  );
}

export default memo(ImmersiveNavScreen);
