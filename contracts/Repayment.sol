// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVaultNFT {
    struct Vault {
        uint256 id;
        address student;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 createdAt;
        bool isActive;
        string educationTrack;
        uint256 projectedSalary;
        bool salaryFetched;
    }
    
    function getVault(uint256 vaultId) external view returns (Vault memory);
    function getVaultInvestors(uint256 vaultId) external view returns (address[] memory);
}

/**
 * @title Repayment - Automated repayment system with Chainlink Automation
 * @dev Handles monthly repayment triggers for demonstration (every 5 minutes)
 */
contract Repayment is AutomationCompatibleInterface, Ownable, ReentrancyGuard {
    
    struct RepaymentSchedule {
        uint256 vaultId;
        uint256 monthlyAmount;
        uint256 lastPayment;
        uint256 totalPaid;
        uint256 totalOwed;
        bool isActive;
    }

    IVaultNFT public immutable vaultNFT;
    IERC20 public immutable USDC;
    
    mapping(uint256 => RepaymentSchedule) public repaymentSchedules;
    mapping(uint256 => bool) public vaultHasSchedule;
    
    uint256[] public activeSchedules;
    uint256 public constant DEMO_INTERVAL = 5 minutes; // For demo - 5 minutes instead of 1 month
    uint256 public constant REPAYMENT_DURATION = 120 minutes; // 2 hours total for demo
    
    event RepaymentScheduleCreated(uint256 indexed vaultId, uint256 monthlyAmount, uint256 totalOwed);
    event RepaymentProcessed(uint256 indexed vaultId, uint256 amount, uint256 timestamp);
    event AutomationTriggered(uint256 scheduleCount, uint256 timestamp);

    constructor(address _vaultNFT, address _usdcAddress) {
        vaultNFT = IVaultNFT(_vaultNFT);
        USDC = IERC20(_usdcAddress);
    }

    /**
     * @dev Create repayment schedule for a vault (called by investor after funding)
     */
    function createRepaymentSchedule(uint256 vaultId) external {
        require(!vaultHasSchedule[vaultId], "Schedule already exists");
        
        IVaultNFT.Vault memory vault = vaultNFT.getVault(vaultId);
        
        require(vault.isActive, "Vault not active");
        require(vault.currentAmount > 0, "Vault not funded");
        require(vault.salaryFetched, "Salary not fetched yet");
        
        // Calculate monthly repayment (simple: 5% of projected salary)
        uint256 monthlyAmount = (vault.projectedSalary * 5) / 100 / 12; // 5% annually, divided by 12 months
        uint256 totalOwed = vault.currentAmount + (vault.currentAmount * 10) / 100; // Principal + 10% return
        
        repaymentSchedules[vaultId] = RepaymentSchedule({
            vaultId: vaultId,
            monthlyAmount: monthlyAmount,
            lastPayment: 0,
            totalPaid: 0,
            totalOwed: totalOwed,
            isActive: true
        });
        
        vaultHasSchedule[vaultId] = true;
        activeSchedules.push(vaultId);
        
        emit RepaymentScheduleCreated(vaultId, monthlyAmount, totalOwed);
    }

    /**
     * @dev Chainlink Automation checkUpkeep
     */
    function checkUpkeep(bytes calldata /* checkData */) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        uint256[] memory dueForPayment = new uint256[](activeSchedules.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeSchedules.length; i++) {
            uint256 vaultId = activeSchedules[i];
            RepaymentSchedule memory schedule = repaymentSchedules[vaultId];
            
            if (schedule.isActive && 
                block.timestamp >= schedule.lastPayment + DEMO_INTERVAL &&
                schedule.totalPaid < schedule.totalOwed) {
                dueForPayment[count] = vaultId;
                count++;
            }
        }
        
        if (count > 0) {
            // Create exact-size array
            uint256[] memory result = new uint256[](count);
            for (uint256 i = 0; i < count; i++) {
                result[i] = dueForPayment[i];
            }
            return (true, abi.encode(result));
        }
        
        return (false, "");
    }

    /**
     * @dev Chainlink Automation performUpkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory vaultIds = abi.decode(performData, (uint256[]));
        
        for (uint256 i = 0; i < vaultIds.length; i++) {
            _processRepayment(vaultIds[i]);
        }
        
        emit AutomationTriggered(vaultIds.length, block.timestamp);
    }

    /**
     * @dev Process repayment for a specific vault
     */
    function _processRepayment(uint256 vaultId) internal {
        RepaymentSchedule storage schedule = repaymentSchedules[vaultId];
        require(schedule.isActive, "Schedule not active");
        require(block.timestamp >= schedule.lastPayment + DEMO_INTERVAL, "Too early");
        
        uint256 paymentAmount = schedule.monthlyAmount;
        
        // Don't exceed total owed
        if (schedule.totalPaid + paymentAmount > schedule.totalOwed) {
            paymentAmount = schedule.totalOwed - schedule.totalPaid;
        }
        
        // Update schedule
        schedule.lastPayment = block.timestamp;
        schedule.totalPaid += paymentAmount;
        
        // Check if fully paid
        if (schedule.totalPaid >= schedule.totalOwed) {
            schedule.isActive = false;
        }
        
        emit RepaymentProcessed(vaultId, paymentAmount, block.timestamp);
    }

    /**
     * @dev Manual repayment trigger (for testing)
     */
    function triggerRepayment(uint256 vaultId) external onlyOwner {
        _processRepayment(vaultId);
    }

    /**
     * @dev Get repayment schedule details
     */
    function getRepaymentSchedule(uint256 vaultId) external view returns (RepaymentSchedule memory) {
        return repaymentSchedules[vaultId];
    }

    /**
     * @dev Get all active schedules
     */
    function getActiveSchedules() external view returns (uint256[] memory) {
        return activeSchedules;
    }

    /**
     * @dev Get number of active schedules
     */
    function getActiveScheduleCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < activeSchedules.length; i++) {
            if (repaymentSchedules[activeSchedules[i]].isActive) {
                count++;
            }
        }
        return count;
    }
} 