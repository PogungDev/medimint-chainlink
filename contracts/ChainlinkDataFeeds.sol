// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./VaultNFT.sol";

/**
 * @title ChainlinkDataFeeds - MediMint Price Oracle Integration
 * @dev Uses Chainlink Data Feeds to track USDC price and adjust vault parameters
 * This demonstrates STATE CHANGES based on real-world data from Chainlink oracles
 */
contract ChainlinkDataFeeds is Ownable {
    AggregatorV3Interface internal usdcPriceFeed;
    VaultNFT public vaultContract;
    
    // Price thresholds for vault adjustments (8 decimals)
    int256 public constant USDC_HIGH_THRESHOLD = 101000000; // $1.01
    int256 public constant USDC_LOW_THRESHOLD = 99000000;   // $0.99
    
    // Investment multipliers based on USDC stability
    uint256 public constant STABLE_MULTIPLIER = 100;     // 100% - normal
    uint256 public constant PREMIUM_MULTIPLIER = 105;    // 105% - USDC above peg
    uint256 public constant DISCOUNT_MULTIPLIER = 95;    // 95% - USDC below peg
    
    uint256 public lastUpdateTimestamp;
    int256 public lastUSDCPrice;
    uint256 public currentMultiplier;
    
    event USDCPriceUpdated(int256 newPrice, uint256 timestamp);
    event MultiplierAdjusted(uint256 newMultiplier, int256 triggerPrice);
    event VaultParametersUpdated(uint256 indexed vaultId, uint256 newMultiplier);

    /**
     * @dev Initialize with USDC/USD price feed
     * Arbitrum Sepolia: We'll use ETH/USD as proxy since USDC feeds might not be available
     * Production: Use actual USDC/USD feed
     */
    constructor(address _priceFeed, address _vaultContract) {
        usdcPriceFeed = AggregatorV3Interface(_priceFeed);
        vaultContract = VaultNFT(_vaultContract);
        lastUpdateTimestamp = block.timestamp;
        currentMultiplier = STABLE_MULTIPLIER;
    }

    /**
     * @dev Get latest USDC price from Chainlink Data Feed
     */
    function getLatestUSDCPrice() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = usdcPriceFeed.latestRoundData();
        
        require(timeStamp > 0, "Round not complete");
        require(price > 0, "Invalid price data");
        return price;
    }

    /**
     * @dev Update vault investment multipliers based on USDC price stability
     * This function makes STATE CHANGES based on Chainlink Data Feeds
     */
    function updateVaultMultipliers() external {
        // Get latest USDC price from Chainlink
        int256 currentPrice = getLatestUSDCPrice();
        lastUSDCPrice = currentPrice;
        lastUpdateTimestamp = block.timestamp;
        
        emit USDCPriceUpdated(currentPrice, block.timestamp);
        
        // Determine new multiplier based on USDC stability
        uint256 newMultiplier;
        if (currentPrice >= USDC_HIGH_THRESHOLD) {
            newMultiplier = PREMIUM_MULTIPLIER; // USDC trading above peg
        } else if (currentPrice <= USDC_LOW_THRESHOLD) {
            newMultiplier = DISCOUNT_MULTIPLIER; // USDC trading below peg
        } else {
            newMultiplier = STABLE_MULTIPLIER; // USDC stable around peg
        }
        
        // Update multiplier if changed
        if (newMultiplier != currentMultiplier) {
            currentMultiplier = newMultiplier;
            emit MultiplierAdjusted(newMultiplier, currentPrice);
        }
    }

    /**
     * @dev Calculate adjusted investment amount based on USDC price
     */
    function calculateAdjustedInvestment(uint256 baseAmount) external view returns (uint256) {
        return (baseAmount * currentMultiplier) / 100;
    }

    /**
     * @dev Get current USDC stability status
     */
    function getUSDCStabilityStatus() external view returns (
        string memory status,
        int256 currentPrice,
        uint256 multiplier
    ) {
        int256 price = getLatestUSDCPrice();
        
        if (price >= USDC_HIGH_THRESHOLD) {
            return ("ABOVE_PEG", price, PREMIUM_MULTIPLIER);
        } else if (price <= USDC_LOW_THRESHOLD) {
            return ("BELOW_PEG", price, DISCOUNT_MULTIPLIER);
        } else {
            return ("STABLE", price, STABLE_MULTIPLIER);
        }
    }

    /**
     * @dev Simulate investment with current multiplier
     */
    function simulateInvestment(uint256 baseAmount) external view returns (
        uint256 adjustedAmount,
        uint256 multiplier,
        string memory priceStatus
    ) {
        int256 currentPrice = getLatestUSDCPrice();
        
        if (currentPrice >= USDC_HIGH_THRESHOLD) {
            return (
                (baseAmount * PREMIUM_MULTIPLIER) / 100,
                PREMIUM_MULTIPLIER,
                "Premium: USDC above peg"
            );
        } else if (currentPrice <= USDC_LOW_THRESHOLD) {
            return (
                (baseAmount * DISCOUNT_MULTIPLIER) / 100,
                DISCOUNT_MULTIPLIER,
                "Discount: USDC below peg"
            );
        } else {
            return (
                baseAmount,
                STABLE_MULTIPLIER,
                "Stable: USDC at peg"
            );
        }
    }

    /**
     * @dev Update price feed address (admin only)
     */
    function setPriceFeed(address _newPriceFeed) external onlyOwner {
        usdcPriceFeed = AggregatorV3Interface(_newPriceFeed);
    }

    /**
     * @dev Update vault contract address (admin only)
     */
    function setVaultContract(address _newVault) external onlyOwner {
        vaultContract = VaultNFT(_newVault);
    }

    /**
     * @dev Get price feed information
     */
    function getPriceFeedInfo() external view returns (
        address feedAddress,
        int256 latestPrice,
        uint256 lastUpdate,
        uint8 decimals,
        uint256 multiplier
    ) {
        return (
            address(usdcPriceFeed),
            lastUSDCPrice,
            lastUpdateTimestamp,
            usdcPriceFeed.decimals(),
            currentMultiplier
        );
    }

    /**
     * @dev Emergency function to manually set multiplier
     */
    function emergencySetMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier >= 50 && _multiplier <= 200, "Invalid multiplier range");
        currentMultiplier = _multiplier;
        emit MultiplierAdjusted(_multiplier, 0);
    }
} 