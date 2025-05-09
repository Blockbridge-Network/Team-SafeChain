'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../../../context/Web3Context';
import { useContract } from '../../../../../hooks/useContract';
import { ethers } from 'ethers';
import Link from 'next/link';
import { use } from 'react';
import { DisplayExpense, ContractExpense } from '../../../../../types/project';

interface PageParams {
  id: string;
  expenseId: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default function ExpenseDetails({ params }: PageProps) {
  const unwrappedParams = use(params);
  const { account } = useWeb3();
  const { contract } = useContract();
  const [expense, setExpense] = useState<DisplayExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      if (!contract) return;

      try {
        const expenseData = await contract.getExpense(
          unwrappedParams.id,
          unwrappedParams.expenseId
        ) as ContractExpense;

        setExpense({
          description: expenseData.description,
          amount: ethers.utils.formatEther(expenseData.amount),
          timestamp: expenseData.timestamp.toNumber(),
          proofIPFSHash: expenseData.proofIPFSHash,
          milestoneId: expenseData.milestoneId.toNumber()
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching expense:', error);
        setError('Error loading expense details');
        setIsLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [contract, unwrappedParams.id, unwrappedParams.expenseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error || 'Expense not found'}</p>
          <Link
            href={`/projects/${unwrappedParams.id}`}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Project
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
                href={`/projects/${unwrappedParams.id}`}
                className="glass-button-small"
              >
                Back to Project
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                    {expense.description}
                  </h1>
                  <p className="text-gray-400">
                    Recorded on {new Date(expense.timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="glass-stat-card w-full sm:w-auto">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm font-medium">Amount</h3>
                      <p className="text-2xl font-bold text-white mt-1">{expense.amount} USD</p>
                    </div>
                  </div>
                </div>
              </div>

              {expense.proofIPFSHash && (
                <div className="glass-card-hover p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Documentation</h3>
                  <a
                    href={`https://ipfs.io/ipfs/${expense.proofIPFSHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group"
                  >
                    <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="ml-2">View Documentation</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 