'use client';

import { useWeb3 } from '../../../../../context/Web3Context';
import { useContract } from '../../../../../hooks/useContract';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ethers } from 'ethers';
import { use } from 'react';

interface PageParams {
  id: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default function CreateMilestone({ params }: PageProps) {
  const unwrappedParams = use(params);
  const { account } = useWeb3();
  const { contract, isGovernment } = useContract();
  const [formData, setFormData] = useState({
    description: '',
    targetDate: '',
    budget: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!account) {
      router.push('/');
    } else if (!isGovernment) {
      router.push(`/projects/${unwrappedParams.id}`);
    }
  }, [account, isGovernment, router, unwrappedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.targetDate) throw new Error('Target date is required');
      if (!formData.budget || parseFloat(formData.budget) <= 0) {
        throw new Error('Budget must be greater than 0');
      }

      // Convert date to timestamp
      const targetDate = Math.floor(new Date(formData.targetDate).getTime() / 1000);

      const tx = await contract.addMilestone(
        unwrappedParams.id,
        formData.description,
        targetDate,
        ethers.utils.parseEther(formData.budget)
      );

      await tx.wait();
      router.push(`/projects/${unwrappedParams.id}`);
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      setError(error.message || 'Error creating milestone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
              Add New Milestone
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
                    placeholder="Enter milestone description"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="targetDate" className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Target Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="targetDate"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleChange}
                      min={minDate}
                      className="w-full glass-input bg-[#0f1729]/50 border border-white/5 focus:border-blue-500/50 transition-colors rounded-xl pl-10 pr-4 py-3 text-white"
                      disabled={isLoading}
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Budget (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      step="0.000001"
                      min="0"
                      className="w-full glass-input bg-[#0f1729]/50 border border-white/5 focus:border-blue-500/50 transition-colors rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400"
                      placeholder="Enter milestone budget"
                      disabled={isLoading}
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">Ξ</span>
                    </div>
                  </div>
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
                      <span>Creating Milestone...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Milestone</span>
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