import { BigNumber } from 'ethers';

// Contract types (raw data from blockchain)
export interface ContractMilestone {
  description: string;
  targetDate: BigNumber;
  isCompleted: boolean;
  budget: BigNumber;
  spent: BigNumber;
}

export interface ContractExpense {
  description: string;
  amount: BigNumber;
  timestamp: BigNumber;
  proofIPFSHash: string;
  milestoneId: BigNumber;
}

export interface ContractProject {
  name: string;
  description: string;
  budget: BigNumber;
  spent: BigNumber;
  government: string;
  isCompleted: boolean;
  expenseCount: BigNumber;
  milestoneCount: BigNumber;
  lastUpdated: BigNumber;
}

// Display types (formatted for UI)
export interface DisplayMilestone {
  description: string;
  targetDate: number;
  isCompleted: boolean;
  budget: string;
  spent: string;
  expenses: DisplayExpense[];
}

export interface DisplayExpense {
  description: string;
  amount: string;
  timestamp: number;
  proofIPFSHash: string;
  milestoneId: number;
}

export interface DisplayProject {
  name: string;
  description: string;
  budget: string;
  spent: string;
  government: string;
  isCompleted: boolean;
  expenseCount: number;
  milestoneCount: number;
  lastUpdated: number;
  milestones: DisplayMilestone[];
}

export interface Notification {
  projectId: number;
  message: string;
  timestamp: number;
  isRead: boolean;
}

// Role types
export interface UserRoles {
  hasAdmin: boolean;
  hasDefaultAdmin: boolean;
  hasGovernment: boolean;
  hasAuditor: boolean;
} 