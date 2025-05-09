'use client';

import { useWeb3 } from '../../context/Web3Context';
import { useContract } from '../../hooks/useContract';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import Navbar from '../../components/Navbar';

interface Project {
  id: number;
  name: string;
  description: string;
  budget: string;
  spent: string;
  government: string;
  isCompleted: boolean;
  expenseCount: number;
  milestoneCount: number;
  lastUpdated: number;
}

export default function Projects() {
  const { account } = useWeb3();
  const { contract, isGovernment } = useContract();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) {
      router.push('/');
    }
  }, [account, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!contract) {
        console.log('Contract not initialized');
        return;
      }

      try {
        console.log('Fetching project count...');
        const projectCount = await contract.projectCount();
        console.log('Project count:', projectCount.toString());
        const projectsData = [];

        for (let i = 0; i < projectCount; i++) {
          console.log(`Fetching project ${i}...`);
          const project = await contract.getProject(i);
          console.log('Project data:', project);
          
          const safeToNumber = (value: any) => {
            try {
              return value ? value.toNumber() : 0;
            } catch (error) {
              console.warn('Error converting BigNumber to number:', error);
              return 0;
            }
          };

          projectsData.push({
            id: i,
            name: project.name,
            description: project.description,
            budget: ethers.utils.formatEther(project.budget),
            spent: ethers.utils.formatEther(project.spent),
            government: project.government,
            isCompleted: project.isCompleted,
            expenseCount: safeToNumber(project.expenseCount),
            milestoneCount: safeToNumber(project.milestoneCount),
            lastUpdated: safeToNumber(project.lastUpdated)
          });
        }

        console.log('All projects:', projectsData);
        setProjects(projectsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Error loading projects. Please check console for details.');
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [contract]);

  const filteredProjects = projects
    .filter(project => {
      if (filter === 'active') return !project.isCompleted;
      if (filter === 'completed') return project.isCompleted;
      return true;
    })
    .filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl -top-96 -right-96 animate-float"></div>
        <div className="absolute w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -bottom-48 -left-48 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <Navbar />

      <main className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-white">Projects</h1>
            <div className="flex items-center bg-blue-500/10 px-3 py-1 rounded-full">
              <span className="text-blue-400 text-sm">{filteredProjects.length} Total</span>
            </div>
          </div>
          
          <div className="flex space-x-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-card px-4 py-2 rounded-xl pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 text-white"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="glass-card px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white appearance-none pr-10 relative"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            {isGovernment && (
              <Link
                href="/projects/create"
                className="web3-button flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Project</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="glass-card-hover group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.isCompleted
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {project.isCompleted ? 'Completed' : 'Active'}
                  </span>
                </div>
                <p className="text-gray-400 mb-6 line-clamp-2">{project.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Budget Usage</span>
                      <span className="text-white">{((Number(project.spent) / Number(project.budget)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min((Number(project.spent) / Number(project.budget)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-3 text-center">
                      <div className="text-2xl font-bold text-white">{project.budget}</div>
                      <div className="text-xs text-gray-400 mt-1">Budget (USD)</div>
                    </div>
                    <div className="glass-card p-3 text-center">
                      <div className="text-2xl font-bold text-white">{project.spent}</div>
                      <div className="text-xs text-gray-400 mt-1">Spent (USD)</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>{project.milestoneCount} Milestones</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{project.expenseCount} Expenses</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="glass-card-hover text-center py-16 mt-8">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No projects found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
} 