import { useState } from "react";
import {
  FiBell,
  FiUploadCloud,
  FiShare2,
  FiDownload,
  FiShield,
  FiClock,
  FiCheck,
} from "react-icons/fi";

const notificationData = [
  {
    id: 1,
    type: "upload",
    title: "File uploaded successfully",
    message: "Project Report.pdf was uploaded to your files.",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    type: "share",
    title: "New file shared with you",
    message: "Admin shared Project Documentation.docx with you.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "download",
    title: "File downloaded",
    message: "Project Report.pdf was downloaded successfully.",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "security",
    title: "Security activity",
    message: "Your account security settings were updated.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    type: "expiry",
    title: "Shared file expiring soon",
    message: "Architecture.png access will expire in 7 days.",
    time: "Yesterday",
    unread: false,
  },
];

function Notifications() {
  const [notifications, setNotifications] =
    useState(notificationData);

  const getIcon = (type) => {
    switch (type) {
      case "upload":
        return <FiUploadCloud />;

      case "share":
        return <FiShare2 />;

      case "download":
        return <FiDownload />;

      case "security":
        return <FiShield />;

      case "expiry":
        return <FiClock />;

      default:
        return <FiBell />;
    }
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="notifications-page">
      <div className="page-heading">
        <div>
          <h2>Notifications</h2>
          <p>Stay updated with your TrustShare activity.</p>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-read-button"
            onClick={markAllAsRead}
          >
            <FiCheck />
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-summary">
        <div className="notification-summary-icon">
          <FiBell />
        </div>

        <div>
          <strong>{unreadCount} unread notifications</strong>
          <span>
            You have {notifications.length} total notifications.
          </span>
        </div>
      </div>

      <div className="notifications-card">
        {notifications.map((notification) => (
          <div
            className={`notification-row ${
              notification.unread ? "unread" : ""
            }`}
            key={notification.id}
          >
            <div
              className={`notification-icon ${notification.type}`}
            >
              {getIcon(notification.type)}
            </div>

            <div className="notification-content">
              <strong>{notification.title}</strong>

              <p>{notification.message}</p>

              <span>{notification.time}</span>
            </div>

            {notification.unread && (
              <span className="unread-dot"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;