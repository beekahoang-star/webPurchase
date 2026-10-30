import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { ApiResponse, Order } from '../../types';

export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderCode) return;

    api.get<ApiResponse<Order>>(`/orders/${orderCode}`)
      .then((res) => setOrder(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderCode]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400 font-semibold">Đang truy xuất thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
          Đơn hàng của bạn đã được ghi nhận vào hệ thống. Chúng tôi sẽ nhanh chóng liên hệ để xác nhận và chuẩn bị đơn hàng cho bạn.
        </p>

        {order && (
          <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-indigo-600 ml-2">{order.orderCode}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>Trạng thái: {order.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Khách hàng:</p>
                <p className="font-bold text-slate-800">{order.customerName}</p>
                <p className="text-slate-600">{order.customerPhone}</p>
                <p className="text-slate-600">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-slate-400">Địa chỉ nhận hàng:</p>
                <p className="font-medium text-slate-800">{order.shippingAddress}</p>
                <p className="text-slate-400 mt-2">Phương thức: <span className="font-bold text-slate-700">{order.paymentMethod}</span></p>
              </div>
            </div>

            {/* Preserved Variant Snapshots */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Sản phẩm đã đặt
              </h4>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const snap = item.variantSnapshot;
                  return (
                    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                      <img
                        src={snap.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                        alt={snap.spu_name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-slate-800 truncate">{snap.spu_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Mã SP: {snap.sku_code} | SL: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right text-xs font-bold text-indigo-600">
                        {Number(item.subtotal).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Tổng thanh toán:</span>
              <span className="text-indigo-600 text-base">{Number(order.totalAmount).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all"
          >
            <span>Về Trang Mua Sắm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
