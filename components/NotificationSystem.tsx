
import React, { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'event';
}

interface NotificationSystemProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-24 left-6 z-[60] flex flex-col gap-3 pointer-events-none w-72">
      {notifications.map((n) => (
        <NotificationItem 
          key={n.id} 
          notification={n} 
          onRemove={removeNotification} 
        />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onRemove: (id: string) => void }> = ({ notification, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Immediate show
    setVisible(true);
    
    // Importance-based duration: Alert (5s), Event (4s), Info (3s)
    let duration = 3000;
    if (notification.type === 'alert') duration = 5000;
    if (notification.type === 'event') duration = 4000;

    const timer = setTimeout(() => {
      setVisible(false);
      // Wait for exit animation before calling parent removal
      setTimeout(() => onRemove(notification.id), 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, notification.type, onRemove]);

  const icons = {
    info: '🛰️',
    alert: '⚠️',
    event: '🌠',
  };

  const typeStyles = {
    info: 'text-blue-400',
    alert: 'text-orange-400',
    event: 'text-indigo-400'
  };

  return (
    <div
      className={`glass p-4 rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 pointer-events-auto cursor-pointer hover:bg-white/5 ${
        visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
      onClick={() => {
        setVisible(false);
        setTimeout(() => onRemove(notification.id), 500);
      }}
    >
      <div className="flex gap-3">
        <span className="text-xl">{icons[notification.type]}</span>
        <div className="flex-1">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${typeStyles[notification.type]}`}>
            {notification.title}
          </h4>
          <p className="text-xs text-white/70 font-medium leading-tight">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
