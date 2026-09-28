import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { NAV_HEADER_GREEN } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoginScreenStyles } from "@/styles/loginScreenStyles";
import { useNotificationStore } from "@/store/notificationStore";
import { NAV_CURVE_RADIUS } from "@/utils/floatingNavLayout";

interface NavbarProps {
  leftIcon?: React.ReactNode;
  title?: string;
  language?: string;
  firstIcon?: React.ReactNode;
  secondIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onFirstPress?: () => void;
  onSecondPress?: () => void;
  showNotificationBadge?: boolean;
  /** Rounded bottom + elevated shadow (default on). Pass curved={false} for flat headers. */
  curved?: boolean;
}

const Navbar = ({
  leftIcon,
  title,
  language,
  firstIcon,
  secondIcon,
  onLeftPress,
  onFirstPress,
  onSecondPress,
  showNotificationBadge = false,
  curved = true,
}: NavbarProps) => {
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationStore((state) => state.notifications.filter(n => !n.isRead).length);

  const getFontFamily = useMemo(() => {
    if (language === "አማርኛ" || language === "ትግርኛ") {
      return "NotoSansEthiopic-Bold";
    }
    return "NotoSans-Bold";
  }, [language]);

  const radius = curved ? NAV_CURVE_RADIUS : 0;

  const shadowHostStyle = useMemo(
    () => ({
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      backgroundColor: NAV_HEADER_GREEN,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: curved ? 12 : 4 },
      shadowOpacity: curved ? 0.32 : 0.15,
      shadowRadius: curved ? 16 : 6,
      elevation: curved ? 18 : 6,
    }),
    [curved, radius],
  );

  const shellStyle = useMemo(
    () => ({
      paddingTop: insets.top,
      backgroundColor: NAV_HEADER_GREEN,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      overflow: "hidden" as const,
    }),
    [insets.top, radius],
  );

  const titleStyle = useMemo(() => [
    styles.navTitle,
    {
      fontFamily: getFontFamily,
      color: "#fff",
    },
  ], [styles.navTitle, getFontFamily]);

  const langTextStyle = useMemo(() => [
    styles.navLang,
    {
      fontFamily: "NotoSans-Regular",
      color: "#fff",
    },
  ], [styles.navLang]);

  const innerBarStyle = useMemo(
    () => [
      styles.navbar,
      curved && {
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      },
    ],
    [styles.navbar, curved, radius],
  );

  return (
    <View style={{ width: "100%", backgroundColor: "transparent" }}>
      <View style={shadowHostStyle}>
        <View style={shellStyle}>
          <View style={innerBarStyle}>
            <View style={styles.navLeft}>
              {leftIcon && (
                <TouchableOpacity onPress={onLeftPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {leftIcon}
                </TouchableOpacity>
              )}
              {title && (
                <Text style={titleStyle} allowFontScaling={false}>
                  {title}
                </Text>
              )}
            </View>

            <View style={styles.navRight}>
              {firstIcon && (
                <TouchableOpacity onPress={onFirstPress} style={{ marginHorizontal: 6 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <View>
                    {firstIcon}
                    {showNotificationBadge && unreadCount > 0 && (
                      <View style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: '#C1FF72',
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                      }}>
                        <Text style={{ color: '#000', fontSize: 10, fontFamily: getFontFamily }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {language && (
                <TouchableOpacity onPress={onSecondPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={langTextStyle}>{language}</Text>
                </TouchableOpacity>
              )}

              {secondIcon && (
                <TouchableOpacity onPress={onSecondPress} style={{ marginLeft: 10 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {secondIcon}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(Navbar);
