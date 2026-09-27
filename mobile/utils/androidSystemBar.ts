import { AppState, Platform } from "react-native";
import { NavigationBar } from "expo-navigation-bar";

/** Android system navigation bar — always black bar, light buttons (APK + dev). */
export function applyAndroidSystemNavigationBar() {
  if (Platform.OS !== "android") return;
  try {
    // "dark" = dark bar with light button icons (Expo SDK 57 NavigationBarStyle)
    NavigationBar.setStyle("dark");
    NavigationBar.setHidden(false);
  } catch {
    // app.json + android-nav-fix plugin apply on native builds
  }
}

/** Re-apply when app returns to foreground (some OEMs reset the bar). */
export function bindAndroidSystemNavigationBar() {
  if (Platform.OS !== "android") return () => {};
  applyAndroidSystemNavigationBar();
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") applyAndroidSystemNavigationBar();
  });
  return () => sub.remove();
}
