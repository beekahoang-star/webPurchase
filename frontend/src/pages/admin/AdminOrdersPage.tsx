import React, { useEffect, useState } from 'react';
import { ShoppingBag, Eye, CheckCircle2, XCircle, Clock, Truck, X } from 'lucide-react';
import { api } from '../../services/api';
import { ApiResponse, Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = () => {
    setIsLoading(true);
    api.get<ApiResponse<{ content: Order[] }>>('/admin/orders?page=0&size=20')
      .then((res) => setOrders(res.data.data?.content || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ, cập nhật trạng thái giao hàng và chi tiết sản phẩm của từng đơn hàng.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Tổng Tiền</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {order.orderCode}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'PROCESSING'
                        ? 'bg-blue-50 text-blue-700'
                        : order.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem Chi Tiết
                    </button>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5" /> Xử lý
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Giao xong
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Chi Tiết Đơn Hàng</h3>
                <p className="text-xs font-mono text-indigo-600 mt-0.5">{selectedOrder.orderCode}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-slate-400">Khách hàng:</p>
                  <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-slate-600">{selectedOrder.customerPhone}</p>
                  <p className="text-slate-600">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-slate-400">Địa chỉ giao hàng:</p>
                  <p className="font-medium text-slate-800">{selectedOrder.shippingAddress}</p>
                  <p className="text-slate-400 mt-2">Phương thức: <span className="font-bold text-slate-700">{selectedOrder.paymentMethod}</span></p>
                </div>
              </div>

              {/* Preserved items list */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Danh Sách Sản Phẩm Trong Đơn
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => {
                    const snap = item.variantSnapshot;
                    return (
                      <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{snap.spu_name}</span>
                          <span className="font-mono text-xs font-bold text-indigo-600">
                            {Number(item.subtotal).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Mã phân loại: {snap.sku_code} &bull; Đơn giá: {Number(item.unitPrice).toLocaleString('vi-VN')} đ &bull; Số lượng: {item.quantity}
                        </div>
                        {snap.options && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {Object.entries(snap.options).map(([k, v]) => (
                              <span key={k} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
