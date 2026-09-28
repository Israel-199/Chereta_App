import { useNotificationStore } from "../store/notificationStore";

export function clearAllStores() {
  useNotificationStore.getState().clearNotifications();
}
