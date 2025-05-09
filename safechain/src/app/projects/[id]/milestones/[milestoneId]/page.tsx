'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../../../context/Web3Context';
import { useContract } from '../../../../../hooks/useContract';
import { ethers } from 'ethers';
import Link from 'next/link';
import { use } from 'react';
import { DisplayMilestone, ContractMilestone } from '../../../../../types/project';

interface PageParams {
  id: string;
  milestoneId: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default function MilestoneDetails({ params }: PageProps) {
  const unwrappedParams = use(params);
  const { account } = useWeb3();
  const { contract, isGovernment } = useContract();
  const [milestone, setMilestone] = useState<DisplayMilestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestoneDetails = async () => {
      if (!contract) return;

      try {
        const milestoneData = await contract.getMilestone(
          unwrappedParams.id,
          unwrappedParams.milestoneId
        ) as ContractMilestone;

        setMilestone({
          description: milestoneData.description,
          targetDate: milestoneData.targetDate.toNumber(),
          isCompleted: milestoneData.isCompleted,
          budget: ethers.utils.formatEther(milestoneData.budget),
          spent: ethers.utils.formatEther(milestoneData.spent),
          expenses: []
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching milestone:', error);
        setError('Error loading milestone details');
        setIsLoading(false);
      }
    };

    fetchMilestoneDetails();
  }, [contract, unwrappedParams.id, unwrappedParams.milestoneId]);

  const handleComplete = async () => {
    if (!contract) return;

    try {
      const tx = await contract.completeMilestone(unwrappedParams.id, unwrappedParams.milestoneId);
      await tx.wait();
      
      // Refresh milestone data
      const updatedMilestone = await contract.getMilestone(unwrappedParams.id, unwrappedParams.milestoneId);
      setMilestone(prev => ({
        ...prev!,
        isCompleted: updatedMilestone.isCompleted
      }));
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      setError(error.message || 'Error completing milestone');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading milestone details...</p>
        </div>
      </div>
    );
  }

  if (error || !milestone) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error || 'Milestone not found'}</p>
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
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                    {milestone.description}
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Target Date</p>
                      <p className="text-white text-lg">
                        {new Date(milestone.targetDate * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span
                        className={`status-badge ${
                          milestone.isCompleted
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}
                      >
                        {milestone.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className="glass-stat-card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm font-medium">Budget</h3>
                      <p className="text-2xl font-bold text-white mt-1">{milestone.budget} USD</p>
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
                      <p className="text-2xl font-bold text-green-400 mt-1">{milestone.spent} USD</p>
                    </div>
                  </div>
                </div>
              </div>

              {isGovernment && !milestone.isCompleted && (
                <div className="mt-8 flex justify-end">
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
          </div>
        </main>
      </div>
    </div>
  );
} 