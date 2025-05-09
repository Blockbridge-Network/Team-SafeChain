'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import Navbar from '../../components/Navbar';
import ProjectDashboard from '../../components/ProjectDashboard';
import { ProjectList } from '../../components/ProjectList';
import RoleManager from '../../components/RoleManager';

export default function DashboardPage() {
  const { account, roles } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!account) {
      router.push('/');
    }
  }, [account, router]);

  if (!account) {
    return null;
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
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <div className="flex items-center bg-green-500/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            {roles.isGovernment && (
              <div className="flex space-x-4">
                <button 
                  onClick={() => router.push('/projects/create')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-md transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Project</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-400 mt-2">Welcome back! Here's an overview of your blockchain-secured projects.</p>
        </div>

        <ProjectDashboard />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="glass-card-hover">
              <div className="flex items-center justify-between mb-6 p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projects
                </h2>
                <button 
                  onClick={() => router.push('/projects')}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ProjectList />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {roles.isAdmin && (
              <div className="glass-card-hover">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Role Management
                  </h2>
                </div>
                <div className="p-4">
                  <RoleManager />
                </div>
              </div>
            )}

            <div className="glass-card-hover">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/milestones')}
                    className="w-full glass-card hover:bg-purple-500/10 transition-colors p-3 flex items-center group"
                  >
                    <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="flex-1 text-left">Milestones</span>
                    <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  <button 
                    onClick={() => router.push('/expenses')}
                    className="w-full glass-card hover:bg-green-500/10 transition-colors p-3 flex items-center group"
                  >
                    <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1 text-left">Expenses</span>
                    <span className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  <button 
                    onClick={() => router.push('/notifications')}
                    className="w-full glass-card hover:bg-blue-500/10 transition-colors p-3 flex items-center group"
                  >
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="flex-1 text-left">Notifications</span>
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 