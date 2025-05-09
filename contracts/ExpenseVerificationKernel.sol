// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IKernel {
    function verifyExpense(
        string memory proofIPFSHash,
        uint256 amount,
        string memory description
    ) external view returns (bool);
}

contract ExpenseVerificationKernel is IKernel {
    // Add state variables for verification rules
    uint256 public maxExpenseAmount;
    mapping(address => bool) public authorizedVerifiers;
    address public owner;

    constructor(uint256 _maxExpenseAmount) {
        maxExpenseAmount = _maxExpenseAmount;
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function addVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
    }

    function removeVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = false;
    }

    function updateMaxExpenseAmount(uint256 _newMax) external onlyOwner {
        maxExpenseAmount = _newMax;
    }

    function verifyExpense(
        string memory proofIPFSHash,
        uint256 amount,
        string memory description
    ) external view override returns (bool) {
        // Basic verification logic:
        // 1. Check if the amount is within limits
        // 2. Verify that proof hash exists
        // 3. Verify description is not empty
        
        if (amount > maxExpenseAmount) {
            return false;
        }

        if (bytes(proofIPFSHash).length == 0) {
            return false;
        }

        if (bytes(description).length == 0) {
            return false;
        }

        return true;
    }
}