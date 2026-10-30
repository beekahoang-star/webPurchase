import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const MiniCartDrawer: React.FC = () => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, totalAmount, totalQuantity } = useCartStore();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Giỏ Hàng Của Bạn</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalQuantity()}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.skuId} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                  alt={item.spuName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-800 truncate mb-0.5">
                    {item.spuName}
                  </h4>
                  <div className="text-xs text-slate-500 mb-2 flex flex-wrap gap-1">
                    {Object.entries(item.options).map(([k, v]) => (
                      <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-indigo-600">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.skuId, item.quantity - 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700 text-base">Giỏ hàng đang trống</p>
              <p className="text-xs text-slate-400 mt-1">Hãy thêm những món đồ ưng ý vào giỏ!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Tạm tính:</span>
              <span className="text-lg font-extrabold text-slate-900">
                {totalAmount().toLocaleString('vi-VN')} đ
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.99]"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
