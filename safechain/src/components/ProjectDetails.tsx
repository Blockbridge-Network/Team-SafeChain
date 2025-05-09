'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import AddExpense from './AddExpense';
import { ContractMilestone, ContractExpense, DisplayMilestone, DisplayExpense, DisplayProject } from '../types/project';

interface ProjectDetailsProps {
  projectId: number;
  onClose: () => void;
}

export default function ProjectDetails({ projectId, onClose }: ProjectDetailsProps) {
  const { contract, account } = useWeb3();
  const [project, setProject] = useState<DisplayProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const loadProjectDetails = async () => {
    if (!contract) {
      setError('Contract not initialized');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading project:', projectId);
      const projectData = await contract.getProject(projectId);
      console.log('Project data:', projectData);

      // Safely convert counts and log them
      const milestoneCount = safeToNumber(projectData.milestoneCount);
      const expenseCount = safeToNumber(projectData.expenseCount);
      console.log('Milestone count:', milestoneCount);
      console.log('Expense count:', expenseCount);

      // Create project data first without milestones
      const projectInfo: DisplayProject = {
        name: projectData.name,
        description: projectData.description,
        budget: ethers.utils.formatEther(projectData.budget),
        spent: ethers.utils.formatEther(projectData.spent),
        government: projectData.government,
        isCompleted: projectData.isCompleted,
        expenseCount,
        milestoneCount,
        lastUpdated: safeToNumber(projectData.lastUpdated),
        milestones: []
      };

      // Only fetch milestones if there are any
      if (milestoneCount > 0) {
        console.log('Fetching milestones...');
        for (let i = 0; i < milestoneCount; i++) {
          try {
            console.log('Fetching milestone', i);
            const milestone = await contract.getMilestone(projectId, i);
            console.log('Milestone data:', milestone);
            
            if (milestone) {
              const milestoneExpenses = await contract.getExpensesByMilestone(projectId, i);
              const formattedExpenses: DisplayExpense[] = milestoneExpenses.map((expense: ContractExpense) => ({
                description: expense.description || '',
                amount: ethers.utils.formatEther(expense.amount || '0'),
          timestamp: safeToNumber(expense.timestamp),
                proofIPFSHash: expense.proofIPFSHash || '',
                milestoneId: safeToNumber(expense.milestoneId)
              }));

              projectInfo.milestones.push({
                description: milestone.description || '',
                targetDate: safeToNumber(milestone.targetDate),
                isCompleted: milestone.isCompleted || false,
                budget: ethers.utils.formatEther(milestone.budget || '0'),
                spent: ethers.utils.formatEther(milestone.spent || '0'),
                expenses: formattedExpenses
              });
            }
          } catch (milestoneError: any) {
            console.error(`Error fetching milestone ${i}:`, milestoneError);
            // Skip this milestone but continue with others
            continue;
          }
        }
      }

      setProject(projectInfo);
    } catch (error: any) {
      console.error('Error loading project details:', error);
      if (error.code === 'CALL_EXCEPTION') {
        setError('Project not found or contract error. Please check if the project exists and you have the right permissions.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
      setError(error.message || 'Error loading project details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!contract) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const tx = await contract.completeProject(projectId);
      await tx.wait();
      await loadProjectDetails();
    } catch (error: any) {
      console.error('Error completing project:', error);
      setError(error.message || 'Error completing project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: number) => {
    if (!contract) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const tx = await contract.completeMilestone(projectId, milestoneId);
      await tx.wait();
      await loadProjectDetails();
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      setError(error.message || 'Error completing milestone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (contract && projectId !== undefined) {
    loadProjectDetails();
    }
  }, [contract, projectId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-500">Project not found</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg p-6 m-4 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">{project.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-lg font-semibold">{project.budget} USD</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Spent</p>
              <p className="text-lg font-semibold">{project.spent} USD</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Milestones</h3>
          {project.milestones.map((milestone: DisplayMilestone, index: number) => (
            <div key={index} className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                    <div>
                  <h4 className="font-semibold">{milestone.description}</h4>
                      <p className="text-sm text-gray-500">
                    Target Date: {new Date(milestone.targetDate * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Budget: {milestone.budget} USD</p>
                  <p className="text-sm text-gray-500">Spent: {milestone.spent} USD</p>
                </div>
              </div>

              {milestone.expenses && milestone.expenses.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Expenses</h5>
                  <div className="space-y-2">
                    {milestone.expenses.map((expense: DisplayExpense, expIndex: number) => (
                      <div key={expIndex} className="bg-white rounded p-2 text-sm">
                        <div className="flex justify-between">
                          <span>{expense.description}</span>
                          <span className="font-medium">{expense.amount} USD</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(expense.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            )}

              {!milestone.isCompleted && account === project.government && (
                <button
                  onClick={() => handleCompleteMilestone(index)}
                  disabled={isSubmitting}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Milestone'}
                </button>
                  )}
                </div>
          ))}
        </div>

        {!project.isCompleted && account === project.government && (
          <>
            <AddExpense projectId={projectId} onExpenseAdded={loadProjectDetails} />
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
              className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
              {isSubmitting ? 'Processing...' : 'Complete Project'}
          </button>
          </>
        )}
      </div>
    </div>
  );
}