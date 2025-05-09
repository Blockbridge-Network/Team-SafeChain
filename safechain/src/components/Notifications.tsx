import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Notification } from '../types/project';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { contract, account } = useWeb3();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!contract || !account) return;

    try {
      const notifs = await contract.getNotifications(account);
      setNotifications(notifs.map((n: any) => ({
        projectId: n.projectId.toNumber(),
        message: n.message,
        timestamp: n.timestamp.toNumber(),
        isRead: n.isRead
      })));
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      setError(error.message || 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (index: number) => {
    if (!contract) return;

    try {
      const tx = await contract.markNotificationAsRead(index);
      await tx.wait();
      await loadNotifications();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [contract, account]);

  if (loading) {
    return <div className="animate-pulse">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!notifications.length) {
    return <div className="text-gray-500">No notifications</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
              <div
                key={`${notification.projectId}-${notification.timestamp}`}
          className={`p-4 rounded-lg border ${
            notification.isRead ? 'bg-gray-50' : 'bg-white border-blue-200'
                }`}
              >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Project #{notification.projectId}</p>
              <p className="text-gray-600">{notification.message}</p>
                <p className="text-sm text-gray-500">
                {formatDistanceToNow(notification.timestamp * 1000, { addSuffix: true })}
                </p>
            </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(index)}
                className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
        </div>
      ))}
    </div>
  );
}