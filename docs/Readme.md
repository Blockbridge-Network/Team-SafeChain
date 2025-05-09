ProjectTracker DApp Documentation

Overview

ProjectTracker is a decentralized application (DApp) for managing government-funded projects on a blockchain. It allows government officials to create projects, add milestones, and record expenses, while auditors verify spending. Deployed on the "Sonic Test net" network (platform.lat), it ensures transparency and accountability.

Purpose





Transparency: Publicly tracks project data on the blockchain.



Accountability: Enforces budgets and verifies expenses.



Auditing: Provides immutable data for easy oversight.



Trust: Eliminates centralized intermediaries.

Target Audience





Government Officials: Manage projects and funds.



Auditors: Review expenses and progress.



Admins: Assign roles.



Public: Verify project details.

Features





Immutable Records: Projects, milestones, and expenses stored on-chain.



Transparent Data: Public access via view functions (getProject, getMilestone, getExpense).



Role-Based Access: Admin, government, and auditor roles.



Expense Verification: Single Kernel contract validates expenses.



Budget Enforcement: Prevents overspending.



Notifications: On-chain alerts for key events.



IPFS Integration: Stores proof documents off-chain, linked via hashes.

Architecture





Kernel Contract:





Verifies expenses (verifyExpense): Checks non-empty IPFS hash, positive amount, non-empty description.



ProjectTracker Contract:





Manages projects, milestones, expenses, and notifications.



Structs: Project, Milestone, Expense, Notification.



Roles: ADMIN_ROLE, GOVERNMENT_ROLE, AUDITOR_ROLE.



Key Functions: createProject, addMilestone, addExpense, completeProject, getProject, getNotifications.

Tech Stack





Smart Contracts: Solidity (^0.8.0), OpenZeppelin (AccessControl).



Blockchain: EVM-compatible network


Frontend: Next.js, Ethers.js, MetaMask.



Deployment: Remix.



Storage: IPFS (for expense proofs).

Deployment Instructions

Deploy using Remix on the Sonic Test network.

Prerequisites





MetaMask with a funded wallet



ExpenseVerificationKernel.sol.



ProjectTracker.sol.

Steps





Set Up MetaMask:





Add Sonic Test Net



Fund wallet with native token.



Open Remix (https://remix.ethereum.org)**:





Create Kernel.sol and ProjectTracker.sol in File Explorer.



Copy contract code from artifacts.



Compile:





Select Solidity compiler ^0.8.0.



Compile both contracts.



Deploy ExpenseVerificationKernel:





Set Environment to Injected Provider - MetaMask.



Select ExpenseVerificationKernel contract, deploy, and confirm in MetaMask.



Copy the deployed address.



Deploy ProjectTracker:





Select ProjectTracker, enter Kernel address in constructor.



Deploy and confirm.



Note the ProjectTracker address.



Verify:





Call expenseKernel on ProjectTracker to confirm Kernel address.