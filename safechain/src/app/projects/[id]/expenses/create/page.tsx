'use client';

import { useWeb3 } from '../../../../../context/Web3Context';
import { useContract } from '../../../../../hooks/useContract';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ethers } from 'ethers';
import { ContractMilestone } from '../../../../../types/project';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function CreateExpense({ params }: { params: { id: string } }) {
  const { account } = useWeb3();
  const { contract, isGovernment } = useContract();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    proofFile: null as File | null,
    selectedMilestoneId: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<ContractMilestone[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!account) {
      router.push('/');
    } else if (!isGovernment) {
      router.push(`/projects/${params.id}`);
    }
  }, [account, isGovernment, router, params.id]);

  useEffect(() => {
    loadMilestones();
  }, [contract, params.id]);

  const loadMilestones = async () => {
    if (!contract) return;
    
    setLoadingMilestones(true);
    try {
      const project = await contract.getProject(params.id);
      const milestoneCount = project.milestoneCount.toNumber();
      const loadedMilestones: ContractMilestone[] = [];

      for (let i = 0; i < milestoneCount; i++) {
        try {
          const milestone = await contract.getMilestone(params.id, i);
          if (!milestone.isCompleted) {
            loadedMilestones.push({
              description: milestone.description,
              targetDate: milestone.targetDate,
              isCompleted: milestone.isCompleted,
              budget: milestone.budget,
              spent: milestone.spent
            });
          }
        } catch (error) {
          console.error(`Error loading milestone ${i}:`, error);
        }
      }

      setMilestones(loadedMilestones);
      if (loadedMilestones.length > 0) {
        setFormData(prev => ({ ...prev, selectedMilestoneId: 0 }));
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      setError('Error loading milestones. Please try again.');
    } finally {
      setLoadingMilestones(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setFileError(null);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (file) {
      if (validateFile(file)) {
        setFormData(prev => ({ ...prev, proofFile: file }));
      } else {
        e.target.value = ''; // Reset file input
        setFormData(prev => ({ ...prev, proofFile: null }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || milestones.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!formData.proofFile) throw new Error('Proof document is required');

      // Validate milestone budget
      const milestone = milestones[formData.selectedMilestoneId];
      const remainingBudget = milestone.budget.sub(milestone.spent);
      const expenseAmount = ethers.utils.parseEther(formData.amount);
      
      if (expenseAmount.gt(remainingBudget)) {
        throw new Error('Expense amount exceeds milestone remaining budget');
      }

      // TODO: Upload file to IPFS
      // For now, we'll use a placeholder hash
      const proofIPFSHash = 'QmPlaceholderHash';

      const tx = await contract.addExpense(
        params.id,
        formData.description,
        expenseAmount,
        proofIPFSHash,
        formData.selectedMilestoneId
      );

      await tx.wait();
      router.push(`/projects/${params.id}`);
    } catch (error: any) {
      console.error('Error creating expense:', error);
      setError(error.message || 'Error creating expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'selectedMilestoneId' ? parseInt(value) : value 
    }));
  };

  if (loadingMilestones) {
    return (
      <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading milestones...</p>
        </div>
      </div>
    );
  }

  if (milestones.length === 0) {
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
                  href={`/projects/${params.id}`}
                  className="glass-button-small"
                >
                  Back to Project
                </Link>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8">
                <div className="flex items-center space-x-4 text-yellow-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-lg">No active milestones available. Please add a milestone before adding expenses.</p>
                </div>
              </div>
            </div>
          </main>
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
                href={`/projects/${params.id}`}
                className="glass-button-small"
              >
                Back to Project
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
              Add New Expense
            </h1>

            {error && (
              <div className="glass-card border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="selectedMilestoneId" className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Milestone
                  </label>
                  <div className="relative">
                    <select
                      id="selectedMilestoneId"
                      name="selectedMilestoneId"
                      value={formData.selectedMilestoneId}
                      onChange={handleChange}
                      className="w-full glass-input bg-[#0f1729]/50 border border-white/5 focus:border-blue-500/50 transition-colors rounded-xl pl-10 pr-4 py-3 text-white appearance-none"
                      required
                      disabled={isLoading}
                    >
                      {milestones.map((milestone, index) => (
                        <option key={index} value={index} className="bg-[#0f1729]">
                          {milestone.description} ({ethers.utils.formatEther(milestone.budget.sub(milestone.spent))} USD available)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full glass-input bg-[#0f1729]/50 border border-white/5 focus:border-blue-500/50 transition-colors rounded-xl px-4 py-3 text-white placeholder-gray-400"
                    placeholder="Enter expense description"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.000001"
                      min="0"
                      className="w-full glass-input bg-[#0f1729]/50 border border-white/5 focus:border-blue-500/50 transition-colors rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400"
                      placeholder="Enter expense amount"
                      disabled={isLoading}
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">Ξ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="proofFile" className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Documentation
                  </label>
                  <div className="glass-input bg-[#0f1729]/50 border border-white/5 hover:border-blue-500/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      id="proofFile"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isLoading}
                      required
                    />
                    <label htmlFor="proofFile" className="cursor-pointer text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      {formData.proofFile ? (
                        <div>
                          <span className="text-blue-400 font-medium">{formData.proofFile.name}</span>
                          <p className="text-sm text-gray-400 mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-blue-400 font-medium">Click to upload documentation</span>
                          <p className="text-sm text-gray-400 mt-1">PDF, JPEG, PNG (max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {fileError && (
                    <p className="mt-2 text-sm text-red-400">{fileError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`web3-button w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center space-x-2`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Expense...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Expense</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 