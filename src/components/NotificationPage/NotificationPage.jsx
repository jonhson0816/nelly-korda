import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        let notifs = response.data.notifications;
        
        // Filter if needed
        if (filter === 'unread') {
          notifs = notifs.filter(n => !n.isRead);
        }

        setNotifications(notifs);
        setUnreadCount(response.data.unreadCount);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await axios.put(
          `${API_URL}/notifications/${notification._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to the link
      navigate(notification.link);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation(); // Prevent navigation
    
    try {
      await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: '👍',
      comment: '💬',
      reply: '↩️',
      message: '✉️',
      follow: '👤',
      mention: '@',
      achievement: '🏆',
      tournament: '🎾',
      admin_post: '📢',
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const getAvatarUrl = (user) => {
    if (user?.avatar?.url) return user.avatar.url;
    const name = `${user?.firstName || 'User'} ${user?.lastName || ''}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=50&background=1877f2&color=fff`;
  };

  if (loading) {
    return (
      <div className="notification-page">
        <div className="notification-container">
          <div className="notification-header">
            <h1>Notifications</h1>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="notification-container">
        {/* HEADER */}
        <div className="notification-header">
          <h1>Notifications</h1>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="notification-tabs">
          <button
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔔</span>
              <h3>No notifications</h3>
              <p>When you get notifications, they'll show up here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-avatar">
                  <img
                    src={getAvatarUrl(notification.sender)}
                    alt={notification.sender?.firstName}
                  />
                  <span className="notification-type-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>

                <div className="notification-content">
                  <p className="notification-text">
                    <strong>
                      {notification.sender?.firstName} {notification.sender?.lastName}
                    </strong>{' '}
                    {notification.content.replace(
                      `${notification.sender?.firstName} ${notification.sender?.lastName} `,
                      ''
                    )}
                  </p>
                  <span className="notification-time">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>

                {!notification.isRead && <div className="unread-dot"></div>}

                <button
                  className="delete-notification-btn"
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;