import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { ContractMilestone } from '../types/project';

interface AddExpenseProps {
  projectId: number;
  onExpenseAdded: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function AddExpense({ projectId, onExpenseAdded }: AddExpenseProps) {
  const { contract } = useWeb3();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<ContractMilestone[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number>(0);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, [contract, projectId]);

  const loadMilestones = async () => {
    if (!contract) return;
    
    setLoadingMilestones(true);
    try {
      const project = await contract.getProject(projectId);
      const milestoneCount = project.milestoneCount.toNumber();
      const loadedMilestones: ContractMilestone[] = [];

      for (let i = 0; i < milestoneCount; i++) {
        try {
          const milestone = await contract.getMilestone(projectId, i);
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
        setSelectedMilestoneId(0);
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
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        e.target.value = ''; // Reset file input
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !file || milestones.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Validate amount
      if (parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate milestone budget
      const milestone = milestones[selectedMilestoneId];
      const remainingBudget = milestone.budget.sub(milestone.spent);
      const expenseAmount = ethers.utils.parseEther(amount);
      
      if (expenseAmount.gt(remainingBudget)) {
        throw new Error('Expense amount exceeds milestone remaining budget');
      }

      // Add expense to the contract
      setError('Processing transaction...');
      const tx = await contract.addExpense(
        projectId,
        description,
        expenseAmount,
        'proof-placeholder', // Simple placeholder for proof
        selectedMilestoneId
      );
      
      await tx.wait();

      // Reset form
      setDescription('');
      setAmount('');
      setFile(null);
      if (e.target instanceof HTMLFormElement) {
        e.target.reset(); // Reset file input
      }
      
      onExpenseAdded();
      setError('Expense added successfully!');
    } catch (error: any) {
      console.error('Error adding expense:', error);
      setError(error.message || 'Error adding expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMilestones) {
    return (
      <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading milestones...</span>
        </div>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center text-yellow-500">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-500">
            No active milestones available. Please add a milestone before adding expenses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Add New Expense</h3>
      
      {error && (
        <div className={`mb-6 p-4 rounded-lg border ${
          error.includes('successfully') 
            ? 'bg-green-900/50 text-green-400 border-green-700'
            : error.includes('Processing') 
              ? 'bg-blue-900/50 text-blue-400 border-blue-700'
              : 'bg-red-900/50 text-red-400 border-red-700'
        }`}>
          <div className="flex items-center">
            {error.includes('successfully') && (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {error.includes('Processing') && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-2"></div>
            )}
            {!error.includes('successfully') && !error.includes('Processing') && (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Milestone
          </label>
          <select
            value={selectedMilestoneId}
            onChange={(e) => setSelectedMilestoneId(parseInt(e.target.value))}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          >
            {milestones.map((milestone, index) => {
              const remainingBudget = ethers.utils.formatEther(
                milestone.budget.sub(milestone.spent)
              );
              return (
                <option key={index} value={index} className="bg-gray-700">
                  {milestone.description} (Remaining: {remainingBudget} USD)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter expense description"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Proof Document
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
          <input
                    id="file-upload"
                    name="file-upload"
            type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_TYPES.join(',')}
            required
                    disabled={loading}
          />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">
                PDF, PNG, JPG up to 10MB
              </p>
              {file && (
                <p className="text-sm text-green-400">
                  Selected: {file.name}
                </p>
              )}
              {fileError && (
                <p className="text-sm text-red-400">
                  {fileError}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
            loading || !file
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Processing...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}