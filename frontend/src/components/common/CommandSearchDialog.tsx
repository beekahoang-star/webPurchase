import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingBag, FolderTree, LayoutDashboard, ExternalLink, X } from 'lucide-react';

export const CommandSearchDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const commands = [
    { id: 'dashboard', label: 'Bảng Điều Khiển Tổng Quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'products', label: 'Quản Lý Danh Sách Sản Phẩm', icon: Package, path: '/admin/products' },
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'categories', label: 'Cấu Hình Danh Mục Sản Phẩm', icon: FolderTree, path: '/admin/categories' },
    { id: 'storefront', label: 'Xem Giao Diện Cửa Hàng (Storefront)', icon: ExternalLink, path: '/' },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm lệnh nhanh... (Nhấn ESC để đóng)"
            className="w-full text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2 max-h-80 overflow-y-auto">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Điều Hướng Nhanh
          </div>
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                >
                  <Icon className="w-4 h-4 mr-3 text-slate-400 group-hover:text-indigo-600" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              Không tìm thấy lệnh hoặc trang phù hợp
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Dùng phím mũi tên hoặc nhấp để chọn</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
            ESC để thoát
          </span>
        </div>
      </div>
    </div>
  );
};
