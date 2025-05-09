import { useWeb3 } from '../context/Web3Context';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { account, roles, connectWallet } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDisconnect = () => {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('userAccount');
    localStorage.removeItem('userRoles');
    window.location.reload();
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-white">
              SafeChain
            </Link>
            {account && (
              <div className="hidden md:flex space-x-4">
                <Link href="/projects" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                  Projects
                </Link>
                <Link href="/milestones" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                  Milestones
                </Link>
                <Link href="/expenses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                  Expenses
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {account ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  {roles.isAdmin && (
                    <span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-sm">
                      Admin
                    </span>
                  )}
                  {roles.isGovernment && (
                    <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                      Government
                    </span>
                  )}
                  {roles.isAuditor && (
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                      Auditor
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-sm text-gray-300">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="hidden md:block px-3 py-1 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-md transition-colors"
                >
                  Disconnect
                </button>
                <Link 
                  href="/dashboard"
                  className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && account && (
          <div className="md:hidden mt-4 space-y-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {roles.isAdmin && (
                <span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-sm">
                  Admin
                </span>
              )}
              {roles.isGovernment && (
                <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                  Government
                </span>
              )}
              {roles.isAuditor && (
                <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                  Auditor
                </span>
              )}
            </div>
            <div className="text-sm text-gray-300">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/projects" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                Projects
              </Link>
              <Link href="/milestones" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                Milestones
              </Link>
              <Link href="/expenses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                Expenses
              </Link>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors text-center"
              >
                Dashboard
              </Link>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-md transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 