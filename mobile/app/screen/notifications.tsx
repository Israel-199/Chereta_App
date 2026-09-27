import React, { useState, useMemo, useCallback, memo } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationStore, NotificationItem } from "@/store/notificationStore";
import { useRouter } from "expo-router";
import Navbar from "../../component/Navbar";
import ImmersiveNavScreen from "../../component/ImmersiveNavScreen";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth";
import { translations } from "../../translations";
import DraggableModal from "../../component/DraggableModal";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

const NotificationCard = memo(({ 
  item, 
  onViewDetails, 
  onDelete,
  getFontFamily,
  t
}: { 
  item: NotificationItem; 
  onViewDetails: (item: NotificationItem) => void;
  onDelete: (id: string) => void;
  getFontFamily: (bold?: boolean) => string;
  t: any;
}) => {
  const markAsRead = useNotificationStore(state => state.markAsRead);

  const handlePress = () => {
    if (!item.isRead) markAsRead(item.id);
    onViewDetails(item);
  };

  const renderRightActions = () => (
    <TouchableOpacity 
      onPress={() => onDelete(item.id)}
      style={{
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 16,
        marginBottom: 16,
        marginLeft: 8,
      }}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={28} color="#fff" />
    </TouchableOpacity>
  );

  const renderLeftActions = () => (
    <TouchableOpacity 
      onPress={() => onDelete(item.id)}
      style={{
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 16,
        marginBottom: 16,
        marginRight: 8,
      }}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={28} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable 
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={(direction) => {
        if (direction === 'left' || direction === 'right') {
        }
      }}
    >
      <View 
        style={{
          backgroundColor: item.isRead ? '#fff' : '#F0F8FF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: item.isRead ? '#CBD5E1' : '#81CE06',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 16, color: '#8DB048', flex: 1 }} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={{ fontFamily: getFontFamily(), fontSize: 12, color: '#888' }}>{item.date}</Text>
        </View>

        <Text style={{ fontFamily: getFontFamily(), fontSize: 14, color: '#475569', lineHeight: 22 }} numberOfLines={1}>
          {item.message}
        </Text>

        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={handlePress}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
            activeOpacity={0.7}
          >
            <Text style={{ fontFamily: getFontFamily(true), fontSize: 13, color: '#0284C7', marginRight: 4 }}>
              {t?.tapSeeDetails || "View Details"}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#0284C7" />
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
});

export default function NotificationsScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { notifications, clearNotifications, markAllAsRead, removeNotification } = useNotificationStore();
  const insets = useSafeAreaInsets();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const language = authStore.language;
  const t = useMemo(() => translations[language] || translations["en"], [language]);

  const getFontFamily = useCallback((bold = false) => {
    if (language === "አማርኛ" || language === "ትግርኛ") {
      return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
    }
    return bold ? "NotoSans-Bold" : "NotoSans-Regular";
  }, [language]);

  const leftIcon = useMemo(() => <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />, []);
  const secondIconStyle = useMemo(() => <MaterialCommunityIcons name="delete-sweep" size={24} color="#fff" />, []);

  const handleBack = useCallback(() => {
    markAllAsRead();
    router.back();
  }, [router, markAllAsRead]);

  const handleClearAll = useCallback(async () => {
    setIsClearing(true);
    setTimeout(() => {
        clearNotifications();
        setIsClearing(false);
        setShowClearConfirm(false);
        Toast.show({ type: 'success', text1: t?.success, text2: t?.toastDeleteAllSuccess });
    }, 400);
  }, [clearNotifications, t]);

  const handleDeleteItem = useCallback((id: string) => {
    removeNotification(id);
    Toast.show({ type: 'success', text1: t?.success, text2: t?.toastDeleteSuccess });
  }, [removeNotification, t]);

  const openDetails = useCallback((item: NotificationItem) => {
    setSelectedNotification(item);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <ImmersiveNavScreen
        scroll={false}
        navbar={
          <Navbar
            leftIcon={leftIcon}
            title={t?.notifications || "Notifications"}
            onLeftPress={handleBack}
            secondIcon={secondIconStyle}
            onSecondPress={() => setShowClearConfirm(true)}
          />
        }
      >
      {notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <MaterialCommunityIcons name="bell-off-outline" size={40} color="#94A3B8" />
          </View>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 18, color: "#334155", textAlign: 'center' }}>
            {t?.noNotifications || "No notifications yet"}
          </Text>
          <Text style={{ fontFamily: getFontFamily(), fontSize: 14, color: "#64748B", textAlign: 'center', marginTop: 8 }}>
            {t?.noNotificationsDesc || "When you join an Equb or receive updates, they will appear here."}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: '#DCFCE7', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="gesture-swipe-horizontal" size={18} color="#166534" />
            <Text style={{ fontFamily: getFontFamily(), fontSize: 12, color: '#166534' }}>
                {t?.swipeToDelete || "Swipe left or right to delete"}
            </Text>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <NotificationCard 
                item={item} 
                onViewDetails={openDetails} 
                onDelete={handleDeleteItem}
                getFontFamily={getFontFamily}
                t={t}
              />
            )}
            contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom, width: "100%", maxWidth: 600, alignSelf: "center" }}
          />
        </View>
      )}

      </ImmersiveNavScreen>

      {/* Details Modal */}
      <DraggableModal
        visible={!!selectedNotification}
        onClose={closeModal}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontFamily: getFontFamily(true), fontSize: 20, color: '#8DB048', flex: 1 }}>
            {selectedNotification?.title}
          </Text>
          <TouchableOpacity onPress={closeModal} style={{ padding: 4, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar-month-outline" size={16} color="#64748B" />
            <Text style={{ fontFamily: getFontFamily(), fontSize: 13, color: '#64748B', marginLeft: 4 }}>
              {selectedNotification?.date}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
            <Text style={{ fontFamily: getFontFamily(), fontSize: 13, color: '#64748B', marginLeft: 4 }}>
              {selectedNotification?.time}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' }}>
          <Text style={{ fontFamily: getFontFamily(), fontSize: 15, color: '#334155', lineHeight: 24 }}>
            {selectedNotification?.message}
          </Text>
        </View>

        {selectedNotification?.trackInfo && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <Text style={{ fontFamily: getFontFamily(true), fontSize: 14, color: '#475569', width: 60 }}>
              ID
            </Text>
            <Text style={{ fontFamily: getFontFamily(), fontSize: 14, color: '#8DB048', flex: 1 }}>
              #{selectedNotification?.trackInfo}
            </Text>
          </View>
        )}
      </DraggableModal>

      {/* Clear All Confirmation Modal - Centered */}
      <Modal 
        visible={showClearConfirm} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }} 
          activeOpacity={1} 
          onPress={() => setShowClearConfirm(false)}
        >
          <TouchableOpacity activeOpacity={1} style={{ width: '88%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <MaterialCommunityIcons name="delete-sweep" size={32} color="#DC2626" />
            </View>
            <Text style={{ fontFamily: getFontFamily(true), fontSize: 20, color: '#1E293B', textAlign: 'center', marginBottom: 12 }}>
                {t?.confirmDeleteAll || "Clear All Notifications?"}
            </Text>
            <Text style={{ fontFamily: getFontFamily(), fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
                {t?.confirmDeleteAllMessage || "This will permanently remove all notifications."}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#6B7280', justifyContent: 'center', alignItems: 'center' }} 
                onPress={() => setShowClearConfirm(false)}
                disabled={isClearing}
              >
                <Text style={{ fontFamily: getFontFamily(true), color: '#fff' }}>{t?.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' }} 
                onPress={handleClearAll}
                disabled={isClearing}
              >
                {isClearing ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: getFontFamily(true), color: '#fff' }}>{t?.clear}</Text>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </GestureHandlerRootView>
  );
}
