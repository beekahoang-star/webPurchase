import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/storefront/Header';
import { MiniCartDrawer } from './components/storefront/MiniCartDrawer';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { CommandSearchDialog } from './components/common/CommandSearchDialog';
import { useRealtimeNotification } from './hooks/useRealtimeNotification';
import { useAuthStore } from './store/useAuthStore';

// Pages
import { HomePage } from './pages/storefront/HomePage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { OrderSuccessPage } from './pages/storefront/OrderSuccessPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Storefront Shell Layout
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <MiniCartDrawer />
      <footer className="bg-white border-t border-slate-100 py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 mb-3">Về WebPurchase</h4>
            <p className="leading-relaxed text-slate-500">
              Hệ sinh thái mua sắm thiết bị công nghệ chính hãng hàng đầu, cam kết chất lượng và dịch vụ tận tâm.
            </p>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 mb-3">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Hotline: 1900 6868</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Chính sách bảo hành đổi trả</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Hướng dẫn mua hàng trả góp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 mb-3">Chính Sách & Điều Khoản</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Chính sách bảo mật thông tin</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Quy chế hoạt động</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 mb-3">Thanh Toán & Vận Chuyển</h4>
            <p className="leading-relaxed text-slate-500">
              Hỗ trợ đa dạng phương thức: COD, VNPAY, Thẻ ATM nội địa, Thẻ quốc tế Visa/MasterCard.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-6 text-center text-slate-400">
          <p>© 2026 WebPurchase. Bản quyền thuộc về WebPurchase. Tất cả các quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

// Admin Shell Layout (Dedicated staff portal)
const AdminLayout: React.FC = () => {
  const { hasRole } = useAuthStore();
  const isAdminOrManager = hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER');

  // Activate SSE Realtime notifications
  useRealtimeNotification();

  if (!isAdminOrManager) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CommandSearchDialog />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Storefront Routes */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderCode" element={<OrderSuccessPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Dedicated Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
