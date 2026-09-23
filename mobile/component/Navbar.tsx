import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoginScreenStyles } from "@/styles/loginScreenStyles";
import { useNotificationStore } from "@/store/notificationStore";

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

  const containerStyle = useMemo(() => [
    styles.navbarContainer,
    {
      paddingTop: insets.top,
      backgroundColor: "#0B3C8A",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
      borderBottomWidth: 0,
    },
  ], [styles.navbarContainer, insets.top]);

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

  return (
    <View style={containerStyle}>
      <View style={styles.navbar}>
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
  );
};

export default memo(Navbar);