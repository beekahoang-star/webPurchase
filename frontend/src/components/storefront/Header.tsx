import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogIn, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { SmartSearchBar } from './SmartSearchBar';
import { MegaMenu } from './MegaMenu';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { ApiResponse, Category } from '../../types';

export const Header: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { totalQuantity, openDrawer } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch multi-level categories (cached by Redis on backend)
    api.get<ApiResponse<Category[]>>('/categories')
      .then((res) => {
        setCategories(res.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load categories for Mega Menu:', err);
      });
  }, []);

  const badgeCount = totalQuantity();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                Web<span className="text-indigo-600">Purchase</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Official Store
              </span>
            </div>
          </Link>

          {/* Mega Menu Trigger */}
          <div className="hidden lg:block">
            <MegaMenu categories={categories} />
          </div>

          {/* Smart Search Bar (Debounce 300ms + Auto Suggest) */}
          <div className="flex-1 max-w-xl">
            <SmartSearchBar />
          </div>

          {/* Actions: Mini-Cart Widget + Auth */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mini-Cart Widget Button with Realtime Badge */}
            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center"
              title="Mở Giỏ Hàng"
            >
              <ShoppingBag className="w-6 h-6" />
              {badgeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>

            {/* Auth / Admin Gate */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.roles?.some((r) => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER') && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 text-slate-700 text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
