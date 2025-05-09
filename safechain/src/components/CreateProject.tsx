import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { RoleGuard } from './RoleGuard';

export const CreateProject: React.FC = () => {
  const { contract } = useWeb3();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.createProject(
        name,
        description,
        ethers.utils.parseEther(budget)
      );
      await tx.wait();
      
      // Reset form
      setName('');
      setDescription('');
      setBudget('');
      
      alert('Project created successfully!');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || 'Error creating project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard requiredRoles={['government']}>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2">Budget (USD)</label>
            <input
              type="number"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
              min="0"
            />
          </div>
          <button
            type="submit"
            className={`${
              isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-4 py-2 rounded flex items-center justify-center`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </form>
      </div>
    </RoleGuard>
  );
};