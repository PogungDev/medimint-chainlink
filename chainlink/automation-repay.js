// Chainlink Automation configuration for repayment system
const automationConfig = {
  // Arbitrum Sepolia Automation
  registryAddress: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2", // Arbitrum Sepolia Registry
  
  // Upkeep configuration
  upkeepName: "MediMint Repayment Automation",
  gasLimit: 500000,
  checkData: "0x", // Empty check data
  
  // Funding (LINK tokens needed)
  linkAmount: "10", // 10 LINK for funding
  
  // Demo settings
  interval: 300, // 5 minutes in seconds
  
  // Performance tracking
  performedUpkeeps: 0,
  lastPerformance: 0,

  // Registration parameters
  registrationParams: {
    name: "MediMint Repayment Automation",
    encryptedEmail: "0x", // Optional encrypted email
    upkeepContract: "", // Will be filled with Repayment contract address
    gasLimit: 500000,
    adminAddress: "", // Will be filled with deployer address
    triggerType: 0, // Conditional trigger
    checkData: "0x",
    triggerConfig: "0x",
    offchainConfig: "0x",
    amount: "10000000000000000000" // 10 LINK in wei
  },

  // Monitoring and logging
  monitoring: {
    enabled: true,
    webhookUrl: "", // Optional webhook for notifications
    discordWebhook: "", // Optional Discord webhook
    slackWebhook: "" // Optional Slack webhook
  },

  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 60, // seconds
    alertOnFailure: true
  }
};

// Helper functions for automation setup
const automationHelpers = {
  /**
   * Calculate upkeep cost estimation
   */
  calculateUpkeepCost: (gasPrice, gasLimit, upkeepDuration) => {
    const totalGas = gasLimit * (upkeepDuration / 300); // Every 5 minutes
    return totalGas * gasPrice;
  },

  /**
   * Generate upkeep registration transaction data
   */
  generateRegistrationTx: (contractAddress, adminAddress) => {
    return {
      ...automationConfig.registrationParams,
      upkeepContract: contractAddress,
      adminAddress: adminAddress
    };
  },

  /**
   * Monitor upkeep performance
   */
  monitorPerformance: (performData) => {
    automationConfig.performedUpkeeps++;
    automationConfig.lastPerformance = Date.now();
    
    if (automationConfig.monitoring.enabled) {
      console.log(`[AUTOMATION] Upkeep performed: ${performData}`);
      console.log(`[AUTOMATION] Total upkeeps: ${automationConfig.performedUpkeeps}`);
    }
  }
};

module.exports = {
  config: automationConfig,
  helpers: automationHelpers
}; 