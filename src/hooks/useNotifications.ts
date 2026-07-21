import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

export function useNotifications() {
  const { user, getToken } = useAuth();
  const { addToast } = useToast();
  const lastCheckedOrders = useRef<Record<number, string>>({});
  const lastCheckedBookings = useRef<Record<number, string>>({});

  useEffect(() => {
    if (!user) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }

    const checkUpdates = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Check Orders
        const ordersRes = await fetch('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ordersRes.ok) {
          const { orders } = await ordersRes.json();
          orders.forEach((order: any) => {
            if (
              lastCheckedOrders.current[order.id] && 
              lastCheckedOrders.current[order.id] !== order.status &&
              order.status !== 'pending'
            ) {
              // Status changed!
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`Order #${order.orderToken} Update`, {
                  body: `Your order is now: ${order.status.replace('_', ' ')}`,
                  icon: '/favicon.ico'
                });
                addToast(`Order #${order.orderToken} is now ${order.status.replace('_', ' ')}`, 'info');
              } else {
                addToast(`Order #${order.orderToken} is now ${order.status.replace('_', ' ')}`, 'info');
              }
            }
            lastCheckedOrders.current[order.id] = order.status;
          });
        }

        // Check Bookings
        const bookingsRes = await fetch('/api/bookings/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.ok) {
          const { bookings } = await bookingsRes.json();
          bookings.forEach((booking: any) => {
            if (
              lastCheckedBookings.current[booking.id] && 
              lastCheckedBookings.current[booking.id] !== booking.status &&
              booking.status !== 'pending'
            ) {
              // Status changed!
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Table Booking Update', {
                  body: `Your booking for ${booking.date} at ${booking.time} is now: ${booking.status}`,
                  icon: '/favicon.ico'
                });
              } else {
                addToast(`Your booking for ${booking.date} at ${booking.time} is now: ${booking.status}`, 'info');
              }
            }
            lastCheckedBookings.current[booking.id] = booking.status;
          });
        }
      } catch (err: any) {
        if (err.message === 'Failed to fetch' || err instanceof TypeError) {
          // Dev server might be restarting, ignore silently
          return;
        }
        console.error('Error polling notifications', err);
      }
    };

    // Initial fetch to populate refs
    checkUpdates();

    // Poll every 10 seconds
    const interval = setInterval(checkUpdates, 10000);
    return () => clearInterval(interval);
  }, [user, getToken]);
}
