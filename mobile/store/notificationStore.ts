import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Vibration } from "react-native";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: string;
  isRead: boolean;
  equbName?: string;
  trackInfo?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, "id" | "date" | "time" | "isRead">) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notif) => {
        const now = new Date();
        const newNotif: NotificationItem = {
          ...notif,
          id: Math.floor(Date.now() + Math.random() * 1000).toString(),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
        Vibration.vibrate(400);
      },
      setNotifications: (notifications) => set({ notifications }),
      clearNotifications: () => set({ notifications: [] }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
