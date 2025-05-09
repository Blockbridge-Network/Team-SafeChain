'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import Navbar from '../../components/Navbar';
import { ethers } from 'ethers';

interface Project {
  name: string;
  milestoneCount: ethers.BigNumber;
}

interface ContractMilestone {
  description: string;
  deadline?: ethers.BigNumber;
  isCompleted: boolean;
}

interface DisplayMilestone {
  id: number;
  projectId: number;
  description: string;
  deadline: number;
  isCompleted: boolean;
  projectName: string;
}

export default function MilestonesPage() {
  const { contract, account, connectWallet } = useWeb3();
  const router = useRouter();
  const [milestones, setMilestones] = useState<DisplayMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!account) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          setError('Please connect your wallet to view milestones.');
          setIsLoading(false);
          return;
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (contract && account) {
      loadMilestones();
    }
  }, [contract, account]);

  const loadMilestones = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError(null);

    try {
      const projectCount = await contract.projectCount();
      const allMilestones: DisplayMilestone[] = [];
      const now = Math.floor(Date.now() / 1000);

      for (let projectId = 0; projectId < projectCount.toNumber(); projectId++) {
        try {
          const project: Project = await contract.getProject(projectId);
          if (!project || !project.milestoneCount) continue;

          const milestoneCount = project.milestoneCount.toNumber();

          for (let milestoneId = 0; milestoneId < milestoneCount; milestoneId++) {
            try {
              const milestone: ContractMilestone = await contract.getMilestone(projectId, milestoneId);
              if (!milestone) continue;

              // Use a default deadline if none is provided
              const deadline = milestone.deadline && ethers.BigNumber.isBigNumber(milestone.deadline)
                ? milestone.deadline.toNumber()
                : now + (7 * 24 * 60 * 60); // Default to 7 days from now

              allMilestones.push({
                id: milestoneId,
                projectId,
                description: milestone.description || 'Untitled Milestone',
                deadline,
                isCompleted: milestone.isCompleted || false,
                projectName: project.name || `Project ${projectId}`
              });
            } catch (error) {
              console.warn(`Error loading milestone ${milestoneId} for project ${projectId}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error loading project ${projectId}:`, error);
        }
      }

      // Sort milestones by deadline
      allMilestones.sort((a, b) => a.deadline - b.deadline);
      setMilestones(allMilestones);
    } catch (error) {
      console.error('Error loading milestones:', error);
      setError('Failed to load milestones. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Milestones Overview</h1>
          <p className="text-gray-400">Track all project milestones and their status</p>
        </div>

        {!account ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400 mb-4">Please connect your wallet to view milestones</p>
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
              onClick={loadMilestones}
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
        ) : milestones.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400">No milestones found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {milestones.map((milestone) => (
              <div
                key={`${milestone.projectId}-${milestone.id}`}
                className="glass-card-hover p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {milestone.description}
                    </h3>
                    <p className="text-gray-400">
                      Project: {milestone.projectName}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    milestone.isCompleted 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {milestone.isCompleted ? 'Completed' : 'In Progress'}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Deadline: {formatDate(milestone.deadline)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 