// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title RWAEducationNFT
 * @dev NFT vault representing tokenized education tracks with fixed-yield returns
 * @notice This contract mints NFTs that represent funding vaults for medical education
 */
contract RWAEducationNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    struct VaultData {
        uint256 totalDeposited;
        uint256 targetAmount;
        uint256 createdAt;
        uint256 studyDuration; // in years
        address beneficiary; // student address
        string educationTrack;
        bool isActive;
        uint256 platformRewardRate; // monthly reward rate
        uint256 fixedAPY; // 10% APY for post-study period
    }

    struct InvestorData {
        uint256 amountDeposited;
        uint256 lastRewardClaim;
        uint256 lastReturnClaim;
        bool isEligibleForRewards;
    }

    // State variables
    uint256 private _nextTokenId;
    IERC20 public immutable USDC;
    AggregatorV3Interface public immutable usdcPriceFeed;
    
    mapping(uint256 => VaultData) public vaults;
    mapping(uint256 => mapping(address => InvestorData)) public investors;
    mapping(uint256 => address[]) public vaultInvestors;
    
    uint256 public constant PLATFORM_FEE = 300; // 3% in basis points
    uint256 public constant FIXED_APY = 1000; // 10% APY in basis points
    uint256 public constant STUDY_PERIOD = 6 * 365 days; // 6 years
    uint256 public constant RETURN_PERIOD = 24 * 365 days; // 24 years (total 30 years)
    
    address public platformTreasury;
    
    // Events
    event VaultCreated(uint256 indexed tokenId, address indexed beneficiary, string educationTrack, uint256 targetAmount);
    event FundsDeposited(uint256 indexed tokenId, address indexed investor, uint256 amount);
    event PlatformRewardClaimed(uint256 indexed tokenId, address indexed investor, uint256 amount);
    event FixedReturnClaimed(uint256 indexed tokenId, address indexed investor, uint256 amount);
    event VaultCompleted(uint256 indexed tokenId);

    modifier onlyVaultExists(uint256 tokenId) {
        require(_exists(tokenId), "Vault does not exist");
        _;
    }

    modifier onlyInvestor(uint256 tokenId) {
        require(investors[tokenId][msg.sender].amountDeposited > 0, "Not an investor");
        _;
    }

    constructor(
        address _usdcAddress,
        address _usdcPriceFeed,
        address _platformTreasury
    ) ERC721("MediMint Education Vault", "MEDIVAULT") {
        USDC = IERC20(_usdcAddress);
        usdcPriceFeed = AggregatorV3Interface(_usdcPriceFeed);
        platformTreasury = _platformTreasury;
        _nextTokenId = 1;
    }

    /**
     * @dev Creates a new education vault NFT
     * @param beneficiary The student who will benefit from the education funding
     * @param educationTrack Description of the education track (e.g., "Medical Specialist Program")
     * @param targetAmount Target funding amount in USDC
     * @param studyDuration Duration of study in years
     * @param tokenURI Metadata URI for the NFT
     */
    function createVault(
        address beneficiary,
        string memory educationTrack,
        uint256 targetAmount,
        uint256 studyDuration,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(targetAmount > 0, "Target amount must be positive");
        require(studyDuration > 0, "Study duration must be positive");

        uint256 tokenId = _nextTokenId++;
        
        vaults[tokenId] = VaultData({
            totalDeposited: 0,
            targetAmount: targetAmount,
            createdAt: block.timestamp,
            studyDuration: studyDuration,
            beneficiary: beneficiary,
            educationTrack: educationTrack,
            isActive: true,
            platformRewardRate: 20 * 10**6, // $20 USDC per month
            fixedAPY: FIXED_APY
        });

        _mint(address(this), tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit VaultCreated(tokenId, beneficiary, educationTrack, targetAmount);
        return tokenId;
    }

    /**
     * @dev Allows investors to deposit USDC into a vault
     * @param tokenId The vault token ID
     * @param amount Amount of USDC to deposit
     */
    function depositToVault(uint256 tokenId, uint256 amount) 
        external 
        onlyVaultExists(tokenId) 
        nonReentrant 
    {
        require(amount > 0, "Amount must be positive");
        require(vaults[tokenId].isActive, "Vault is not active");
        
        VaultData storage vault = vaults[tokenId];
        require(vault.totalDeposited.add(amount) <= vault.targetAmount, "Exceeds target amount");

        // Transfer USDC from investor
        require(USDC.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        // Calculate platform fee
        uint256 platformFee = amount.mul(PLATFORM_FEE).div(10000);
        uint256 netAmount = amount.sub(platformFee);

        // Transfer platform fee
        require(USDC.transfer(platformTreasury, platformFee), "Platform fee transfer failed");

        // Update vault data
        vault.totalDeposited = vault.totalDeposited.add(netAmount);

        // Update investor data
        if (investors[tokenId][msg.sender].amountDeposited == 0) {
            vaultInvestors[tokenId].push(msg.sender);
        }
        
        investors[tokenId][msg.sender].amountDeposited = investors[tokenId][msg.sender].amountDeposited.add(netAmount);
        investors[tokenId][msg.sender].lastRewardClaim = block.timestamp;
        investors[tokenId][msg.sender].isEligibleForRewards = true;

        emit FundsDeposited(tokenId, msg.sender, netAmount);
    }

    /**
     * @dev Allows investors to claim monthly platform rewards during study period
     * @param tokenId The vault token ID
     */
    function claimPlatformReward(uint256 tokenId) 
        external 
        onlyVaultExists(tokenId) 
        onlyInvestor(tokenId) 
        nonReentrant 
    {
        VaultData storage vault = vaults[tokenId];
        InvestorData storage investor = investors[tokenId][msg.sender];
        
        require(investor.isEligibleForRewards, "Not eligible for rewards");
        require(block.timestamp < vault.createdAt.add(STUDY_PERIOD), "Study period ended");
        
        uint256 monthsSinceLastClaim = (block.timestamp.sub(investor.lastRewardClaim)).div(30 days);
        require(monthsSinceLastClaim > 0, "No rewards available yet");
        
        uint256 rewardAmount = vault.platformRewardRate.mul(monthsSinceLastClaim);
        
        // Update last claim timestamp
        investor.lastRewardClaim = block.timestamp;
        
        // Transfer reward
        require(USDC.transfer(msg.sender, rewardAmount), "Reward transfer failed");
        
        emit PlatformRewardClaimed(tokenId, msg.sender, rewardAmount);
    }

    /**
     * @dev Allows investors to claim fixed APY returns after study period
     * @param tokenId The vault token ID
     */
    function claimFixedReturn(uint256 tokenId) 
        external 
        onlyVaultExists(tokenId) 
        onlyInvestor(tokenId) 
        nonReentrant 
    {
        VaultData storage vault = vaults[tokenId];
        InvestorData storage investor = investors[tokenId][msg.sender];
        
        require(block.timestamp >= vault.createdAt.add(STUDY_PERIOD), "Study period not ended");
        
        uint256 yearsSinceStudyEnd = (block.timestamp.sub(vault.createdAt.add(STUDY_PERIOD))).div(365 days);
        uint256 lastReturnClaimYear = investor.lastReturnClaim == 0 ? 0 : 
            (investor.lastReturnClaim.sub(vault.createdAt.add(STUDY_PERIOD))).div(365 days);
        
        require(yearsSinceStudyEnd > lastReturnClaimYear, "No returns available yet");
        
        uint256 yearsToPayOut = yearsSinceStudyEnd.sub(lastReturnClaimYear);
        uint256 annualReturn = investor.amountDeposited.mul(vault.fixedAPY).div(10000);
        uint256 totalReturn = annualReturn.mul(yearsToPayOut);
        
        // Update last return claim
        investor.lastReturnClaim = vault.createdAt.add(STUDY_PERIOD).add(yearsSinceStudyEnd.mul(365 days));
        
        // Transfer return
        require(USDC.transfer(msg.sender, totalReturn), "Return transfer failed");
        
        emit FixedReturnClaimed(tokenId, msg.sender, totalReturn);
    }

    /**
     * @dev Gets vault information
     * @param tokenId The vault token ID
     */
    function getVaultInfo(uint256 tokenId) 
        external 
        view 
        onlyVaultExists(tokenId) 
        returns (VaultData memory) 
    {
        return vaults[tokenId];
    }

    /**
     * @dev Gets investor information for a vault
     * @param tokenId The vault token ID
     * @param investor The investor address
     */
    function getInvestorInfo(uint256 tokenId, address investor) 
        external 
        view 
        onlyVaultExists(tokenId) 
        returns (InvestorData memory) 
    {
        return investors[tokenId][investor];
    }

    /**
     * @dev Gets all investors for a vault
     * @param tokenId The vault token ID
     */
    function getVaultInvestors(uint256 tokenId) 
        external 
        view 
        onlyVaultExists(tokenId) 
        returns (address[] memory) 
    {
        return vaultInvestors[tokenId];
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

// Import SafeMath library
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }
} 