import { create } from 'zustand';

export interface AdminNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AdminBadgeState {
  pendingOrdersCount: number;
  lowStockCount: number;
  notifications: AdminNotification[];
  incrementPendingOrders: () => void;
  decrementPendingOrders: () => void;
  setPendingOrdersCount: (count: number) => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'read'>) => void;
  markAllNotificationsRead: () => void;
}

export const useAdminBadgeStore = create<AdminBadgeState>((set) => ({
  pendingOrdersCount: 2, // Initial mock matching seed DB
  lowStockCount: 1,
  notifications: [
    {
      id: '1',
      type: 'INFO',
      message: 'Hệ thống vận hành sẵn sàng tiếp nhận đơn hàng',
      timestamp: new Date().toLocaleTimeString(),
      read: false,
    },
  ],

  incrementPendingOrders: () =>
    set((state) => ({ pendingOrdersCount: state.pendingOrdersCount + 1 })),

  decrementPendingOrders: () =>
    set((state) => ({ pendingOrdersCount: Math.max(0, state.pendingOrdersCount - 1) })),

  setPendingOrdersCount: (count) => set({ pendingOrdersCount: count }),

  addNotification: (item) =>
    set((state) => ({
      notifications: [
        {
          ...item,
          id: Math.random().toString(36).substring(2, 9),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
