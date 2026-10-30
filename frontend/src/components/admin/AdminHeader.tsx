import React, { useState } from 'react';
import { Search, Bell, Command, User, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdminBadgeStore } from '../../store/useAdminBadgeStore';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { notifications, pendingOrdersCount, markAllNotificationsRead } = useAdminBadgeStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30">
      {/* Global Command Search Trigger (Cmd/Ctrl + K) */}
      <button
        onClick={() => {
          const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
          window.dispatchEvent(event);
        }}
        className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs text-slate-500 font-medium transition-colors"
      >
        <Search className="w-4 h-4 text-slate-400" />
        <span>Tìm kiếm nhanh lệnh, đơn hàng, sản phẩm...</span>
        <span className="flex items-center gap-0.5 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono text-[11px] shadow-2xs">
          <Command className="w-3 h-3" /> K
        </span>
      </button>

      {/* Right controls: SSE Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Realtime Notification Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Thông Báo Mới</span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Đã đọc
                </button>
              </div>
              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl text-xs transition-colors ${
                        n.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/70 text-indigo-950 font-medium'
                      }`}
                    >
                      <p>{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">Chưa có thông báo mới</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">{user?.fullName}</div>
            <div className="text-[11px] text-indigo-600 font-semibold">{user?.roles?.[0] || 'Administrator'}</div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-rose-600 ml-2 font-medium"
          >
            Thoát
          </button>
        </div>
      </div>
    </header>
  );
};
