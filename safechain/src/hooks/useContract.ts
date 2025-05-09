import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, PROJECT_TRACKER_ABI, ROLES } from '../config/contracts';
import { UserRoles } from '../types/project';

interface EventWithArgs extends ethers.Event {
    args: Array<any>;
    event: string;
}

export function useContract() {
    const { provider, signer, account, roles } = useWeb3();
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        if (signer && CONTRACT_ADDRESSES.PROJECT_TRACKER) {
            try {
          const projectTracker = new ethers.Contract(
            CONTRACT_ADDRESSES.PROJECT_TRACKER,
            PROJECT_TRACKER_ABI,
            signer
          );
          setContract(projectTracker);
            } catch (error) {
                console.error('Error initializing contract:', error);
                setContract(null);
            }
        } else {
            setContract(null);
        }
      }, [signer]);

    const checkRoles = useCallback(async (address: string): Promise<UserRoles> => {
        if (!contract) throw new Error('Contract not initialized');
        try {
            const roles = await contract.checkRoles(address);
            return {
                hasAdmin: roles[0],
                hasDefaultAdmin: roles[1],
                hasGovernment: roles[2],
                hasAuditor: roles[3]
            };
        } catch (error: any) {
            console.error('Error checking roles:', error);
            throw new Error(error.message || 'Error checking roles');
        }
    }, [contract]);

  const createProject = useCallback(async (
    name: string,
    description: string,
    budget: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');
        if (!roles.isGovernment) throw new Error('Only government role can create projects');
        
    try {
      const tx = await contract.createProject(
        name,
        description,
        ethers.utils.parseEther(budget)
      );
            const receipt = await tx.wait();
            
            const event = receipt.events?.find((e: EventWithArgs) => 
                e.event === 'ProjectCreated'
            );
            
            if (event?.args?.[0]) {
                return {
                    hash: tx.hash,
                    projectId: event.args[0].toNumber()
                };
            }
            return { hash: tx.hash };
        } catch (error: any) {
      console.error('Error creating project:', error);
            throw new Error(error.message || 'Error creating project');
    }
    }, [contract, roles.isGovernment]);

  const addMilestone = useCallback(async (
    projectId: number,
    description: string,
    targetDate: number,
    budget: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');
        if (!roles.isGovernment) throw new Error('Only government role can add milestones');
        
    try {
      const tx = await contract.addMilestone(
        projectId,
        description,
        targetDate,
        ethers.utils.parseEther(budget)
      );
            const receipt = await tx.wait();
            
            const event = receipt.events?.find((e: EventWithArgs) => 
                e.event === 'MilestoneAdded'
            );
            
            if (event?.args?.[1]) {
                return {
                    hash: tx.hash,
                    milestoneId: event.args[1].toNumber()
                };
            }
            return { hash: tx.hash };
        } catch (error: any) {
      console.error('Error adding milestone:', error);
            throw new Error(error.message || 'Error adding milestone');
    }
    }, [contract, roles.isGovernment]);

  const addExpense = useCallback(async (
    projectId: number,
    description: string,
    amount: string,
        proofIPFSHash: string,
        milestoneId: number
  ) => {
    if (!contract) throw new Error('Contract not initialized');
        if (!roles.isGovernment) throw new Error('Only government role can add expenses');
        
    try {
      const tx = await contract.addExpense(
        projectId,
        description,
        ethers.utils.parseEther(amount),
                proofIPFSHash,
                milestoneId
      );
            const receipt = await tx.wait();
            
            const event = receipt.events?.find((e: EventWithArgs) => 
                e.event === 'ExpenseAdded'
            );
            
            if (event?.args?.[1]) {
                return {
                    hash: tx.hash,
                    expenseId: event.args[1].toNumber()
                };
            }
            return { hash: tx.hash };
        } catch (error: any) {
      console.error('Error adding expense:', error);
            throw new Error(error.message || 'Error adding expense');
    }
    }, [contract, roles.isGovernment]);

    const completeMilestone = useCallback(async (
        projectId: number,
        milestoneId: number
    ) => {
        if (!contract) throw new Error('Contract not initialized');
        if (!roles.isGovernment) throw new Error('Only government role can complete milestones');
        
        try {
            const tx = await contract.completeMilestone(projectId, milestoneId);
            const receipt = await tx.wait();
            
            const event = receipt.events?.find((e: EventWithArgs) => 
                e.event === 'MilestoneCompleted'
            );
            
            return { hash: tx.hash };
        } catch (error: any) {
            console.error('Error completing milestone:', error);
            throw new Error(error.message || 'Error completing milestone');
        }
    }, [contract, roles.isGovernment]);

    const completeProject = useCallback(async (projectId: number) => {
        if (!contract) throw new Error('Contract not initialized');
        if (!roles.isGovernment) throw new Error('Only government role can complete projects');
        
        try {
            const tx = await contract.completeProject(projectId);
            const receipt = await tx.wait();
            
            const event = receipt.events?.find((e: EventWithArgs) => 
                e.event === 'ProjectCompleted'
            );
            
            return { hash: tx.hash };
        } catch (error: any) {
            console.error('Error completing project:', error);
            throw new Error(error.message || 'Error completing project');
        }
    }, [contract, roles.isGovernment]);

    const getNotifications = useCallback(async () => {
        if (!contract || !account) throw new Error('Contract not initialized or no account');
        
        try {
            const notifications = await contract.getNotifications(account);
            return notifications;
        } catch (error: any) {
            console.error('Error getting notifications:', error);
            throw new Error(error.message || 'Error getting notifications');
        }
    }, [contract, account]);

    const markNotificationAsRead = useCallback(async (index: number) => {
        if (!contract) throw new Error('Contract not initialized');
        
        try {
            const tx = await contract.markNotificationAsRead(index);
            const receipt = await tx.wait();
            return { hash: tx.hash };
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            throw new Error(error.message || 'Error marking notification as read');
        }
    }, [contract]);

    const getExpensesByMilestone = useCallback(async (
        projectId: number,
        milestoneId: number
    ) => {
        if (!contract) throw new Error('Contract not initialized');
        
        try {
            const expenses = await contract.getExpensesByMilestone(projectId, milestoneId);
            return expenses;
        } catch (error: any) {
            console.error('Error getting expenses by milestone:', error);
            throw new Error(error.message || 'Error getting expenses by milestone');
        }
    }, [contract]);

  return {
    contract,
        ...roles,
        checkRoles,
    createProject,
    addMilestone,
        addExpense,
        completeMilestone,
        completeProject,
        getNotifications,
        markNotificationAsRead,
        getExpensesByMilestone
  };
}