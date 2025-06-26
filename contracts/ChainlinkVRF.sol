// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./VaultNFT.sol";

/**
 * @title ChainlinkVRF - MediMint Random Selection System
 * @dev Uses Chainlink VRF for provably fair randomness in student selection
 * Simulates VRF for demo purposes - in production would use actual VRF
 */
contract ChainlinkVRF is Ownable, ReentrancyGuard {
    VaultNFT public vaultContract;
    
    struct LotteryRound {
        uint256 roundId;
        uint256[] participantVaults;
        uint256 winnerVaultId;
        uint256 timestamp;
        bool completed;
        uint256 prizeAmount;
    }
    
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(uint256 => bool) public vaultParticipated;
    
    uint256 public currentRoundId;
    uint256 public constant ENTRY_FEE = 100 * 10**6; // 100 USDC (6 decimals)
    uint256 public totalPrizePool;
    
    event LotteryRoundStarted(uint256 indexed roundId, uint256 timestamp);
    event VaultEntered(uint256 indexed roundId, uint256 indexed vaultId);
    event RandomnessRequested(uint256 indexed roundId, uint256 requestId);
    event WinnerSelected(uint256 indexed roundId, uint256 indexed winnerVaultId, uint256 prizeAmount);
    event PrizeDistributed(uint256 indexed vaultId, uint256 amount);

    constructor(address _vaultContract) {
        vaultContract = VaultNFT(_vaultContract);
        currentRoundId = 1;
    }

    /**
     * @dev Start a new lottery round
     */
    function startLotteryRound() external onlyOwner {
        require(!lotteryRounds[currentRoundId].completed || currentRoundId == 1, "Previous round not completed");
        
        uint256 newRoundId = currentRoundId++;
        
        lotteryRounds[newRoundId] = LotteryRound({
            roundId: newRoundId,
            participantVaults: new uint256[](0),
            winnerVaultId: 0,
            timestamp: block.timestamp,
            completed: false,
            prizeAmount: 0
        });
        
        emit LotteryRoundStarted(newRoundId, block.timestamp);
    }

    /**
     * @dev Enter vault into current lottery round
     */
    function enterLottery(uint256 vaultId) external nonReentrant {
        require(currentRoundId > 0, "No active lottery round");
        require(!lotteryRounds[currentRoundId - 1].completed, "Current round completed");
        require(!vaultParticipated[vaultId], "Vault already participated");
        
        // Verify vault exists and is active
        VaultNFT.Vault memory vault = vaultContract.getVault(vaultId);
        require(vault.isActive, "Vault not active");
        require(vault.currentAmount >= ENTRY_FEE, "Insufficient vault funds");
        
        // Add vault to current round
        uint256 activeRoundId = currentRoundId - 1;
        lotteryRounds[activeRoundId].participantVaults.push(vaultId);
        vaultParticipated[vaultId] = true;
        
        // Add to prize pool
        totalPrizePool += ENTRY_FEE;
        lotteryRounds[activeRoundId].prizeAmount = totalPrizePool;
        
        emit VaultEntered(activeRoundId, vaultId);
    }

    /**
     * @dev Complete lottery round and select winner using pseudo-randomness
     * In production, this would use actual Chainlink VRF
     */
    function completeLotteryRound() external onlyOwner {
        uint256 activeRoundId = currentRoundId - 1;
        require(!lotteryRounds[activeRoundId].completed, "Round already completed");
        require(lotteryRounds[activeRoundId].participantVaults.length > 0, "No participants");
        
        // Generate pseudo-random number (in production, use VRF)
        uint256 randomness = _generatePseudoRandomness(activeRoundId);
        
        // Select winner
        uint256 winnerIndex = randomness % lotteryRounds[activeRoundId].participantVaults.length;
        uint256 winnerVaultId = lotteryRounds[activeRoundId].participantVaults[winnerIndex];
        
        // Update round
        lotteryRounds[activeRoundId].winnerVaultId = winnerVaultId;
        lotteryRounds[activeRoundId].completed = true;
        
        emit WinnerSelected(activeRoundId, winnerVaultId, totalPrizePool);
        emit PrizeDistributed(winnerVaultId, totalPrizePool);
        
        // Reset for next round
        totalPrizePool = 0;
        
        // Clear participation flags
        for (uint256 i = 0; i < lotteryRounds[activeRoundId].participantVaults.length; i++) {
            vaultParticipated[lotteryRounds[activeRoundId].participantVaults[i]] = false;
        }
    }

    /**
     * @dev Generate pseudo-randomness (simulates VRF)
     * In production, this would be replaced with actual Chainlink VRF callback
     */
    function _generatePseudoRandomness(uint256 roundId) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            roundId,
            lotteryRounds[roundId].participantVaults.length
        )));
    }

    /**
     * @dev Get current lottery round info
     */
    function getCurrentLotteryInfo() external view returns (
        uint256 roundId,
        uint256 participantCount,
        uint256 prizePool,
        bool isActive
    ) {
        if (currentRoundId == 0) {
            return (0, 0, 0, false);
        }
        
        uint256 activeRoundId = currentRoundId - 1;
        LotteryRound memory round = lotteryRounds[activeRoundId];
        
        return (
            activeRoundId,
            round.participantVaults.length,
            round.prizeAmount,
            !round.completed
        );
    }

    /**
     * @dev Get lottery round participants
     */
    function getRoundParticipants(uint256 roundId) external view returns (uint256[] memory) {
        return lotteryRounds[roundId].participantVaults;
    }

    /**
     * @dev Get lottery round details
     */
    function getLotteryRound(uint256 roundId) external view returns (LotteryRound memory) {
        return lotteryRounds[roundId];
    }

    /**
     * @dev Check if vault can participate in current lottery
     */
    function canVaultParticipate(uint256 vaultId) external view returns (bool, string memory reason) {
        if (currentRoundId == 0) {
            return (false, "No active lottery round");
        }
        
        if (lotteryRounds[currentRoundId - 1].completed) {
            return (false, "Current round completed");
        }
        
        if (vaultParticipated[vaultId]) {
            return (false, "Vault already participated");
        }
        
        VaultNFT.Vault memory vault = vaultContract.getVault(vaultId);
        if (!vault.isActive) {
            return (false, "Vault not active");
        }
        
        if (vault.currentAmount < ENTRY_FEE) {
            return (false, "Insufficient vault funds");
        }
        
        return (true, "Eligible to participate");
    }

    /**
     * @dev Emergency function to reset lottery state
     */
    function emergencyResetLottery() external onlyOwner {
        uint256 activeRoundId = currentRoundId - 1;
        
        // Clear participation flags
        for (uint256 i = 0; i < lotteryRounds[activeRoundId].participantVaults.length; i++) {
            vaultParticipated[lotteryRounds[activeRoundId].participantVaults[i]] = false;
        }
        
        // Reset round
        delete lotteryRounds[activeRoundId];
        totalPrizePool = 0;
    }

    /**
     * @dev Update vault contract address
     */
    function setVaultContract(address _newVault) external onlyOwner {
        vaultContract = VaultNFT(_newVault);
    }

    /**
     * @dev Update entry fee
     */
    function setEntryFee(uint256 _newFee) external onlyOwner {
        // Entry fee logic would be here
        // For demo purposes, fee is constant
    }
} 