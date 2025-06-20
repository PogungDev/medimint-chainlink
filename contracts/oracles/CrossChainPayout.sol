// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/contracts/token/ERC20/IERC20.sol";

/**
 * @title CrossChainPayout
 * @dev Handles cross-chain payouts to investors using Chainlink CCIP
 * @notice Sends funder returns to other chains via Chainlink CCIP
 */
contract CrossChainPayout {
    
    struct CrossChainRequest {
        uint64 destinationChainSelector;
        address destinationReceiver;
        address token;
        uint256 amount;
        uint256 vaultId;
        address investor;
        string payoutType; // "PLATFORM_REWARD" or "FIXED_RETURN"
        uint256 requestedAt;
        bool isProcessed;
    }

    struct ChainConfig {
        uint64 chainSelector;
        address routerAddress;
        bool isActive;
        uint256 gasLimit;
    }

    // State variables
    IRouterClient private immutable i_router;
    IERC20 private immutable i_linkToken;
    IERC20 private immutable i_usdcToken;
    
    mapping(uint256 => CrossChainRequest) public crossChainRequests;
    mapping(uint64 => ChainConfig) public supportedChains;
    mapping(address => uint64) public investorPreferredChain;
    mapping(bytes32 => uint256) public messageIdToRequestId;
    
    uint256 private nextRequestId;
    address public owner;
    
    // Events
    event CrossChainPayoutRequested(
        uint256 indexed requestId,
        uint64 indexed destinationChain,
        address indexed investor,
        uint256 amount,
        string payoutType
    );
    
    event CrossChainPayoutSent(
        uint256 indexed requestId,
        bytes32 indexed messageId,
        uint64 indexed destinationChain,
        address investor,
        uint256 amount
    );
    
    event CrossChainPayoutReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChain,
        address indexed investor,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlySupportedChain(uint64 chainSelector) {
        require(supportedChains[chainSelector].isActive, "Unsupported chain");
        _;
    }

    constructor(
        address _router,
        address _linkToken,
        address _usdcToken
    ) {
        i_router = IRouterClient(_router);
        i_linkToken = IERC20(_linkToken);
        i_usdcToken = IERC20(_usdcToken);
        owner = msg.sender;
        nextRequestId = 1;

        // Initialize supported chains
        _initializeSupportedChains();
    }

    /**
     * @dev Request a cross-chain payout to an investor
     * @param vaultId The vault ID for the payout
     * @param investor The investor address
     * @param amount The amount to send
     * @param payoutType Type of payout ("PLATFORM_REWARD" or "FIXED_RETURN")
     * @param destinationChain Destination chain selector
     * @param destinationReceiver Receiver address on destination chain
     */
    function requestCrossChainPayout(
        uint256 vaultId,
        address investor,
        uint256 amount,
        string memory payoutType,
        uint64 destinationChain,
        address destinationReceiver
    ) external onlyOwner onlySupportedChain(destinationChain) returns (uint256) {
        require(amount > 0, "Amount must be positive");
        require(destinationReceiver != address(0), "Invalid receiver");

        uint256 requestId = nextRequestId++;
        
        crossChainRequests[requestId] = CrossChainRequest({
            destinationChainSelector: destinationChain,
            destinationReceiver: destinationReceiver,
            token: address(i_usdcToken),
            amount: amount,
            vaultId: vaultId,
            investor: investor,
            payoutType: payoutType,
            requestedAt: block.timestamp,
            isProcessed: false
        });

        emit CrossChainPayoutRequested(
            requestId,
            destinationChain,
            investor,
            amount,
            payoutType
        );

        return requestId;
    }

    /**
     * @dev Execute a cross-chain payout
     * @param requestId The request ID to execute
     */
    function executeCrossChainPayout(uint256 requestId) external onlyOwner {
        CrossChainRequest storage request = crossChainRequests[requestId];
        require(!request.isProcessed, "Request already processed");
        require(request.amount > 0, "Invalid request");

        // Mark as processed
        request.isProcessed = true;

        // Transfer USDC from contract to this contract (should already be here)
        require(
            i_usdcToken.balanceOf(address(this)) >= request.amount,
            "Insufficient USDC balance"
        );

        // Build CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            request.destinationReceiver,
            request.amount,
            address(i_usdcToken)
        );

        // Get the fee required to send the message
        uint256 fees = i_router.getFee(
            request.destinationChainSelector,
            evm2AnyMessage
        );

        require(i_linkToken.balanceOf(address(this)) >= fees, "Insufficient LINK for fees");

        // Approve the Router to transfer LINK for fees
        i_linkToken.approve(address(i_router), fees);

        // Approve the Router to spend USDC
        i_usdcToken.approve(address(i_router), request.amount);

        // Send the message through the router
        bytes32 messageId = i_router.ccipSend(
            request.destinationChainSelector,
            evm2AnyMessage
        );

        // Store the message ID for tracking
        messageIdToRequestId[messageId] = requestId;

        emit CrossChainPayoutSent(
            requestId,
            messageId,
            request.destinationChainSelector,
            request.investor,
            request.amount
        );
    }

    /**
     * @dev Set investor's preferred chain for payouts
     * @param investor The investor address
     * @param chainSelector The preferred chain selector
     */
    function setInvestorPreferredChain(
        address investor,
        uint64 chainSelector
    ) external onlySupportedChain(chainSelector) {
        require(msg.sender == investor || msg.sender == owner, "Not authorized");
        investorPreferredChain[investor] = chainSelector;
    }

    /**
     * @dev Add or update supported chain configuration
     * @param chainSelector The chain selector
     * @param routerAddress The CCIP router address for this chain
     * @param gasLimit Gas limit for transactions on this chain
     */
    function updateSupportedChain(
        uint64 chainSelector,
        address routerAddress,
        uint256 gasLimit
    ) external onlyOwner {
        supportedChains[chainSelector] = ChainConfig({
            chainSelector: chainSelector,
            routerAddress: routerAddress,
            isActive: true,
            gasLimit: gasLimit
        });
    }

    /**
     * @dev Disable a supported chain
     * @param chainSelector The chain selector to disable
     */
    function disableChain(uint64 chainSelector) external onlyOwner {
        supportedChains[chainSelector].isActive = false;
    }

    /**
     * @dev Get cross-chain request details
     * @param requestId The request ID
     * @return CrossChainRequest The request details
     */
    function getCrossChainRequest(uint256 requestId) 
        external 
        view 
        returns (CrossChainRequest memory) 
    {
        return crossChainRequests[requestId];
    }

    /**
     * @dev Get supported chain configuration
     * @param chainSelector The chain selector
     * @return ChainConfig The chain configuration
     */
    function getChainConfig(uint64 chainSelector) 
        external 
        view 
        returns (ChainConfig memory) 
    {
        return supportedChains[chainSelector];
    }

    /**
     * @dev Get investor's preferred chain
     * @param investor The investor address
     * @return uint64 The preferred chain selector
     */
    function getInvestorPreferredChain(address investor) 
        external 
        view 
        returns (uint64) 
    {
        return investorPreferredChain[investor];
    }

    /**
     * @dev Emergency withdraw function for USDC
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawUSDC(uint256 amount) external onlyOwner {
        require(i_usdcToken.transfer(owner, amount), "Transfer failed");
    }

    /**
     * @dev Emergency withdraw function for LINK
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawLINK(uint256 amount) external onlyOwner {
        require(i_linkToken.transfer(owner, amount), "Transfer failed");
    }

    /**
     * @dev Fund the contract with LINK for fees
     * @param amount Amount of LINK to deposit
     */
    function fundWithLINK(uint256 amount) external {
        require(
            i_linkToken.transferFrom(msg.sender, address(this), amount),
            "LINK transfer failed"
        );
    }

    /**
     * @dev Fund the contract with USDC for payouts
     * @param amount Amount of USDC to deposit
     */
    function fundWithUSDC(uint256 amount) external {
        require(
            i_usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
    }

    /**
     * @dev Build a CCIP message for cross-chain transfer
     * @param receiver The receiver address
     * @param amount The amount to transfer
     * @param token The token address
     * @return Client.EVM2AnyMessage The built CCIP message
     */
    function _buildCCIPMessage(
        address receiver,
        uint256 amount,
        address token
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Build the CCIP message
        return Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(""),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(0) // Use LINK for fees
        });
    }

    /**
     * @dev Initialize supported chains with default configurations
     */
    function _initializeSupportedChains() internal {
        // Ethereum Sepolia testnet
        supportedChains[16015286601757825753] = ChainConfig({
            chainSelector: 16015286601757825753,
            routerAddress: 0xD0daae2231E9CB96b94C8512223533293C3693Bf,
            isActive: true,
            gasLimit: 200_000
        });

        // Polygon Mumbai testnet
        supportedChains[12532609583862916517] = ChainConfig({
            chainSelector: 12532609583862916517,
            routerAddress: 0x70499c328e1E2a3c41108bd3730F6670a44595D1,
            isActive: true,
            gasLimit: 200_000
        });

        // Avalanche Fuji testnet
        supportedChains[14767482510784806043] = ChainConfig({
            chainSelector: 14767482510784806043,
            routerAddress: 0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8,
            isActive: true,
            gasLimit: 200_000
        });

        // Arbitrum Sepolia testnet
        supportedChains[3478487238524512106] = ChainConfig({
            chainSelector: 3478487238524512106,
            routerAddress: 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165,
            isActive: true,
            gasLimit: 200_000
        });
    }
} 