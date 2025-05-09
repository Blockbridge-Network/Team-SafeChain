import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { ROLES } from '../config/contracts';

export default function RoleManager() {
  const { contract, roles } = useWeb3();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [action, setAction] = useState<'assign' | 'revoke'>('assign');

  const handleRoleAction = async (roleType: 'auditor' | 'government') => {
    if (!contract || !address) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let tx;
      if (action === 'assign') {
        if (roleType === 'auditor') {
          tx = await contract.addAuditor(address);
        } else {
          tx = await contract.addGovernmentOfficial(address);
        }
      } else {
        // Revoke role
        const roleHash = roleType === 'auditor' ? ROLES.AUDITOR_ROLE : ROLES.GOVERNMENT_ROLE;
        tx = await contract.revokeRole(roleHash, address);
      }

      await tx.wait();
      setSuccess(`${action === 'assign' ? 'Assigned' : 'Revoked'} ${roleType} role successfully!`);
      setAddress('');
    } catch (error) {
      console.error(`Error ${action}ing role:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} role`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!roles.isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Role Management</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setAction('assign')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              action === 'assign'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Assign Role
          </button>
          <button
            onClick={() => setAction('revoke')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              action === 'revoke'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Revoke Role
          </button>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
            Ethereum Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleRoleAction('auditor')}
            disabled={isLoading || !address}
            className={`flex-1 px-4 py-2 ${
              action === 'assign' 
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800' 
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-800'
            } disabled:cursor-not-allowed text-white rounded-md transition-colors`}
          >
            {isLoading ? `${action === 'assign' ? 'Assigning' : 'Revoking'}...` : `${action === 'assign' ? 'Assign' : 'Revoke'} Auditor`}
          </button>
          
          <button
            onClick={() => handleRoleAction('government')}
            disabled={isLoading || !address}
            className={`flex-1 px-4 py-2 ${
              action === 'assign' 
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800' 
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-800'
            } disabled:cursor-not-allowed text-white rounded-md transition-colors`}
          >
            {isLoading ? `${action === 'assign' ? 'Assigning' : 'Revoking'}...` : `${action === 'assign' ? 'Assign' : 'Revoke'} Government`}
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm mt-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-400 text-sm mt-2">
            {success}
          </div>
        )}
      </div>
    </div>
  );
} 