import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Store,
  Radio,
  BellRing
} from 'lucide-react';
import { PermissionGate } from '../common/PermissionGate';
import { useAdminBadgeStore } from '../../store/useAdminBadgeStore';

export const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pendingOrdersCount } = useAdminBadgeStore();

  const navLinks = [
    {
      to: '/admin',
      label: 'Tổng Quan',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/orders',
      label: 'Đơn Hàng',
      icon: ShoppingBag,
      permission: 'ORDER_READ',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      to: '/admin/products',
      label: 'Sản Phẩm',
      icon: Package,
      permission: 'CATALOG_READ',
    },
    {
      to: '/admin/categories',
      label: 'Cấu Hình Danh Mục',
      icon: FolderTree,
      permission: 'CATALOG_READ',
    },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-200 transition-all duration-300 flex flex-col border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
            <Layers className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
                Admin Center
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> Trực tuyến
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Thu gọn sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand trigger when collapsed */}
      {collapsed && (
        <div className="p-3 border-b border-slate-800/80 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Mở rộng sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation List with <PermissionGate> */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;

          return (
            <PermissionGate key={item.to} permission={item.permission}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

                {/* Live Counter Badge */}
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor} ${
                      collapsed ? 'absolute top-1 right-1' : ''
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapse */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            </PermissionGate>
          );
        })}
      </nav>

      {/* Bottom Storefront Link */}
      <div className="p-3 border-t border-slate-800/80">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Store className="w-4 h-4 text-emerald-400 shrink-0" />
          {!collapsed && <span>Về Storefront</span>}
        </NavLink>
      </div>
    </aside>
  );
};
