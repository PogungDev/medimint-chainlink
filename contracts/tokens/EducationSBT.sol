// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EducationSBT
 * @dev Soulbound Token representing education commitment and progress
 * @notice Non-transferable token showing repayment commitment & milestone progress
 */
contract EducationSBT is ERC721, Ownable, ReentrancyGuard {
    
    struct SBTMetadata {
        uint256 vaultId;
        string educationTrack;
        uint256 issuedAt;
        uint256 reputationScore;
        uint256 milestonesCompleted;
        uint256 totalMilestones;
        bool isCompliant;
        address beneficiary;
        string currentPhase; // "STUDY", "WORKING", "COMPLETED"
    }

    struct Milestone {
        string description;
        uint256 completedAt;
        uint256 scoreImpact;
        bool isVerified;
        string verificationData;
    }

    // State variables
    uint256 private _nextTokenId;
    mapping(uint256 => SBTMetadata) public sbtData;
    mapping(uint256 => Milestone[]) public milestones;
    mapping(address => uint256) public ownerToTokenId;
    mapping(uint256 => bool) public isTokenActive;
    
    // Authorized contracts that can update SBT data
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event SBTMinted(uint256 indexed tokenId, address indexed beneficiary, uint256 vaultId);
    event MilestoneAdded(uint256 indexed tokenId, string description, uint256 scoreImpact);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newScore);
    event ComplianceStatusChanged(uint256 indexed tokenId, bool isCompliant);
    event PhaseChanged(uint256 indexed tokenId, string newPhase);

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    constructor() ERC721("MediMint Education SBT", "MEDISBT") {
        _nextTokenId = 1;
    }

    /**
     * @dev Mints a new SBT for a beneficiary
     * @param beneficiary The student receiving the SBT
     * @param vaultId The associated vault ID
     * @param educationTrack Description of education program
     * @param totalMilestones Expected number of milestones
     */
    function mintSBT(
        address beneficiary,
        uint256 vaultId,
        string memory educationTrack,
        uint256 totalMilestones
    ) external onlyAuthorized returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(ownerToTokenId[beneficiary] == 0, "Beneficiary already has SBT");

        uint256 tokenId = _nextTokenId++;
        
        sbtData[tokenId] = SBTMetadata({
            vaultId: vaultId,
            educationTrack: educationTrack,
            issuedAt: block.timestamp,
            reputationScore: 100, // Starting score
            milestonesCompleted: 0,
            totalMilestones: totalMilestones,
            isCompliant: true,
            beneficiary: beneficiary,
            currentPhase: "STUDY"
        });

        ownerToTokenId[beneficiary] = tokenId;
        isTokenActive[tokenId] = true;

        _mint(beneficiary, tokenId);

        emit SBTMinted(tokenId, beneficiary, vaultId);
        return tokenId;
    }

    /**
     * @dev Adds a milestone to the SBT
     * @param tokenId The SBT token ID
     * @param description Milestone description
     * @param scoreImpact Impact on reputation score (positive or negative)
     * @param verificationData Additional verification information
     */
    function addMilestone(
        uint256 tokenId,
        string memory description,
        uint256 scoreImpact,
        string memory verificationData
    ) external onlyAuthorized tokenExists(tokenId) {
        milestones[tokenId].push(Milestone({
            description: description,
            completedAt: block.timestamp,
            scoreImpact: scoreImpact,
            isVerified: true,
            verificationData: verificationData
        }));

        // Update SBT metadata
        sbtData[tokenId].milestonesCompleted++;
        
        // Update reputation score
        if (scoreImpact > 0) {
            sbtData[tokenId].reputationScore += scoreImpact;
        } else {
            if (sbtData[tokenId].reputationScore > scoreImpact) {
                sbtData[tokenId].reputationScore -= scoreImpact;
            } else {
                sbtData[tokenId].reputationScore = 0;
            }
        }

        // Check compliance based on reputation
        _updateCompliance(tokenId);

        emit MilestoneAdded(tokenId, description, scoreImpact);
        emit ReputationUpdated(tokenId, sbtData[tokenId].reputationScore);
    }

    /**
     * @dev Updates the current phase of education
     * @param tokenId The SBT token ID
     * @param newPhase The new phase ("STUDY", "WORKING", "COMPLETED")
     */
    function updatePhase(uint256 tokenId, string memory newPhase) 
        external 
        onlyAuthorized 
        tokenExists(tokenId) 
    {
        sbtData[tokenId].currentPhase = newPhase;
        emit PhaseChanged(tokenId, newPhase);
    }

    /**
     * @dev Checks if the SBT holder is compliant
     * @param tokenId The SBT token ID
     * @return bool Whether the holder is compliant
     */
    function isCompliant(uint256 tokenId) external view tokenExists(tokenId) returns (bool) {
        return sbtData[tokenId].isCompliant;
    }

    /**
     * @dev Gets the reputation score
     * @param tokenId The SBT token ID
     * @return uint256 The current reputation score
     */
    function getReputationScore(uint256 tokenId) external view tokenExists(tokenId) returns (uint256) {
        return sbtData[tokenId].reputationScore;
    }

    /**
     * @dev Gets all milestones for a token
     * @param tokenId The SBT token ID
     * @return Milestone[] Array of milestones
     */
    function getMilestones(uint256 tokenId) external view tokenExists(tokenId) returns (Milestone[] memory) {
        return milestones[tokenId];
    }

    /**
     * @dev Gets SBT metadata
     * @param tokenId The SBT token ID
     * @return SBTMetadata The complete metadata
     */
    function getSBTData(uint256 tokenId) external view tokenExists(tokenId) returns (SBTMetadata memory) {
        return sbtData[tokenId];
    }

    /**
     * @dev Adds an authorized updater
     * @param updater Address to authorize
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }

    /**
     * @dev Removes an authorized updater
     * @param updater Address to remove authorization
     */
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }

    /**
     * @dev Internal function to update compliance status
     * @param tokenId The SBT token ID
     */
    function _updateCompliance(uint256 tokenId) internal {
        SBTMetadata storage sbt = sbtData[tokenId];
        
        // Compliance rules:
        // - Reputation score must be above 50
        // - Must have completed at least 50% of milestones if in WORKING phase
        bool newCompliance = sbt.reputationScore >= 50;
        
        if (keccak256(bytes(sbt.currentPhase)) == keccak256(bytes("WORKING"))) {
            uint256 completionPercentage = (sbt.milestonesCompleted * 100) / sbt.totalMilestones;
            newCompliance = newCompliance && completionPercentage >= 50;
        }

        if (sbt.isCompliant != newCompliance) {
            sbt.isCompliant = newCompliance;
            emit ComplianceStatusChanged(tokenId, newCompliance);
        }
    }

    /**
     * @dev Override transfer functions to make tokens non-transferable (Soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(from == address(0), "SBT: Token is non-transferable");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev Override approve to prevent approvals
     */
    function approve(address, uint256) public pure override {
        revert("SBT: Token is non-transferable");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: Token is non-transferable");
    }

    /**
     * @dev Override transferFrom to prevent transfers
     */
    function transferFrom(address, address, uint256) public pure override {
        revert("SBT: Token is non-transferable");
    }

    /**
     * @dev Override safeTransferFrom to prevent transfers
     */
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("SBT: Token is non-transferable");
    }

    /**
     * @dev Override safeTransferFrom with data to prevent transfers
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("SBT: Token is non-transferable");
    }
} 