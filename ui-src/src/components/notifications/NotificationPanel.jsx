import React from 'react';
import useGameStore from '../../store';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const notifications = useGameStore((state) => state.notifications);
  const markAllNotificationsAsRead = useGameStore((state) => state.actions.markAllNotificationsAsRead);
  const clearAllNotifications = useGameStore((state) => state.actions.clearAllNotifications);

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Notifications</h3>
          <div className="panel-actions">
            <button onClick={markAllNotificationsAsRead}>Mark All as Read</button>
            <button onClick={clearAllNotifications}>Clear All</button>
          </div>
        </div>
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className={`notification-item ${n.read ? 'read' : ''}`}>
                <p className="notification-message">{n.message}</p>
                <span className="notification-date">
                  {n.date.month}/{n.date.day}/{n.date.year}
                </span>
              </div>
            ))
          ) : (
            <p className="no-notifications">No notifications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
