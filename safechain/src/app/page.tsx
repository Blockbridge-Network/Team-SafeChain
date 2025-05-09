'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push('/dashboard');
    }
  }, [account, router]);

  return (
    <div className="min-h-screen bg-[#0f1729] text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -top-48 -left-24 animate-float"></div>
        <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl top-96 -right-24 animate-float" style={{ animationDelay: '-2s' }}></div>
      </div>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="max-w-5xl mx-auto text-center mt-24">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-20 animate-pulse"></div>
              <h2 className="text-6xl font-bold leading-tight relative">
                Secure Government Project Tracking
                <br />
                <span className="text-gradient">
                  Powered by Blockchain
                </span>
              </h2>
            </div>
          </div>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Transparent, immutable, and efficient project management for government initiatives.
            Track expenses, milestones, and progress with unparalleled security.
          </p>

          <div className="flex gap-6 justify-center mb-16">
            <Link href="/about" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover-scale">
              Learn More
            </Link>
            <Link href="/dashboard" className="px-8 py-4 glass-card hover-scale">
              Launch App
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass-card p-8 glow-effect">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Transparent</h3>
              <p className="text-gray-400">All project data is stored on the blockchain, ensuring complete transparency and accountability.</p>
            </div>

            <div className="glass-card p-8 glow-effect">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Secure</h3>
              <p className="text-gray-400">Military-grade encryption and blockchain security for your sensitive project data.</p>
            </div>

            <div className="glass-card p-8 glow-effect">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Efficient</h3>
              <p className="text-gray-400">Streamlined processes and real-time updates for maximum efficiency and productivity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

