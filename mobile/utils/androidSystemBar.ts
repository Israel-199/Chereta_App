import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

/**
 * Android system navigation bar
 *
 * Background: black
 * Buttons/icons: white
 * Navigation bar: always visible
 */
export function applyAndroidSystemNavigationBar() {
  if (Platform.OS !== "android") return;

  try {
    // White navigation buttons/icons
    // @ts-ignore
    NavigationBar.setStyle?.("light");

    // Keep Android system navigation bar visible
    // @ts-ignore
    NavigationBar.setHidden?.(false);
  } catch (e) {
    // app.json + android-nav-fix plugin handle
    // the native navigation bar configuration.
  }
}

/**
 * Re-apply when the app returns to foreground.
 */
export function bindAndroidSystemNavigationBar() {
  if (Platform.OS !== "android") {
    return () => {};
  }

  applyAndroidSystemNavigationBar();

  const sub = AppState.addEventListener(
    "change",
    (state) => {
      if (state === "active") {
        applyAndroidSystemNavigationBar();
      }
    }
  );

  return () => sub.remove();
}