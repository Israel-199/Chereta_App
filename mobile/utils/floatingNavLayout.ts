import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";

/** Matches `loginScreenStyles` navbar row height. */
export const NAV_BAR_BODY_HEIGHT = 52;
export const NAV_CURVE_RADIUS = 26;
/** Content scrolls under the curved header by this many pixels. */
export const NAV_CONTENT_OVERLAP = 24;

export function useFloatingNavPadding(curved = true): number {
  const insets = useSafeAreaInsets();
  const barHeight = verticalScale(NAV_BAR_BODY_HEIGHT);
  if (!curved) {
    return insets.top + barHeight;
  }
  return Math.max(insets.top + barHeight - NAV_CONTENT_OVERLAP, insets.top + 36);
}
