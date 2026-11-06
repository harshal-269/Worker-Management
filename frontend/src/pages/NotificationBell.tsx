
import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import api from "../api/axios";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  bookingId: number | null;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notificationsResponse, countResponse] = await Promise.all([
        api.get<Notification[]>("/notifications"),
        api.get<{ unreadCount: number }>("/notifications/unread-count"),
      ]);

      setNotifications(notificationsResponse.data);
      setUnreadCount(countResponse.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const intervalId = window.setInterval(fetchNotifications, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications]);

  const toggleNotifications = () => {
    setIsOpen((previous) => !previous);
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setLoading(true);

    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleNotifications}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Notifications
                </h3>
                <p className="text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              </div>

              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0 || loading}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} />
                )}
                Mark all read
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Bell className="mx-auto mb-3 text-slate-300" size={32} />
                  <p className="font-medium text-slate-700">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Updates about your bookings will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-100 px-4 py-4 transition ${
                      notification.read ? "bg-white" : "bg-blue-50/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          notification.read
                            ? "bg-slate-200"
                            : "bg-blue-500"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <button
                              type="button"
                              title="Mark as read"
                              onClick={() => markAsRead(notification.id)}
                              className="shrink-0 rounded-md p-1 text-blue-600 hover:bg-blue-100"
                            >
                              <Check size={15} />
                            </button>
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {formatDate(notification.createdAt)}
                          {notification.bookingId &&
                            ` · Booking #${notification.bookingId}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
