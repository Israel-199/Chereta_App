import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";

/** Matches `loginScreenStyles` navbar row height. */
export const NAV_BAR_BODY_HEIGHT = 52;
export const NAV_CURVE_RADIUS = 26;
/** Clear gap between curved nav bottom and first content line. */
export const NAV_CONTENT_GAP = 14;

/** Top padding so scroll content starts fully below the floating nav (nothing hidden). */
export function useFloatingNavPadding(curved = true): number {
  const insets = useSafeAreaInsets();
  const barHeight = verticalScale(NAV_BAR_BODY_HEIGHT);
  const curveExtra = curved ? NAV_CURVE_RADIUS * 0.55 : 0;
  return insets.top + barHeight + curveExtra + NAV_CONTENT_GAP;
}
