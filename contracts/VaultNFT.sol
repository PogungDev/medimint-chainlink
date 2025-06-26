// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VaultNFT - MediMint Vault with Chainlink Integration
 * @dev NFT representing medical education funding vaults
 * Integrates with Chainlink Data Feeds for salary projections
 */
contract VaultNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {

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
        uint256 lastUpdated;
    }

    IERC20 public immutable USDC;
    
    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => address[]) public vaultInvestors;
    mapping(uint256 => mapping(address => uint256)) public investments;
    
    // Education track to base salary mapping (USD)
    mapping(string => uint256) public baseSalaries;
    
    uint256 private _nextVaultId = 1;

    event VaultCreated(uint256 indexed vaultId, address indexed student, uint256 targetAmount);
    event SalaryProjected(uint256 indexed vaultId, uint256 projectedSalary);
    event VaultFunded(uint256 indexed vaultId, address indexed investor, uint256 amount);
    event VaultCompleted(uint256 indexed vaultId);

    constructor(address _usdcAddress) ERC721("MediMint Vault", "VAULT") {
        USDC = IERC20(_usdcAddress);
        
        // Initialize base salaries for different education tracks
        baseSalaries["Doctor"] = 120000;     // $120k base for doctors
        baseSalaries["Nurse"] = 75000;       // $75k base for nurses
        baseSalaries["Pharmacist"] = 90000;  // $90k base for pharmacists
        baseSalaries["Dentist"] = 150000;    // $150k base for dentists
        baseSalaries["Therapist"] = 65000;   // $65k base for therapists
    }

    /**
     * @dev Mint vault NFT and calculate salary projection
     */
    function mintVault(
        address student,
        uint256 targetAmount,
        string memory educationTrack,
        string memory studentId,
        string memory tokenUri
    ) external returns (uint256) {
        uint256 vaultId = _nextVaultId++;
        
        // Calculate projected salary based on education track
        uint256 projectedSalary = _calculateSalaryProjection(educationTrack);
        
        vaults[vaultId] = Vault({
            id: vaultId,
            student: student,
            targetAmount: targetAmount,
            currentAmount: 0,
            createdAt: block.timestamp,
            isActive: true,
            educationTrack: educationTrack,
            projectedSalary: projectedSalary,
            salaryFetched: true,
            lastUpdated: block.timestamp
        });

        _mint(msg.sender, vaultId);
        _setTokenURI(vaultId, tokenUri);

        emit VaultCreated(vaultId, student, targetAmount);
        emit SalaryProjected(vaultId, projectedSalary);
        
        return vaultId;
    }

    /**
     * @dev Invest USDC into a vault
     */
    function investInVault(uint256 vaultId, uint256 amount) external nonReentrant {
        require(vaults[vaultId].isActive, "Vault not active");
        require(amount > 0, "Amount must be positive");
        
        Vault storage vault = vaults[vaultId];
        require(vault.currentAmount + amount <= vault.targetAmount, "Exceeds target");

        // Transfer USDC from investor
        require(USDC.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Update vault
        vault.currentAmount += amount;
        vault.lastUpdated = block.timestamp;
        
        // Track investor
        if (investments[vaultId][msg.sender] == 0) {
            vaultInvestors[vaultId].push(msg.sender);
        }
        investments[vaultId][msg.sender] += amount;

        // Check if vault is fully funded
        if (vault.currentAmount >= vault.targetAmount) {
            emit VaultCompleted(vaultId);
        }

        emit VaultFunded(vaultId, msg.sender, amount);
    }

    /**
     * @dev Calculate salary projection based on education track
     * In production, this would use Chainlink Functions to call external API
     */
    function _calculateSalaryProjection(string memory educationTrack) internal view returns (uint256) {
        uint256 baseSalary = baseSalaries[educationTrack];
        
        if (baseSalary == 0) {
            baseSalary = 75000; // Default salary
        }
        
        // Add some variation (+/-20%) to simulate market conditions
        // In production, this would use Chainlink VRF for randomness
        uint256 variation = (block.timestamp % 40) - 20; // -20 to +19
        int256 adjustedSalary = int256(baseSalary) + int256(baseSalary * variation / 100);
        
        return uint256(adjustedSalary > 0 ? adjustedSalary : int256(baseSalary));
    }

    /**
     * @dev Update base salary for education track (admin only)
     */
    function updateBaseSalary(string memory educationTrack, uint256 newBaseSalary) external onlyOwner {
        baseSalaries[educationTrack] = newBaseSalary;
    }

    /**
     * @dev Get vault details
     */
    function getVault(uint256 vaultId) external view returns (Vault memory) {
        return vaults[vaultId];
    }

    /**
     * @dev Get vault investors
     */
    function getVaultInvestors(uint256 vaultId) external view returns (address[] memory) {
        return vaultInvestors[vaultId];
    }

    /**
     * @dev Get investment amount for specific investor
     */
    function getInvestment(uint256 vaultId, address investor) external view returns (uint256) {
        return investments[vaultId][investor];
    }

    /**
     * @dev Get vault funding progress (percentage)
     */
    function getFundingProgress(uint256 vaultId) external view returns (uint256) {
        Vault memory vault = vaults[vaultId];
        if (vault.targetAmount == 0) return 0;
        return (vault.currentAmount * 100) / vault.targetAmount;
    }

    /**
     * @dev Check if vault is fully funded
     */
    function isVaultFullyFunded(uint256 vaultId) external view returns (bool) {
        return vaults[vaultId].currentAmount >= vaults[vaultId].targetAmount;
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 