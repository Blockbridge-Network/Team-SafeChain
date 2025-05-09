'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { PROJECT_TRACKER_ABI, CONTRACT_ADDRESSES, ROLES } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

interface Roles {
  isAdmin: boolean;
  isDefaultAdmin: boolean;
  isGovernment: boolean;
  isAuditor: boolean;
}

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  contract: ethers.Contract | null;
  account: string | null;
  signer: ethers.Signer | null;
  roles: Roles;
  connectWallet: () => Promise<void>;
  isConnecting: boolean;
  connectionError: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  contract: null,
  account: null,
  signer: null,
  roles: {
    isAdmin: false,
    isDefaultAdmin: false,
    isGovernment: false,
    isAuditor: false
  },
  connectWallet: async () => {},
  isConnecting: false,
  connectionError: null
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Roles>({
    isAdmin: false,
    isDefaultAdmin: false,
    isGovernment: false,
    isAuditor: false
  });

  const checkRoles = async (address: string, contractInstance: ethers.Contract) => {
    try {
      const roleResults = await contractInstance.checkRoles(address);
      
      const newRoles = {
        isAdmin: roleResults[0],
        isDefaultAdmin: roleResults[1],
        isGovernment: roleResults[2],
        isAuditor: roleResults[3]
      };

      setRoles(newRoles);
      localStorage.setItem('userRoles', JSON.stringify(newRoles));

      console.log('Roles checked for', address, ':', newRoles);
    } catch (error) {
      console.error('Error checking roles:', error);
      setRoles({
        isAdmin: false,
        isDefaultAdmin: false,
        isGovernment: false,
        isAuditor: false
      });
    }
  };

  const initializeContract = (newSigner: ethers.Signer) => {
    try {
      const projectTrackerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PROJECT_TRACKER,
        PROJECT_TRACKER_ABI,
        newSigner
      );
      setContract(projectTrackerContract);
      return projectTrackerContract;
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        // First, try to get current accounts
        const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        
        // If we have accounts, request permissions to force the popup
        if (currentAccounts.length > 0) {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        }
        
        // Now request accounts (this will show the popup if no accounts are selected)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (!accounts || !accounts[0]) throw new Error('No accounts found');
        
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const newSigner = web3Provider.getSigner();
        const projectTrackerContract = initializeContract(newSigner);

        setProvider(web3Provider);
        setAccount(accounts[0]);
        setSigner(newSigner);
        
        // Save connection state
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('userAccount', accounts[0]);

        await checkRoles(accounts[0], projectTrackerContract);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
        // Clear stored connection state on error
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('userAccount');
        localStorage.removeItem('userRoles');
        throw error;
      } finally {
        setIsConnecting(false);
      }
    } else {
      const error = 'Please install MetaMask!';
      setConnectionError(error);
      throw new Error(error);
    }
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    const savedAccount = localStorage.getItem('userAccount');
    const savedRoles = localStorage.getItem('userRoles');

    if (wasConnected && savedAccount && window.ethereum) {
      // Check if we're already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts: any) => {
          if (accounts.length > 0 && window.ethereum) {
            // We're already connected, initialize everything
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const newSigner = web3Provider.getSigner();
            const projectTrackerContract = initializeContract(newSigner);

            setProvider(web3Provider);
            setAccount(accounts[0]);
            setSigner(newSigner);
            
            if (savedRoles) {
              try {
                setRoles(JSON.parse(savedRoles));
              } catch (error) {
                console.error('Error parsing saved roles:', error);
                // If roles parsing fails, check them again
                await checkRoles(accounts[0], projectTrackerContract);
              }
            } else {
              // If no saved roles, check them
              await checkRoles(accounts[0], projectTrackerContract);
            }
          } else {
            // Not connected, clear stored data
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('userAccount');
            localStorage.removeItem('userRoles');
            setAccount(null);
            setProvider(null);
            setSigner(null);
            setContract(null);
            setRoles({
              isAdmin: false,
              isDefaultAdmin: false,
              isGovernment: false,
              isAuditor: false
            });
          }
        })
        .catch(error => {
          console.error('Error checking accounts:', error);
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('userAccount');
          localStorage.removeItem('userRoles');
          setAccount(null);
          setProvider(null);
          setSigner(null);
          setContract(null);
          setRoles({
            isAdmin: false,
            isDefaultAdmin: false,
            isGovernment: false,
            isAuditor: false
          });
        });
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    const ethereum = window.ethereum;
    if (ethereum) {
      const handleAccountsChanged = async (newAccounts: unknown) => {
        const accounts = newAccounts as string[];
        if (accounts?.[0]) {
          try {
            // Update account
            setAccount(accounts[0]);
            localStorage.setItem('userAccount', accounts[0]);

            // Reinitialize provider and signer
            if (!window.ethereum) throw new Error('No ethereum provider found');
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const newSigner = web3Provider.getSigner();
            setProvider(web3Provider);
            setSigner(newSigner);

            // Reinitialize contract with new signer
            const projectTrackerContract = initializeContract(newSigner);
            
            // Check roles with new contract instance
            await checkRoles(accounts[0], projectTrackerContract);
          } catch (error) {
            console.error('Error handling account change:', error);
            // Reset state on error
            setAccount(null);
            setRoles({
              isAdmin: false,
              isDefaultAdmin: false,
              isGovernment: false,
              isAuditor: false
            });
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('userAccount');
            localStorage.removeItem('userRoles');
          }
        } else {
          // Handle disconnection
          setAccount(null);
          setRoles({
            isAdmin: false,
            isDefaultAdmin: false,
            isGovernment: false,
            isAuditor: false
          });
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('userAccount');
          localStorage.removeItem('userRoles');
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      const handleDisconnect = () => {
        setAccount(null);
        setRoles({
          isAdmin: false,
          isDefaultAdmin: false,
          isGovernment: false,
          isAuditor: false
        });
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('userAccount');
        localStorage.removeItem('userRoles');
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleDisconnect);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
        ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [contract]);

  return (
    <Web3Context.Provider 
      value={{ 
        provider, 
        contract, 
        account, 
        signer, 
        roles, 
        connectWallet,
        isConnecting,
        connectionError
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);