import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Inbox,
  Eye,
  EyeOff,
  Clock,
  Briefcase,
} from "lucide-react"; // Using Lucide React for SVG icons
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = " http://localhost:5000/api";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!token || !userId) {
      setError("Please log in to view notifications.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/notifications/${userId}`, { headers }),
        axios.get(`${API_BASE_URL}/notifications/${userId}/unread`, { headers }),
      ]);

      setNotifications(notificationsResponse.data.notifications || []);
      setUnreadCount(unreadCountResponse.data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch Data Error:", error.response?.data || error.message);
      setError(
        error.response?.status === 403
          ? "Session expired. Please log in again."
          : error.response?.data?.message || "Couldn’t load notifications."
      );
      if (error.response?.status === 403) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [token, userId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markNotificationAsRead = useCallback(
    async (id) => {
      setActionLoading(true);
      try {
        await axios.put(
          `${API_BASE_URL}/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setToast({ type: "success", message: "Notification marked as read." });
        fetchData();
      } catch (error) {
        setToast({
          type: "error",
          message: error.response?.data?.message || "Failed to mark as read.",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const deleteNotification = useCallback(
    async (id) => {
      setActionLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ type: "success", message: "Notification deleted!" });
        fetchData();
      } catch (error) {
        setToast({
          type: "error",
          message: error.response?.data?.message || "Failed to delete.",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const clearAllNotifications = useCallback(async () => {
    setActionLoading(true);
    try {
      await Promise.all(
        notifications.map((notification) =>
          axios.delete(`${API_BASE_URL}/notifications/${notification.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setToast({ type: "success", message: "All notifications cleared!" });
      fetchData();
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to clear notifications.",
      });
    } finally {
      setActionLoading(false);
    }
  }, [token, fetchData, notifications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-1/3 mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200 animate-pulse">
                <div className="h-5 bg-gray-100  rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100  rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col gap-4 sticky top-4 z-10 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
                </p>
              </div>
            </div>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 shadow-sm text-sm"
              disabled={actionLoading || notifications.length === 0}
            >
              <Trash2 className="h-5 w-5" />
              Clear All
            </button>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-gradient-to-r from-teal-300 to-cyan-500 text-white px-4 py-2 rounded-md text-sm shadow-sm w-full sm:w-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg text-sm flex items-center gap-2 max-w-md w-full z-50 ${
                toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
              }`}
              onClick={() => setToast(null)}
            >
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-red-200">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="h-6 w-6" />
              <span className="text-sm">{error}</span>
            </div>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-300 to-cyan-500 text-white px-4 py-2 rounded-md text-sm shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
              Log In
            </Link>
          </div>
        )}

        {/* Notifications Content */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markNotificationAsRead}
                onDelete={deleteNotification}
                disabled={actionLoading}
              />
            ))
          ) : (
            <EmptyState message="No notifications yet." link="/dashboard" linkText="Go to Dashboard" />
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced NotificationCard Component
const NotificationCard = ({ notification, onMarkRead, onDelete, disabled }) => {
  const getIconByType = (type) => {
    switch (type?.toLowerCase()) {
      case "job":
        return <Briefcase className="h-5 w-5 text-teal-600" />;
      case "application":
        return <CheckCircle className="h-5 w-5 text-cyan-500" />;
      default:
        return <Bell className="h-5 w-5 text-teal-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 sm:p-6 rounded-lg shadow-sm flex flex-col gap-4 border-l-4 ${
        notification.read
          ? "bg-white border-gray-200"
          : "bg-teal-50 border-teal-500"
      }`}
    >
      <div className="flex items-start gap-3">
        {getIconByType(notification.type)}
        <div className="flex-1">
          <p
            className={`text-sm sm:text-base ${
              notification.read ? "text-gray-700" : "text-teal-800 font-semibold"
            }`}
          >
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {new Date(notification.created_at || 0).toLocaleString()}
            {notification.type && (
              <span className="ml-2 text-gray-600">
                • {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-300 to-cyan-500 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50 shadow-sm"
            disabled={disabled}
          >
            <Eye className="h-4 w-4" />
            Mark as Read
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-md text-sm disabled:opacity-50 shadow-sm"
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </motion.div>
  );
};

// Enhanced EmptyState Component
const EmptyState = ({ message, link, linkText }) => (
  <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm text-center border border-gray-200">
    <Inbox className="h-12 w-12 text-teal-400 mx-auto mb-4" />
    <p className="text-sm sm:text-base text-gray-600 mb-4">{message}</p>
    {link && (
      <Link
        to={link}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-300 to-cyan-500 text-white px-4 py-2 rounded-md text-sm shadow-sm"
      >
        <ArrowLeft className="h-5 w-5" />
        {linkText}
      </Link>
    )}
  </div>
);

export default NotificationsPage;