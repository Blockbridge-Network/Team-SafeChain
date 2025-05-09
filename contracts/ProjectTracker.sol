// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IKernel {
    function verifyExpense(
        string memory proofIPFSHash,
        uint256 amount,
        string memory description
    ) external view returns (bool);
}

contract ProjectTracker is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Milestone {
        string description;
        uint256 targetDate;
        bool isCompleted;
        uint256 budget;
        uint256 spent;
    }

    struct Project {
        string name;
        string description;
        uint256 budget;
        uint256 spent;
        address government;
        bool isCompleted;
        mapping(uint256 => Expense) expenses;
        uint256 expenseCount;
        Milestone[] milestones;
        uint256 lastUpdated;
    }

    struct Expense {
        string description;
        uint256 amount;
        uint256 timestamp;
        string proofIPFSHash;
        uint256 milestoneId; // Links expense to a specific milestone
    }

    struct Notification {
        uint256 projectId;
        string message;
        uint256 timestamp;
        bool isRead;
    }

    mapping(uint256 => Project) public projects;
    mapping(address => Notification[]) private notifications;
    uint256 public projectCount;
    IKernel public expenseKernel;

    event ProjectCreated(uint256 projectId, string name, uint256 budget);
    event ExpenseAdded(uint256 projectId, uint256 expenseId, uint256 amount, uint256 milestoneId);
    event ProjectCompleted(uint256 projectId);
    event MilestoneAdded(uint256 projectId, uint256 milestoneId);
    event MilestoneCompleted(uint256 projectId, uint256 milestoneId);
    event NotificationCreated(address recipient, uint256 projectId, string message);

    constructor(address _expenseKernel) {
        expenseKernel = IKernel(_expenseKernel);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function checkRoles(address account) public view returns (
        bool hasAdmin,
        bool hasDefaultAdmin,
        bool hasGovernment,
        bool hasAuditor
    ) {
        hasAdmin = hasRole(ADMIN_ROLE, account);
        hasDefaultAdmin = hasRole(DEFAULT_ADMIN_ROLE, account);
        hasGovernment = hasRole(GOVERNMENT_ROLE, account);
        hasAuditor = hasRole(AUDITOR_ROLE, account);
        return (hasAdmin, hasDefaultAdmin, hasGovernment, hasAuditor);
    }

    function addGovernmentOfficial(address official) public onlyRole(ADMIN_ROLE) {
        grantRole(GOVERNMENT_ROLE, official);
    }

    function addAuditor(address auditor) public onlyRole(ADMIN_ROLE) {
        grantRole(AUDITOR_ROLE, auditor);
    }

    function createProject(
        string memory _name,
        string memory _description,
        uint256 _budget
    ) public onlyRole(GOVERNMENT_ROLE) {
        Project storage project = projects[projectCount];
        project.name = _name;
        project.description = _description;
        project.budget = _budget;
        project.government = msg.sender;
        project.isCompleted = false;
        project.expenseCount = 0;
        project.lastUpdated = block.timestamp;

        emit ProjectCreated(projectCount, _name, _budget);
        createNotification(msg.sender, projectCount, "New project created");
        projectCount++;
    }

    function addMilestone(
        uint256 _projectId,
        string memory _description,
        uint256 _targetDate,
        uint256 _budget
    ) public onlyRole(GOVERNMENT_ROLE) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        require(project.government == msg.sender, "Only project owner can add milestones");
        require(!project.isCompleted, "Project is completed");

        Milestone memory milestone = Milestone({
            description: _description,
            targetDate: _targetDate,
            isCompleted: false,
            budget: _budget,
            spent: 0
        });

        project.milestones.push(milestone);
        emit MilestoneAdded(_projectId, project.milestones.length - 1);
        createNotification(project.government, _projectId, "New milestone added");
    }

    function completeMilestone(
        uint256 _projectId,
        uint256 _milestoneId
    ) public onlyRole(GOVERNMENT_ROLE) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        require(project.government == msg.sender, "Only project owner can complete milestones");
        require(_milestoneId < project.milestones.length, "Milestone does not exist");
        require(!project.milestones[_milestoneId].isCompleted, "Milestone already completed");

        project.milestones[_milestoneId].isCompleted = true;
        emit MilestoneCompleted(_projectId, _milestoneId);
        createNotification(project.government, _projectId, "Milestone completed");
    }

    function addExpense(
        uint256 _projectId,
        string memory _description,
        uint256 _amount,
        string memory _proofIPFSHash,
        uint256 _milestoneId
    ) public onlyRole(GOVERNMENT_ROLE) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        require(project.government == msg.sender, "Only project owner can add expenses");
        require(!project.isCompleted, "Project is completed");
        require(project.spent + _amount <= project.budget, "Exceeds project budget");
        require(_milestoneId < project.milestones.length, "Milestone does not exist");
        require(!project.milestones[_milestoneId].isCompleted, "Milestone is completed");
        require(
            project.milestones[_milestoneId].spent + _amount <= project.milestones[_milestoneId].budget,
            "Exceeds milestone budget"
        );

        require(
            expenseKernel.verifyExpense(_proofIPFSHash, _amount, _description),
            "Expense verification failed"
        );

        Expense storage expense = project.expenses[project.expenseCount];
        expense.description = _description;
        expense.amount = _amount;
        expense.timestamp = block.timestamp;
        expense.proofIPFSHash = _proofIPFSHash;
        expense.milestoneId = _milestoneId;

        project.spent += _amount;
        project.milestones[_milestoneId].spent += _amount;
        project.lastUpdated = block.timestamp;
        emit ExpenseAdded(_projectId, project.expenseCount, _amount, _milestoneId);
        createNotification(project.government, _projectId, "New expense added to milestone");
        project.expenseCount++;
    }

    function completeProject(uint256 _projectId) public onlyRole(GOVERNMENT_ROLE) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        require(project.government == msg.sender, "Only project owner can complete");
        require(!project.isCompleted, "Project already completed");

        project.isCompleted = true;
        project.lastUpdated = block.timestamp;
        emit ProjectCompleted(_projectId);
        createNotification(project.government, _projectId, "Project completed");
    }

    function createNotification(
        address recipient,
        uint256 projectId,
        string memory message
    ) internal {
        notifications[recipient].push(Notification({
            projectId: projectId,
            message: message,
            timestamp: block.timestamp,
            isRead: false
        }));
        emit NotificationCreated(recipient, projectId, message);
    }

    function getNotifications(address user) public view returns (Notification[] memory) {
        return notifications[user];
    }

    function markNotificationAsRead(uint256 index) public {
        require(index < notifications[msg.sender].length, "Invalid notification index");
        notifications[msg.sender][index].isRead = true;
    }

    function getProject(uint256 _projectId) public view returns (
        string memory name,
        string memory description,
        uint256 budget,
        uint256 spent,
        address government,
        bool isCompleted,
        uint256 expenseCount,
        uint256 milestoneCount
    ) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        return (
            project.name,
            project.description,
            project.budget,
            project.spent,
            project.government,
            project.isCompleted,
            project.expenseCount,
            project.milestones.length
        );
    }

    function getMilestone(uint256 _projectId, uint256 _milestoneId) public view returns (
        string memory description,
        uint256 targetDate,
        bool isCompleted,
        uint256 budget,
        uint256 spent
    ) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        require(_milestoneId < project.milestones.length, "Milestone does not exist");
        Milestone memory milestone = project.milestones[_milestoneId];
        return (
            milestone.description,
            milestone.targetDate,
            milestone.isCompleted,
            milestone.budget,
            milestone.spent
        );
    }

    function getExpense(uint256 _projectId, uint256 _expenseId) public view returns (
        string memory description,
        uint256 amount,
        uint256 timestamp,
        string memory proofIPFSHash,
        uint256 milestoneId
    ) {
        require(_projectId < projectCount, "Project does not exist");
        Project storage project = projects[_projectId];
        require(_expenseId < project.expenseCount, "Expense does not exist");
        Expense storage expense = project.expenses[_expenseId];
        return (
            expense.description,
            expense.amount,
            expense.timestamp,
            expense.proofIPFSHash,
            expense.milestoneId
        );
    }

    function getExpensesByMilestone(uint256 _projectId, uint256 _milestoneId)
        public
        view
        returns (Expense[] memory)
    {
        require(_projectId < projectCount, "Project does not exist");
        require(_milestoneId < projects[_projectId].milestones.length, "Milestone does not exist");

        Project storage project = projects[_projectId];
        Expense[] memory milestoneExpenses = new Expense[](project.expenseCount);
        uint256 count = 0;

        for (uint256 i = 0; i < project.expenseCount; i++) {
            if (project.expenses[i].milestoneId == _milestoneId) {
                milestoneExpenses[count] = project.expenses[i];
                count++;
            }
        }

        Expense[] memory result = new Expense[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = milestoneExpenses[i];
        }
        return result;
    }

    function getLastUpdated(uint256 _projectId) public view returns (uint256) {
        require(_projectId < projectCount, "Project does not exist");
        return projects[_projectId].lastUpdated;
    }
}