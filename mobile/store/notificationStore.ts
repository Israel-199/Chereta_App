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
  deletedIds: string[];
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
      deletedIds: [],
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
      setNotifications: (incoming) => set((state) => {
        const existingMap = new Map(state.notifications.map(n => [n.id, n]));
        const merged = incoming
          .filter(n => !state.deletedIds.includes(n.id))
          .map(n => {
            const existing = existingMap.get(n.id);
            return existing ? { ...n, isRead: existing.isRead } : n;
          });
        return { notifications: merged };
      }),
      clearNotifications: () => set((state) => ({ 
        deletedIds: [...new Set([...state.deletedIds, ...state.notifications.map(n => n.id)])],
        notifications: [],
      })),
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
          deletedIds: [...new Set([...state.deletedIds, id])],
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
