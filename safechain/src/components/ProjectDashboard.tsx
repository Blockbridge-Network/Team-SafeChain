import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';

interface Project {
  name: string;
  budget: ethers.BigNumber;
  spent: ethers.BigNumber;
  isCompleted: boolean;
  milestoneCount: ethers.BigNumber;
  createdAt?: ethers.BigNumber;
}

interface Milestone {
  description: string;
  createdAt?: ethers.BigNumber;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: string;
  totalSpent: string;
  recentActivity: {
    timestamp: number;
    type: 'project' | 'milestone' | 'expense';
    description: string;
  }[];
}

export default function ProjectDashboard() {
  const { contract } = useWeb3();
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: '0',
    totalSpent: '0',
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contract) {
      loadStats();
    }
  }, [contract]);

  const loadStats = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError(null);

    try {
      const projectCount = await contract.projectCount();
      let activeCount = 0;
      let completedCount = 0;
      let totalBudget = ethers.BigNumber.from(0);
      let totalSpent = ethers.BigNumber.from(0);
      const recentActivity: any[] = [];

      for (let i = 0; i < projectCount.toNumber(); i++) {
        try {
          const project: Project = await contract.getProject(i);
          
          // Update project counts
          if (project.isCompleted) {
            completedCount++;
          } else {
            activeCount++;
          }

          // Safely add budget and spent amounts
          if (project.budget && ethers.BigNumber.isBigNumber(project.budget)) {
            totalBudget = totalBudget.add(project.budget);
          }
          
          if (project.spent && ethers.BigNumber.isBigNumber(project.spent)) {
            totalSpent = totalSpent.add(project.spent);
          }

          // Add project creation to activity if timestamp exists
          if (project.createdAt && ethers.BigNumber.isBigNumber(project.createdAt)) {
            recentActivity.push({
              timestamp: project.createdAt.toNumber(),
              type: 'project',
              description: `Project "${project.name}" created`
            });
          }

          // Process milestones if they exist
          if (project.milestoneCount && ethers.BigNumber.isBigNumber(project.milestoneCount)) {
            const milestoneCount = project.milestoneCount.toNumber();
            
            for (let j = 0; j < milestoneCount; j++) {
              try {
                const milestone: Milestone = await contract.getMilestone(i, j);
                if (milestone && milestone.createdAt && ethers.BigNumber.isBigNumber(milestone.createdAt)) {
                  recentActivity.push({
                    timestamp: milestone.createdAt.toNumber(),
                    type: 'milestone',
                    description: `Milestone "${milestone.description}" added to "${project.name}"`
                  });
                }

                // Process expenses for this milestone
                try {
                  const expenses = await contract.getExpensesByMilestone(i, j);
                  if (expenses) {
                    for (const expense of expenses) {
                      if (expense && expense.timestamp && ethers.BigNumber.isBigNumber(expense.timestamp)) {
                        recentActivity.push({
                          timestamp: expense.timestamp.toNumber(),
                          type: 'expense',
                          description: `Expense of ${ethers.utils.formatEther(expense.amount)} USD added to "${project.name}"`
                        });
                      }
                    }
                  }
                } catch (error) {
                  console.warn(`Error loading expenses for milestone ${j} in project ${i}:`, error);
                }
              } catch (error) {
                console.warn(`Error loading milestone ${j} for project ${i}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error processing project ${i}:`, error);
        }
      }

      // Sort activity by timestamp descending
      recentActivity.sort((a, b) => b.timestamp - a.timestamp);

      setStats({
        totalProjects: projectCount.toNumber(),
        activeProjects: activeCount,
        completedProjects: completedCount,
        totalBudget: ethers.utils.formatEther(totalBudget),
        totalSpent: ethers.utils.formatEther(totalSpent),
        recentActivity: recentActivity.slice(0, 5),
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dashboard-stat animate-pulse">
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
            <div className="h-8 bg-white/10 rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  const budgetUtilization = Number(stats.totalSpent) / Number(stats.totalBudget) * 100;
  const formattedBudget = Number(stats.totalBudget).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedSpent = Number(stats.totalSpent).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="dashboard-stat">
          <div className="absolute top-2 right-2">
            <svg className="w-8 h-8 text-blue-400/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Projects</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.totalProjects}</p>
          <div className="flex items-center mt-4">
            <div className="flex-1">
              <div className="text-xs text-gray-400">Active</div>
              <div className="text-sm font-medium text-blue-400">{stats.activeProjects}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400">Completed</div>
              <div className="text-sm font-medium text-green-400">{stats.completedProjects}</div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-stat">
          <div className="absolute top-2 right-2">
            <svg className="w-8 h-8 text-purple-400/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Budget</h3>
          <p className="text-3xl font-bold text-white mt-2">{formattedBudget} USD</p>
          <div className="mt-4">
            <div className="text-xs text-gray-400">Spent</div>
            <div className="text-sm font-medium text-purple-400">{formattedSpent} USD</div>
          </div>
        </div>
        
        <div className="dashboard-stat">
          <div className="absolute top-2 right-2">
            <svg className="w-8 h-8 text-blue-400/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Budget Utilization</h3>
          <p className="text-3xl font-bold text-gradient mt-2">{budgetUtilization.toFixed(1)}%</p>
          <div className="mt-4">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
          </div>
        </div>
      </div>

        <div className="dashboard-stat">
          <div className="absolute top-2 right-2">
            <svg className="w-8 h-8 text-green-400/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Project Status</h3>
          <div className="flex items-center justify-center h-24">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  className="text-gray-700/30"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-green-400"
                  strokeWidth="4"
                  strokeDasharray={`${stats.completedProjects / stats.totalProjects * 226} 226`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="48"
                  cy="48"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold text-gradient">
                  {((stats.completedProjects / stats.totalProjects) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card-hover">
        <div className="flex items-center justify-between mb-6 p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${activity.type === 'project' ? 'bg-blue-500/10 text-blue-400' :
                  activity.type === 'milestone' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-green-500/10 text-green-400'}
              `}>
                {activity.type === 'project' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ) : activity.type === 'milestone' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}