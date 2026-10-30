import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ShieldCheck, Loader2, CreditCard, Banknote } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { ApiResponse, Order } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-500 mb-6">Hãy thêm sản phẩm trước khi thanh toán.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100"
        >
          <ArrowLeft className="w-4 h-4" /> Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      notes,
      items: items.map((i) => ({
        skuId: i.skuId,
        quantity: i.quantity,
      })),
    };

    try {
      const response = await api.post<ApiResponse<Order>>('/orders', payload);
      const createdOrder = response.data.data;
      clearCart();
      navigate(`/order-success/${createdOrder.orderCode}`);
    } catch (err: any) {
      console.error('Order checkout error:', err);
      const apiError = err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại tồn kho!';
      setErrorMessage(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Tiếp tục mua sắm
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">Thông Tin Giao Hàng</h2>
              <p className="text-xs text-slate-500">
                Vui lòng kiểm tra kỹ thông tin nhận hàng trước khi xác nhận đơn hàng.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email nhận đơn *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Địa chỉ nhận hàng chi tiết *</label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú cho đơn hàng</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Giao trong giờ hành chính, gọi trước khi đến..."
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Phương thức thanh toán</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Thanh toán khi nhận (COD)</div>
                    <div className="text-[11px] text-slate-400">Nhận hàng rồi trả tiền</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'VNPAY'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">VNPAY / Thẻ ATM</div>
                    <div className="text-[11px] text-slate-400">Cổng thanh toán điện tử</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý đặt hàng...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Xác Nhận Đặt Hàng ({totalAmount().toLocaleString('vi-VN')} đ)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Đơn Hàng ({items.length} món)</span>
              <span className="text-xs text-indigo-600 font-semibold">Tóm tắt đơn hàng</span>
            </h3>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.skuId} className="py-3 flex gap-3.5 items-center">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                    alt={item.spuName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{item.spuName}</h5>
                    <div className="text-[11px] text-slate-400 truncate">
                      {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">SL: {item.quantity}</div>
                  </div>
                  <div className="text-right font-extrabold text-xs text-slate-900">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-bold text-slate-800">{totalAmount().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển toàn quốc:</span>
                <span className="font-bold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Tổng thanh toán:</span>
                <span className="text-indigo-600 text-base">{totalAmount().toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
