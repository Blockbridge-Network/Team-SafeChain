'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import Navbar from '../../components/Navbar';
import { ethers } from 'ethers';

interface Notification {
  id: number;
  type: 'milestone' | 'expense' | 'project' | 'deadline';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  projectId: number;
  projectName: string;
}

export default function NotificationsPage() {
  const { contract, account, connectWallet } = useWeb3();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!account) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          setError('Please connect your wallet to view notifications.');
          setIsLoading(false);
          return;
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (contract && account) {
      loadNotifications();
    }
  }, [contract, account]);

  const loadNotifications = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError(null);

    try {
      const projectCount = await contract.projectCount();
      const allNotifications: Notification[] = [];

      for (let projectId = 0; projectId < projectCount.toNumber(); projectId++) {
        try {
          const project = await contract.getProject(projectId);
          const now = Math.floor(Date.now() / 1000);
          
          // Add project creation notification if createdAt exists
          if (project.createdAt && ethers.BigNumber.isBigNumber(project.createdAt)) {
            allNotifications.push({
              id: allNotifications.length,
              type: 'project',
              title: 'New Project Created',
              message: `Project "${project.name}" has been created`,
              timestamp: project.createdAt.toNumber(),
              isRead: true,
              projectId,
              projectName: project.name
            });
          }

          // Add milestone notifications
          if (project.milestoneCount && ethers.BigNumber.isBigNumber(project.milestoneCount)) {
            const milestoneCount = project.milestoneCount.toNumber();
            for (let milestoneId = 0; milestoneId < milestoneCount; milestoneId++) {
              try {
                const milestone = await contract.getMilestone(projectId, milestoneId);
                
                if (milestone.createdAt && ethers.BigNumber.isBigNumber(milestone.createdAt)) {
                  allNotifications.push({
                    id: allNotifications.length,
                    type: 'milestone',
                    title: 'New Milestone Added',
                    message: `New milestone "${milestone.description}" added to project "${project.name}"`,
                    timestamp: milestone.createdAt.toNumber(),
                    isRead: true,
                    projectId,
                    projectName: project.name
                  });
                }

                // Add deadline notifications for upcoming milestones
                if (milestone.deadline && ethers.BigNumber.isBigNumber(milestone.deadline)) {
                  const deadline = milestone.deadline.toNumber();
                  if (!milestone.isCompleted && deadline > now && deadline - now < 7 * 24 * 60 * 60) {
                    allNotifications.push({
                      id: allNotifications.length,
                      type: 'deadline',
                      title: 'Upcoming Deadline',
                      message: `Milestone "${milestone.description}" in project "${project.name}" is due soon`,
                      timestamp: now,
                      isRead: false,
                      projectId,
                      projectName: project.name
                    });
                  }
                }

                // Add expense notifications for this milestone
                try {
                  const expenses = await contract.getExpensesByMilestone(projectId, milestoneId);
                  if (expenses) {
                    for (const expense of expenses) {
                      if (expense && expense.amount && expense.timestamp && ethers.BigNumber.isBigNumber(expense.timestamp)) {
                        allNotifications.push({
                          id: allNotifications.length,
                          type: 'expense',
                          title: 'New Expense Added',
                          message: `New expense of ${ethers.utils.formatEther(expense.amount)} USD added to project "${project.name}"`,
                          timestamp: expense.timestamp.toNumber(),
                          isRead: true,
                          projectId,
                          projectName: project.name
                        });
                      }
                    }
                  }
                } catch (error) {
                  console.warn(`Error loading expenses for milestone ${milestoneId} in project ${projectId}:`, error);
                }
              } catch (error) {
                console.warn(`Error loading milestone ${milestoneId} for project ${projectId}:`, error);
              }
            }
          }
        } catch (error) {
          console.warn(`Error loading project ${projectId}:`, error);
        }
      }

      // Sort notifications by timestamp (most recent first)
      allNotifications.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'milestone':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'expense':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'deadline':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Stay updated with your project activities</p>
        </div>

        {!account ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400 mb-4">Please connect your wallet to view notifications</p>
            <button
              onClick={connectWallet}
              className="web3-button"
            >
              Connect Wallet
            </button>
          </div>
        ) : error ? (
          <div className="glass-card p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadNotifications}
              className="web3-button mt-4"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-white/10 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400">No notifications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card-hover p-6 ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'project' ? 'text-blue-400 bg-blue-500/10' :
                    notification.type === 'milestone' ? 'text-purple-400 bg-purple-500/10' :
                    notification.type === 'expense' ? 'text-green-400 bg-green-500/10' :
                    'text-yellow-400 bg-yellow-500/10'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(notification.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 