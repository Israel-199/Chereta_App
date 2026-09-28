import React, { memo } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NAV_HEADER_GREEN } from "@/constants/theme";

/** Single status bar color app-wide (Chereta header blue). */
function AppStatusBar() {
  return (
    <>
      {/* @ts-ignore */}
      <StatusBar style="light" backgroundColor={NAV_HEADER_GREEN} />
      {Platform.OS === "android" && (
        <RNStatusBar
          translucent
          backgroundColor={NAV_HEADER_GREEN}
          barStyle="light-content"
        />
      )}
    </>
  );
}

export default memo(AppStatusBar);
