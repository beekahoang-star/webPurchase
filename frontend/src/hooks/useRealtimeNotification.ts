import { useEffect } from 'react';
import { useAdminBadgeStore } from '../store/useAdminBadgeStore';

export function useRealtimeNotification() {
  const { incrementPendingOrders, addNotification } = useAdminBadgeStore();

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/v1/notifications/stream');

      eventSource.addEventListener('INIT', (e) => {
        console.log('[SSE] Stream connected:', e.data);
      });

      eventSource.addEventListener('ORDER_ALERT', (e) => {
        console.log('[SSE] New Order Alert received:', e.data);
        try {
          const payload = JSON.parse(e.data);
          incrementPendingOrders();
          addNotification({
            type: 'NEW_ORDER',
            message: `Đơn hàng mới: ${payload.orderCode} từ ${payload.customerName} (${Number(payload.totalAmount).toLocaleString('vi-VN')} đ)`,
            timestamp: new Date().toLocaleTimeString(),
          });
        } catch (err) {
          console.error('[SSE] Failed to parse event payload', err);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('[SSE] EventSource error or disconnected. Waiting to auto-reconnect...', err);
      };
    } catch (e) {
      console.warn('[SSE] Browser does not support EventSource or failed to initialize', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [incrementPendingOrders, addNotification]);
}
