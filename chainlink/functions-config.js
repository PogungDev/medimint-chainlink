// Chainlink Functions Configuration for Arbitrum Sepolia
const config = {
  // Arbitrum Sepolia network configuration
  network: "arbitrumSepolia",
  chainId: 421614,
  
  // Chainlink Functions configuration
  functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C", // Arbitrum Sepolia
  donId: "0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000", // fun-arbitrum-sepolia-1
  
  // Subscription configuration (you'll need to create this)
  subscriptionId: 1, // Update after creating subscription
  gasLimit: 300000,
  
  // Demo API endpoints
  salaryAPI: "https://api.medimint.demo/student/income-estimate",
  
  // Contract addresses (will be populated after deployment)
  contracts: {
    VaultNFT: "",
    Repayment: "",
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" // Arbitrum Sepolia USDC
  },

  // Sample JavaScript source for Functions
  salaryFetchSource: `
    const studentId = args[0];
    const educationTrack = args[1];
    
    try {
      // Mock API call - in production, use real university API
      const response = await Functions.makeHttpRequest({
        url: \`https://api.medimint.demo/student/income-estimate?id=\${studentId}&track=\${educationTrack}\`,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.projectedSalary) {
        return Functions.encodeUint256(response.data.projectedSalary);
      } else {
        // Fallback based on education track
        let fallbackSalary = 75000; // Default
        if (educationTrack.toLowerCase().includes('medical')) {
          fallbackSalary = 120000;
        } else if (educationTrack.toLowerCase().includes('specialist')) {
          fallbackSalary = 150000;
        }
        return Functions.encodeUint256(fallbackSalary);
      }
    } catch (error) {
      // Return default salary on error
      return Functions.encodeUint256(75000);
    }
  `,

  // Simulation settings for testing
  simulation: {
    enabled: true,
    mockResponses: {
      "medical-general": 120000,
      "medical-specialist": 150000,
      "medical-surgery": 200000,
      "medical-research": 100000
    }
  }
};

module.exports = config; 