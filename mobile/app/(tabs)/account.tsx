import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated, InteractionManager, Platform, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../store/auth";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useProfileStyles } from "../../styles/profileScreenStyle";
import Navbar from "../../component/Navbar";
import { translations } from "../../translations";
import { logout } from "../../api/auth";
import axiosClient from "../../api/axiosClient";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useWindowDimensions } from "react-native";
import DraggableModal from "../../component/DraggableModal";

const ETHIOPIC_LANGUAGES = new Set(["አማርኛ", "ትግርኛ"]);
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
const LANGUAGES = ["English", "አማርኛ", "Afaan Oromo", "Af Somali", "ትግርኛ"];

const AccountScreen = () => {
  const styles = useProfileStyles();
  const language = useAuthStore((state) => state.language);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const clearToken = useAuthStore((state) => state.clearToken);
  const token = useAuthStore((state) => state.token);
  const profile = useAuthStore((state) => state.profile);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scaleFactor = Math.min(1, width / 360);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [uploading, setUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const uploadAnim = useRef(new Animated.Value(0)).current;

  const t = useMemo(() => translations[language], [language]);

  const getFontFamily = useCallback(
    (bold = false) => {
      if (ETHIOPIC_LANGUAGES.has(language))
        return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
      return bold ? "NotoSans-Bold" : "NotoSans-Regular";
    },
    [language]
  );


  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName)
      return `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
    return "User";
  }, [profile?.firstName, profile?.lastName]);

  const nameFontStyle = useMemo(() => ({ fontFamily: getFontFamily(true) }), [getFontFamily]);
  const regularFontStyle = useMemo(() => ({ fontFamily: getFontFamily(false) }), [getFontFamily]);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [borderAnim]);

  useEffect(() => {
    if (uploading || isRefreshing) {
      uploadAnim.setValue(0);
      Animated.loop(
        Animated.timing(uploadAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();
    } else {
      uploadAnim.stopAnimation();
      uploadAnim.setValue(0);
    }
  }, [uploading, isRefreshing, uploadAnim]);

  const rotateInterpolate = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const uploadRotateRight = uploadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const uploadRotateLeft = uploadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"],
  });

  const opacityInterpolate = borderAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) throw new Error("noToken");
      const res = await logout();
      Toast.show({
        type: "success",
        text1: t?.success ?? "Success",
        text2: t?.[res?.messageKey] || t?.loggedOut || "You have been logged out",
      });
      clearToken();
      router.replace("/");
    } catch (err: any) {
      const key = err?.response?.data?.errorKey || err?.message || "unknownError";
      Toast.show({
        type: "error",
        text1: t?.failed ?? "Failed",
        text2: t?.[key] || key,
      });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [token, t, clearToken, router]);

  const uploadProfilePhoto = useCallback(
    async (uri: string) => {
      try {
        if (!token) throw new Error("noToken");
        setUploading(true);
        setLocalPhoto(uri);

        const formData = new FormData();
        formData.append("photo", {
          uri,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any);

        const res = await axiosClient.post("/user/complete-profile", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        useAuthStore.getState().setProfile(res.data.user);
        Toast.show({
          type: "success",
          text1: t?.success ?? "Success",
          text2: "Profile picture updated",
        });
        setLocalPhoto(null);
      } catch (err: any) {
        const key = err?.response?.data?.errorKey || err?.message || "unknownError";
        Toast.show({
          type: "error",
          text1: t?.failed ?? "Failed",
          text2: t?.[key] || key,
        });
        setLocalPhoto(null);
      } finally {
        setUploading(false);
      }
    },
    [token, t]
  );

  const pickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("pickImage error:", err);
    }
  }, [uploadProfilePhoto]);

  const pickFromCamera = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) return;
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("pickFromCamera error:", err);
    }
  }, [uploadProfilePhoto]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setImageRefreshKey(Date.now());
      await useAuthStore.getState().preloadData();
    } catch (err) {
      console.warn("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const openPhotoModal = useCallback(() => setShowPhotoModal(true), []);
  const closePhotoModal = useCallback(() => setShowPhotoModal(false), []);
  const openConfirm = useCallback(() => setShowConfirm(true), []);
  const closeConfirm = useCallback(() => setShowConfirm(false), []);
  const openLangModal = useCallback(() => setShowLangModal(true), []);
  const closeLangModal = useCallback(() => setShowLangModal(false), []);

  const handlePickImageFromModal = useCallback(async () => {
    setShowPhotoModal(false);
    await pickImage();
  }, [pickImage]);

  const handlePickCameraFromModal = useCallback(async () => {
    setShowPhotoModal(false);
    await pickFromCamera();
  }, [pickFromCamera]);

  const navigateTo = useCallback((path: string) => {
    InteractionManager.runAfterInteractions(() => {
      router.push(path as any);
    });
  }, [router]);

  const navIcon = useMemo(() => <MaterialCommunityIcons name="account-circle" size={22} color="#fff" />, []);
  const refreshIcon = useMemo(() => (
    <MaterialCommunityIcons 
      name="refresh" 
      size={22} 
      color={isRefreshing ? "#ccc" : "#fff"} 
    />
  ), [isRefreshing]);

  const profilePhotoSource = useMemo(() => ({ 
    uri: localPhoto || (profile?.photo ? `${profile.photo}${profile.photo.includes("?") ? "&" : "?"}t=${imageRefreshKey}` : DEFAULT_AVATAR) 
  }), [localPhoto, profile?.photo, imageRefreshKey]);

  return (
    <>
      <Navbar
        leftIcon={navIcon}
        title={t?.accountTab ?? "Account"}
        firstIcon={refreshIcon}
        onFirstPress={handleRefresh}
      />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.constrainedContainer, { paddingBottom: 10 }]}
        bounces={true}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        renderToHardwareTextureAndroid={true}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatarWrapper, { borderColor: "#F0F7FF", borderWidth: moderateScale(3), overflow: "visible" }]}>
            {(!uploading && !isRefreshing) && (
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: scale(116),
                    height: scale(116),
                    borderRadius: scale(60),
                    borderWidth: moderateScale(4),
                    borderColor: "transparent",
                    borderTopColor: "#A5C7FF", 
                    borderRightColor: "#0B3C8A", 
                    transform: [{ rotate: rotateInterpolate }],
                    opacity: opacityInterpolate,
                    zIndex: 0,
                  }}
                />
            )}

            {(uploading || isRefreshing) && (
              <>
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: scale(116),
                    height: scale(116),
                    borderRadius: scale(60),
                    borderWidth: moderateScale(4),
                    borderColor: "transparent",
                    borderTopColor: "#A5C7FF", 
                    transform: [{ rotate: uploadRotateRight }],
                    zIndex: 5,
                  }}
                />
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: scale(116),
                    height: scale(116),
                    borderRadius: scale(60),
                    borderWidth: moderateScale(4),
                    borderColor: "transparent",
                    borderTopColor: "#0B3C8A", 
                    transform: [{ rotate: uploadRotateLeft }],
                    zIndex: 5,
                  }}
                />
              </>
            )}

            <Image source={profilePhotoSource} style={styles.profileImage} contentFit="cover" transition={200} />
            <TouchableOpacity 
              style={[styles.cameraIcon, { zIndex: 10 }]} 
              onPress={openPhotoModal}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {!profile ? (
            <View style={{ height: verticalScale(120 * scaleFactor), justifyContent: 'center' }}>
              <ActivityIndicator color="#0B3C8A" />
            </View>
          ) : (
            <View style={{ alignItems: "center", width: '100%', paddingHorizontal: scale(20), minHeight: verticalScale(110 * scaleFactor), justifyContent: 'center' }}>
              <Text 
                style={[styles.profileName, nameFontStyle, { marginBottom: 6 }]} 
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {displayName}
              </Text>

              <Text 
                style={[styles.profilePhone, regularFontStyle]}
                numberOfLines={1}
              >
                {profile?.phoneNumber || "User phone not available"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, nameFontStyle]}>{t?.profileAccount}</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/personalInfoScreen")} activeOpacity={0.6}>
            <MaterialCommunityIcons name="account-edit" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.updateAccount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/attachments")} activeOpacity={0.6}>
            <MaterialCommunityIcons name="file-document" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.attachmentFile}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/fayidaSection")} activeOpacity={0.6}>
            <Ionicons name="lock-closed" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.fayida}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={openLangModal} activeOpacity={0.6}>
            <Ionicons name="language" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.languageSettings} : {language}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, nameFontStyle]}>{t?.promotion}</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/referral")} activeOpacity={0.6}>
            <MaterialCommunityIcons name="account-group" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.referral}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/shareApp")} activeOpacity={0.6}>
            <Ionicons name="share-social" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.share}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/rateApp")} activeOpacity={0.6}>
            <Ionicons name="star" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.rateApp}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, nameFontStyle]}>{t?.information}</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/aboutUs")} activeOpacity={0.6}>
            <Ionicons name="information-circle" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.aboutUs}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/disputeSupport")} activeOpacity={0.6}>
            <MaterialCommunityIcons name="message-alert" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.supportDispute}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("/screen/profileScreen/successStory")} activeOpacity={0.6}>
            <MaterialCommunityIcons name="trophy" size={20} color="#0B3C8A" />
            <Text style={[styles.itemText, regularFontStyle, { marginLeft: 8 }]}>{t?.successStory}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={openConfirm} activeOpacity={0.7}>
          <MaterialCommunityIcons name="logout" size={22} color="#DC2626" />
          <Text style={[styles.logoutText, nameFontStyle]}>{t?.logout}</Text>
        </TouchableOpacity>

        <Text style={[styles.version, regularFontStyle]}>Digital Chereta v1.0.0 (Build 2026)</Text>
      </ScrollView>

      {/* Photo Picker Modal */}
      <DraggableModal visible={showPhotoModal} onClose={closePhotoModal}>
        <View style={{ paddingBottom: 20 }}>
          <Text style={[styles.bottomSheetTitle, nameFontStyle, { marginBottom: 25, textAlign: 'center' }]}>{t?.profilePhoto || "Profile Photo"}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={handlePickCameraFromModal}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="camera" size={32} color="#0B3C8A" />
              </View>
              <Text style={[regularFontStyle, { color: '#374151' }]}>{t?.fromCamera || "Camera"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={handlePickImageFromModal}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="images" size={32} color="#0B3C8A" />
              </View>
              <Text style={[regularFontStyle, { color: '#374151' }]}>{t?.fromFile || "Gallery"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DraggableModal>

      {/* Language Modal */}
      <DraggableModal visible={showLangModal} onClose={closeLangModal}>
        <View style={{ paddingBottom: 10 }}>
          <Text style={[nameFontStyle, { fontSize: 20, marginBottom: 20, color: '#0F172A', textAlign: 'center' }]}>{t?.selectLanguage}</Text>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: language === lang ? "#F0F7FF" : "transparent",
                marginBottom: 8,
              }}
              onPress={() => { setLanguage(lang); setShowLangModal(false); }}
            >
              <Text style={[regularFontStyle, { fontSize: 16, color: language === lang ? "#0B3C8A" : "#374151" }]}>{lang}</Text>
              {language === lang && <MaterialCommunityIcons name="check-circle" size={20} color="#0B3C8A" />}
            </TouchableOpacity>
          ))}
        </View>
      </DraggableModal>

      {/* Logout Confirm Modal - Reverted to Centered */}
      <Modal 
        visible={showConfirm} 
        transparent 
        animationType="fade"
        onRequestClose={closeConfirm}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeConfirm}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 }}>
              <Ionicons name="log-out-outline" size={30} color="#DC2626" />
            </View>
            <Text style={[nameFontStyle, { fontSize: 20, textAlign: 'center', color: '#0F172A', marginBottom: 12 }]}>{t?.confirmLogout}</Text>
            <Text style={[regularFontStyle, { fontSize: 15, textAlign: 'center', color: '#64748B', marginBottom: 24, lineHeight: 22 }]}>{t?.logoutMessage}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#6B7280', justifyContent: 'center', alignItems: 'center' }} 
                onPress={closeConfirm} 
                disabled={loading}
              >
                <Text style={[nameFontStyle, { color: '#fff' }]}>{t?.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' }} 
                onPress={handleLogout} 
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={[nameFontStyle, { color: '#fff' }]}>{t?.logout}</Text>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default memo(AccountScreen);