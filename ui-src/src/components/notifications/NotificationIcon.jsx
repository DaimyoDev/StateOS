import React from 'react';
import useGameStore from '../../store';
import './NotificationIcon.css';

const NotificationIcon = ({ onClick }) => {
  const unreadCount = useGameStore((state) => 
    state.notifications.filter(n => !n.read).length
  );

  return (
    <div className="notification-icon-container" onClick={onClick}>
      <i className="fas fa-bell"></i>
      <span className="notification-badge">{unreadCount}</span>
    </div>
  );
};

export default NotificationIcon;
