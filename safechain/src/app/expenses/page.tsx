'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import Navbar from '../../components/Navbar';
import { ethers } from 'ethers';

interface Project {
  name: string;
  budget: ethers.BigNumber;
  milestoneCount: ethers.BigNumber;
}

interface ContractExpense {
  amount: ethers.BigNumber;
  description: string;
  timestamp?: ethers.BigNumber;
  isApproved: boolean;
}

interface DisplayExpense {
  id: number;
  projectId: number;
  amount: string;
  description: string;
  timestamp: number;
  isApproved: boolean;
  projectName: string;
}

export default function ExpensesPage() {
  const { contract, account, connectWallet } = useWeb3();
  const router = useRouter();
  const [expenses, setExpenses] = useState<DisplayExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!account) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          setError('Please connect your wallet to view expenses.');
          setIsLoading(false);
          return;
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (contract && account) {
      loadExpenses();
    }
  }, [contract, account]);

  const loadExpenses = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError(null);

    try {
      const projectCount = await contract.projectCount();
      const allExpenses: DisplayExpense[] = [];
      const now = Math.floor(Date.now() / 1000);

      for (let projectId = 0; projectId < projectCount.toNumber(); projectId++) {
        try {
          const project: Project = await contract.getProject(projectId);
          if (!project || !project.milestoneCount) continue;

          // Get milestone count from project
          const milestoneCount = project.milestoneCount.toNumber();
          
          // Iterate through each milestone to get its expenses
          for (let milestoneId = 0; milestoneId < milestoneCount; milestoneId++) {
            try {
              const expenses = await contract.getExpensesByMilestone(projectId, milestoneId);
              if (!expenses) continue;

              for (let expenseId = 0; expenseId < expenses.length; expenseId++) {
                try {
                  const expense: ContractExpense = expenses[expenseId];
                  if (!expense) continue;

                  // Use a default timestamp if none is provided
                  const timestamp = expense.timestamp && ethers.BigNumber.isBigNumber(expense.timestamp)
                    ? expense.timestamp.toNumber()
                    : now;

                  allExpenses.push({
                    id: expenseId,
                    projectId,
                    amount: ethers.utils.formatEther(expense.amount || 0),
                    description: expense.description || 'Untitled Expense',
                    timestamp,
                    isApproved: expense.isApproved || false,
                    projectName: project.name || `Project ${projectId}`
                  });
                } catch (error) {
                  console.warn(`Error loading expense ${expenseId} for milestone ${milestoneId} in project ${projectId}:`, error);
                }
              }
            } catch (error) {
              console.warn(`Error loading expenses for milestone ${milestoneId} in project ${projectId}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error loading project ${projectId}:`, error);
        }
      }

      // Sort expenses by timestamp (most recent first)
      allExpenses.sort((a, b) => b.timestamp - a.timestamp);
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toFixed(4)} USD`;
  };

  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Expenses Overview</h1>
          <p className="text-gray-400">Track all project expenses and their approval status</p>
        </div>

        {!account ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400 mb-4">Please connect your wallet to view expenses</p>
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
              onClick={loadExpenses}
              className="web3-button mt-4"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse p-6">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400">No expenses found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <div
                key={`${expense.projectId}-${expense.id}`}
                className="glass-card-hover p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {expense.description}
                    </h3>
                    <p className="text-gray-400">
                      Project: {expense.projectName}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    expense.isApproved 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {expense.isApproved ? 'Approved' : 'Pending'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(expense.timestamp)}
                  </div>
                  <div className="text-blue-400 font-medium">
                    {formatAmount(expense.amount)}
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