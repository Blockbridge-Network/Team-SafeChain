'use client';

import { useWeb3 } from '../../../context/Web3Context';
import { useContract } from '../../../hooks/useContract';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ethers } from 'ethers';
import { use } from 'react';
import {
  DisplayProject,
  DisplayMilestone,
  DisplayExpense,
  ContractProject,
  ContractMilestone,
  ContractExpense
} from '../../../types/project';

interface PageParams {
  id: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default function ProjectDetails({ params }: PageProps) {
  const unwrappedParams = use(params);
  const { account } = useWeb3();
  const { contract, isGovernment, isAuditor } = useContract();
  const [project, setProject] = useState<DisplayProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!account) {
      router.push('/');
    }
  }, [account, router]);

  // Safely convert BigNumber to number
  const safeToNumber = (value: any): number => {
    try {
      if (!value) return 0;
      if (ethers.BigNumber.isBigNumber(value)) {
        return value.toNumber();
      }
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    } catch (error) {
      console.warn('Error converting to number:', error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!contract) {
        console.log('Contract not initialized');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching project:', unwrappedParams.id);
        const projectData = await contract.getProject(unwrappedParams.id) as ContractProject;
        console.log('Project data:', projectData);

        // Initialize project with empty milestones array
        const projectInfo: DisplayProject = {
          name: projectData.name,
          description: projectData.description,
          budget: ethers.utils.formatEther(projectData.budget),
          spent: ethers.utils.formatEther(projectData.spent),
          government: projectData.government,
          isCompleted: projectData.isCompleted,
          expenseCount: safeToNumber(projectData.expenseCount),
          milestoneCount: safeToNumber(projectData.milestoneCount),
          lastUpdated: safeToNumber(projectData.lastUpdated),
          milestones: []
        };

        // Fetch milestones and their expenses
        if (projectInfo.milestoneCount > 0) {
          console.log('Fetching milestones...');
          const milestonesData: DisplayMilestone[] = [];
          const expensesData: DisplayExpense[] = [];

          // First, fetch all milestones
          for (let i = 0; i < projectInfo.milestoneCount; i++) {
            try {
              console.log('Fetching milestone:', i);
              const milestone = await contract.getMilestone(unwrappedParams.id, i) as ContractMilestone;
              console.log('Milestone data:', milestone);
              
              if (milestone) {
                milestonesData.push({
                  description: milestone.description || '',
                  targetDate: safeToNumber(milestone.targetDate),
                  isCompleted: milestone.isCompleted || false,
                  budget: ethers.utils.formatEther(milestone.budget || '0'),
                  spent: ethers.utils.formatEther(milestone.spent || '0'),
                  expenses: []
                });
              }
            } catch (milestoneError) {
              console.error(`Error fetching milestone ${i}:`, milestoneError);
              continue;
            }
          }

          // Then, fetch all expenses
          if (projectInfo.expenseCount > 0) {
            console.log('Fetching expenses...');
            for (let i = 0; i < projectInfo.expenseCount; i++) {
              try {
                console.log('Fetching expense:', i);
                const expense = await contract.getExpense(unwrappedParams.id, i) as ContractExpense;
                console.log('Expense data:', expense);
                
                if (expense) {
                  const expenseInfo: DisplayExpense = {
                    description: expense.description || '',
                    amount: ethers.utils.formatEther(expense.amount || '0'),
                    timestamp: safeToNumber(expense.timestamp),
                    proofIPFSHash: expense.proofIPFSHash || '',
                    milestoneId: safeToNumber(expense.milestoneId)
                  };
                  expensesData.push(expenseInfo);

                  // Add expense to its milestone
                  const milestoneId = expenseInfo.milestoneId;
                  if (milestoneId >= 0 && milestoneId < milestonesData.length) {
                    milestonesData[milestoneId].expenses.push(expenseInfo);
                  }
                }
              } catch (expenseError) {
                console.error(`Error fetching expense ${i}:`, expenseError);
                continue;
              }
            }
          }

          // Update project with milestones and their expenses
          projectInfo.milestones = milestonesData;
        }

        setProject(projectInfo);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError('Error loading project details');
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [contract, unwrappedParams.id]);

  const handleComplete = async () => {
    if (!contract || !project) return;

    try {
      const tx = await contract.completeProject(unwrappedParams.id);
      await tx.wait();
      
      // Refresh project data
      const updatedProject = await contract.getProject(unwrappedParams.id);
      setProject(prev => ({
        ...prev!,
        isCompleted: updatedProject.isCompleted
      }));
    } catch (error: any) {
      console.error('Error completing project:', error);
      setError(error.message || 'Error completing project');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xl text-red-400 mb-4">{error || 'Project not found'}</p>
          <Link
            href="/projects"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -top-96 -right-96 animate-float"></div>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl -bottom-48 -left-48 animate-float-delayed"></div>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float-slow"></div>
      </div>

      {/* Hexagon grid overlay */}
      <div className="absolute inset-0 bg-hexagon-pattern opacity-10"></div>

      {/* Content */}
      <div className="relative z-10">
        <nav className="glass-nav sticky top-0 z-50 backdrop-blur-xl bg-[#0f1729]/50 border-b border-white/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                SafeChain
              </Link>
              <Link
                href="/projects"
                className="glass-button-small"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8 relative">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                    {project.name}
                  </h1>
                  <p className="text-gray-300">{project.description}</p>
                </div>
                <span
                  className={`status-badge ${
                    project.isCompleted
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  {project.isCompleted ? 'Completed' : 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="glass-stat-card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm font-medium">Budget</h3>
                      <p className="text-2xl font-bold text-white mt-1">{project.budget} USD</p>
                    </div>
                  </div>
                </div>
                <div className="glass-stat-card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm font-medium">Spent</h3>
                      <p className="text-2xl font-bold text-green-400 mt-1">{project.spent} USD</p>
                    </div>
                  </div>
                </div>
                <div className="glass-stat-card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm font-medium">Progress</h3>
                      <p className="text-2xl font-bold text-purple-400 mt-1">
                        {((Number(project.spent) / Number(project.budget)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Section */}
            <div className="glass-card p-4 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Milestones
                </h2>
                {isGovernment && !project.isCompleted && (
                  <Link
                    href={`/projects/${unwrappedParams.id}/milestones/create`}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-md transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Milestone</span>
                  </Link>
                )}
              </div>
              
              <div className="space-y-4">
                {project.milestones.map((milestone, index) => (
                  <Link
                    key={index}
                    href={`/projects/${unwrappedParams.id}/milestones/${index}`}
                    className="block glass-card-hover p-4 md:p-6 group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                          Milestone {index + 1}
                        </h3>
                        <p className="text-gray-400">{milestone.description}</p>
                      </div>
                      <span
                        className={`status-badge-small ${
                          milestone.isCompleted
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}
                      >
                        {milestone.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-white/5">
                      <div>
                        <span className="text-gray-400">Target Date</span>
                        <p className="text-white mt-1">
                          {new Date(milestone.targetDate * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Budget</span>
                        <p className="text-white mt-1">{milestone.budget} USD</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Spent</span>
                        <p className="text-white mt-1">{milestone.spent} USD</p>
                      </div>
                    </div>
                  </Link>
                ))}

                {project.milestones.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="text-gray-400">No milestones added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="glass-card p-4 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Expenses
                </h2>
                {isGovernment && !project.isCompleted && (
                  <Link
                    href={`/projects/${unwrappedParams.id}/expenses/create`}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-md transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Expense</span>
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {project.milestones.map((milestone, index) => (
                  <div key={index} className="glass-card p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {milestone.description}
                    </h3>
                    <div className="space-y-2">
                      {milestone.expenses.map((expense, expenseIndex) => (
                        <Link
                          key={expenseIndex}
                          href={`/projects/${unwrappedParams.id}/expenses/${expenseIndex}`}
                          className="block glass-card-hover p-4 md:p-6 group"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h4 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                                {expense.description}
                              </h4>
                              <p className="text-gray-400">
                                {new Date(expense.timestamp * 1000).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xl font-bold text-white">
                                {expense.amount} USD
                              </span>
                              {expense.proofIPFSHash && (
                                <div className="flex items-center space-x-2 mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>View Documentation</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {project.milestones.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400">No expenses recorded yet</p>
                  </div>
                )}
              </div>
            </div>

            {isGovernment && !project.isCompleted && (
              <div className="flex justify-end">
                <button
                  onClick={handleComplete}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-md transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mark as Completed</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 