'use client';

import Navbar from '../../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden hexagon-bg">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">About SafeChain</h1>
            <p className="text-gray-400">Revolutionizing government project management with blockchain</p>
          </div>
          
          <section className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              SafeChain is a revolutionary blockchain-based project tracking system designed to bring transparency, 
              accountability, and efficiency to government project management. Our mission is to ensure public funds 
              are utilized effectively and all stakeholders have access to real-time, verifiable project information.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass-card-hover p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Key Features</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Immutable project records on blockchain</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Real-time expense tracking and verification</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Milestone-based progress tracking</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Decentralized document storage</span>
                </li>
              </ul>
            </div>

            <div className="glass-card-hover p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400 mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Benefits</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-green-500/10 text-green-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Enhanced transparency in public spending</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-green-500/10 text-green-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Reduced fraud and mismanagement</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-green-500/10 text-green-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Improved stakeholder collaboration</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 rounded-lg bg-green-500/10 text-green-400 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Automated compliance and reporting</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="glass-card p-8 mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">How It Works</h2>
            </div>
            <div className="space-y-6 text-gray-300">
              <p className="leading-relaxed">
                SafeChain leverages blockchain technology to create an immutable record of all project-related 
                activities. Government agencies can create projects, set milestones, and track expenses, while 
                all stakeholders can verify the authenticity of each transaction.
              </p>
              <p className="leading-relaxed">
                Each expense is recorded on the blockchain with supporting documentation stored on IPFS, ensuring 
                both transparency and data integrity. Smart contracts automatically enforce project rules and 
                milestone completions, reducing the need for manual oversight.
              </p>
            </div>
          </section>

          <div className="text-center">
            <a
              href="/dashboard"
              className="web3-button inline-flex items-center space-x-2 text-lg"
            >
              <span>Get Started</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
} 