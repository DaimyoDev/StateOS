import { generateId } from "../utils/core";

const MAX_NOTIFICATIONS = 100;

export const createNotificationSlice = (set, get) => ({
  notifications: [],

  actions: {
    addNotification: (notification) => {
      const newNotification = {
        id: generateId(),
        date: get().activeCampaign?.currentDate || new Date(),
        read: false,
        ...notification,
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
      }));
    },

    markNotificationAsRead: (notificationId) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    },

    markAllNotificationsAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    },

    clearAllNotifications: () => {
      set({ notifications: [] });
    },
  },
});
