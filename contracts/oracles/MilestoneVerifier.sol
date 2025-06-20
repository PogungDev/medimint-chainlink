// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/functions/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/FunctionsRequest.sol";

interface IEducationSBT {
    function addMilestone(uint256 tokenId, string memory description, uint256 scoreImpact, string memory verificationData) external;
    function updatePhase(uint256 tokenId, string memory newPhase) external;
    function getSBTData(uint256 tokenId) external view returns (
        uint256 vaultId,
        string memory educationTrack,
        uint256 issuedAt,
        uint256 reputationScore,
        uint256 milestonesCompleted,
        uint256 totalMilestones,
        bool isCompliant,
        address beneficiary,
        string memory currentPhase
    );
}

/**
 * @title MilestoneVerifier
 * @dev Verifies student milestones using Chainlink Automation and Functions
 * @notice Automates milestone checking and verification through external APIs
 */
contract MilestoneVerifier is AutomationCompatibleInterface, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct PendingVerification {
        uint256 tokenId;
        string milestoneType;
        string description;
        uint256 expectedScore;
        uint256 submittedAt;
        bool isProcessed;
        bytes32 requestId;
    }

    struct MilestoneTemplate {
        string milestoneType;
        uint256 scoreImpact;
        string verificationSource; // "UNIVERSITY_API", "MANUAL", "DOCUMENT"
        bool isActive;
    }

    // State variables
    IEducationSBT public immutable educationSBT;
    bytes32 public immutable donId;
    uint64 public immutable subscriptionId;
    uint32 public immutable gasLimit;
    
    mapping(uint256 => PendingVerification[]) public pendingVerifications;
    mapping(bytes32 => uint256) public requestToTokenId;
    mapping(string => MilestoneTemplate) public milestoneTemplates;
    mapping(uint256 => uint256) public lastAutomationCheck;
    
    uint256 public verificationInterval = 24 hours;
    uint256 public automationCounter;
    
    // JavaScript source for Chainlink Functions
    string public constant VERIFICATION_SOURCE = 
        "const tokenId = args[0];"
        "const milestoneType = args[1];"
        "const studentId = args[2];"
        "try {"
        "  const response = await Functions.makeHttpRequest({"
        "    url: `https://api.university.edu/student/${studentId}/milestones`,"
        "    headers: { 'Authorization': 'Bearer ' + secrets.apiKey }"
        "  });"
        "  const milestones = response.data.milestones;"
        "  const milestone = milestones.find(m => m.type === milestoneType);"
        "  if (milestone && milestone.completed) {"
        "    return Functions.encodeString(JSON.stringify({"
        "      verified: true,"
        "      completedAt: milestone.completedAt,"
        "      grade: milestone.grade || 'N/A',"
        "      details: milestone.details"
        "    }));"
        "  } else {"
        "    return Functions.encodeString(JSON.stringify({verified: false}));"
        "  }"
        "} catch (error) {"
        "  return Functions.encodeString(JSON.stringify({error: error.message}));"
        "}";

    // Events
    event MilestoneSubmitted(uint256 indexed tokenId, string milestoneType, bytes32 requestId);
    event MilestoneVerified(uint256 indexed tokenId, string milestoneType, bool verified, uint256 scoreImpact);
    event AutomationPerformed(uint256 indexed tokenId, uint256 verificationsProcessed);
    event MilestoneTemplateUpdated(string milestoneType, uint256 scoreImpact);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    address public owner;

    constructor(
        address _educationSBT,
        address _functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId,
        uint32 _gasLimit
    ) FunctionsClient(_functionsRouter) {
        educationSBT = IEducationSBT(_educationSBT);
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        owner = msg.sender;

        // Initialize milestone templates
        _initializeMilestoneTemplates();
    }

    /**
     * @dev Submit a milestone for verification
     * @param tokenId SBT token ID
     * @param milestoneType Type of milestone (e.g., "SEMESTER_1", "GRADUATION")
     * @param description Human-readable description
     * @param studentId External student ID for API verification
     */
    function submitMilestone(
        uint256 tokenId,
        string memory milestoneType,
        string memory description,
        string memory studentId
    ) external {
        require(milestoneTemplates[milestoneType].isActive, "Invalid milestone type");
        
        // Create Chainlink Functions request
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(VERIFICATION_SOURCE);
        
        string[] memory args = new string[](3);
        args[0] = _toString(tokenId);
        args[1] = milestoneType;
        args[2] = studentId;
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        // Store pending verification
        pendingVerifications[tokenId].push(PendingVerification({
            tokenId: tokenId,
            milestoneType: milestoneType,
            description: description,
            expectedScore: milestoneTemplates[milestoneType].scoreImpact,
            submittedAt: block.timestamp,
            isProcessed: false,
            requestId: requestId
        }));

        requestToTokenId[requestId] = tokenId;
        
        emit MilestoneSubmitted(tokenId, milestoneType, requestId);
    }

    /**
     * @dev Chainlink Functions callback
     * @param requestId The request ID
     * @param response The response from the external API
     * @param err Any error that occurred
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 tokenId = requestToTokenId[requestId];
        require(tokenId != 0, "Invalid request ID");

        // Find and process the pending verification
        PendingVerification[] storage verifications = pendingVerifications[tokenId];
        
        for (uint256 i = 0; i < verifications.length; i++) {
            if (verifications[i].requestId == requestId && !verifications[i].isProcessed) {
                verifications[i].isProcessed = true;
                
                if (err.length > 0) {
                    // Handle error case
                    emit MilestoneVerified(tokenId, verifications[i].milestoneType, false, 0);
                    return;
                }

                // Parse response
                string memory responseString = string(response);
                bool verified = _parseVerificationResult(responseString);
                
                if (verified) {
                    // Add milestone to SBT
                    educationSBT.addMilestone(
                        tokenId,
                        verifications[i].description,
                        verifications[i].expectedScore,
                        responseString
                    );
                    
                    emit MilestoneVerified(
                        tokenId, 
                        verifications[i].milestoneType, 
                        true, 
                        verifications[i].expectedScore
                    );
                } else {
                    emit MilestoneVerified(tokenId, verifications[i].milestoneType, false, 0);
                }
                
                break;
            }
        }
    }

    /**
     * @dev Chainlink Automation checkUpkeep function
     * @param checkData Encoded data for automation check
     * @return upkeepNeeded Whether upkeep is needed
     * @return performData Data to pass to performUpkeep
     */
    function checkUpkeep(bytes calldata checkData) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        uint256 startTokenId = abi.decode(checkData, (uint256));
        
        // Check if any tokens need milestone verification
        for (uint256 i = startTokenId; i < startTokenId + 10; i++) {
            if (lastAutomationCheck[i] + verificationInterval <= block.timestamp) {
                upkeepNeeded = true;
                performData = abi.encode(i);
                break;
            }
        }
    }

    /**
     * @dev Chainlink Automation performUpkeep function
     * @param performData Data from checkUpkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256 tokenId = abi.decode(performData, (uint256));
        
        // Update last check timestamp
        lastAutomationCheck[tokenId] = block.timestamp;
        automationCounter++;
        
        // Process any pending verifications that have been waiting
        _processTimeoutVerifications(tokenId);
        
        emit AutomationPerformed(tokenId, 1);
    }

    /**
     * @dev Add or update milestone template
     * @param milestoneType Type identifier
     * @param scoreImpact Score impact for this milestone
     * @param verificationSource How this milestone is verified
     */
    function updateMilestoneTemplate(
        string memory milestoneType,
        uint256 scoreImpact,
        string memory verificationSource
    ) external onlyOwner {
        milestoneTemplates[milestoneType] = MilestoneTemplate({
            milestoneType: milestoneType,
            scoreImpact: scoreImpact,
            verificationSource: verificationSource,
            isActive: true
        });
        
        emit MilestoneTemplateUpdated(milestoneType, scoreImpact);
    }

    /**
     * @dev Get pending verifications for a token
     * @param tokenId SBT token ID
     * @return Array of pending verifications
     */
    function getPendingVerifications(uint256 tokenId) 
        external 
        view 
        returns (PendingVerification[] memory) 
    {
        return pendingVerifications[tokenId];
    }

    /**
     * @dev Initialize default milestone templates
     */
    function _initializeMilestoneTemplates() internal {
        milestoneTemplates["SEMESTER_1"] = MilestoneTemplate("SEMESTER_1", 10, "UNIVERSITY_API", true);
        milestoneTemplates["SEMESTER_2"] = MilestoneTemplate("SEMESTER_2", 10, "UNIVERSITY_API", true);
        milestoneTemplates["SEMESTER_3"] = MilestoneTemplate("SEMESTER_3", 10, "UNIVERSITY_API", true);
        milestoneTemplates["SEMESTER_4"] = MilestoneTemplate("SEMESTER_4", 10, "UNIVERSITY_API", true);
        milestoneTemplates["SEMESTER_5"] = MilestoneTemplate("SEMESTER_5", 10, "UNIVERSITY_API", true);
        milestoneTemplates["SEMESTER_6"] = MilestoneTemplate("SEMESTER_6", 10, "UNIVERSITY_API", true);
        milestoneTemplates["GRADUATION"] = MilestoneTemplate("GRADUATION", 50, "UNIVERSITY_API", true);
        milestoneTemplates["RESIDENCY_START"] = MilestoneTemplate("RESIDENCY_START", 30, "MANUAL", true);
        milestoneTemplates["BOARD_CERTIFICATION"] = MilestoneTemplate("BOARD_CERTIFICATION", 100, "MANUAL", true);
    }

    /**
     * @dev Parse verification result from JSON response
     * @param response JSON string response
     * @return verified Whether the milestone was verified
     */
    function _parseVerificationResult(string memory response) internal pure returns (bool verified) {
        // Simple parsing - in production, use a more robust JSON parser
        bytes memory responseBytes = bytes(response);
        bytes memory target = bytes("\"verified\":true");
        
        if (responseBytes.length >= target.length) {
            for (uint256 i = 0; i <= responseBytes.length - target.length; i++) {
                bool match = true;
                for (uint256 j = 0; j < target.length; j++) {
                    if (responseBytes[i + j] != target[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) return true;
            }
        }
        return false;
    }

    /**
     * @dev Process verifications that have timed out
     * @param tokenId SBT token ID
     */
    function _processTimeoutVerifications(uint256 tokenId) internal {
        PendingVerification[] storage verifications = pendingVerifications[tokenId];
        uint256 timeoutThreshold = block.timestamp - 1 hours;
        
        for (uint256 i = 0; i < verifications.length; i++) {
            if (!verifications[i].isProcessed && 
                verifications[i].submittedAt < timeoutThreshold) {
                
                verifications[i].isProcessed = true;
                emit MilestoneVerified(tokenId, verifications[i].milestoneType, false, 0);
            }
        }
    }

    /**
     * @dev Convert uint256 to string
     * @param value The uint256 value to convert
     * @return The string representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
} 