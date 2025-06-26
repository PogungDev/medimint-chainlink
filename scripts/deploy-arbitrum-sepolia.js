const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 MediMint A-Z Deployment - Arbitrum Sepolia");
  console.log("==============================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH\n");

  // Arbitrum Sepolia configuration
  const config = {
    // Chainlink Functions (Arbitrum Sepolia)
    functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    donId: "0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000",
    subscriptionId: process.env.CHAINLINK_SUBSCRIPTION_ID || 1,
    
    // Token addresses
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia USDC
    
    // Demo settings
    gasLimit: 300000,
  };

  console.log("📡 Network: Arbitrum Sepolia (Chain ID: 421614)");
  console.log("🔗 Chainlink Functions Router:", config.functionsRouter);
  console.log("💰 USDC Address:", config.usdcAddress);
  console.log("📊 Subscription ID:", config.subscriptionId, "\n");

  const deployedContracts = {};

  try {
    // 1. Deploy VaultNFT (with Chainlink Functions)
    console.log("🏦 Deploying VaultNFT...");
    const VaultNFT = await ethers.getContractFactory("VaultNFT");
    const vaultNFT = await VaultNFT.deploy(
      config.functionsRouter,
      config.donId,
      config.subscriptionId,
      config.usdcAddress
    );
    await vaultNFT.deployed();
    deployedContracts.VaultNFT = vaultNFT.address;
    console.log("✅ VaultNFT deployed to:", vaultNFT.address);

    // 2. Deploy Repayment (with Chainlink Automation)
    console.log("\n💳 Deploying Repayment...");
    const Repayment = await ethers.getContractFactory("Repayment");
    const repayment = await Repayment.deploy(
      vaultNFT.address,
      config.usdcAddress
    );
    await repayment.deployed();
    deployedContracts.Repayment = repayment.address;
    console.log("✅ Repayment deployed to:", repayment.address);

    // 3. Deploy Mock USDC for testing (optional)
    if (process.env.DEPLOY_MOCK_USDC === "true") {
      console.log("\n🪙 Deploying Mock USDC...");
      const MockUSDC = await ethers.getContractFactory("MockERC20");
      const mockUSDC = await MockUSDC.deploy(
        "Mock USDC",
        "USDC",
        6, // 6 decimals
        ethers.utils.parseUnits("1000000", 6) // 1M USDC
      );
      await mockUSDC.deployed();
      deployedContracts.MockUSDC = mockUSDC.address;
      console.log("✅ Mock USDC deployed to:", mockUSDC.address);
    }

    // Save deployment data
    const deploymentData = {
      network: "arbitrumSepolia",
      chainId: 421614,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: config,
      rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
      explorer: "https://sepolia.arbiscan.io",
      faucet: "https://faucets.chain.link"
    };

    // Create deployments directory
    const deploymentDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentDir, "arbitrum-sepolia.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

    // Generate environment variables
    const envVars = `
# MediMint Arbitrum Sepolia Deployment
NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_NETWORK_NAME=arbitrumSepolia
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.arbiscan.io

# Contract Addresses
NEXT_PUBLIC_VAULT_NFT_ADDRESS=${deployedContracts.VaultNFT}
NEXT_PUBLIC_REPAYMENT_ADDRESS=${deployedContracts.Repayment}
NEXT_PUBLIC_USDC_ADDRESS=${config.usdcAddress}

# Chainlink Configuration
CHAINLINK_FUNCTIONS_ROUTER=${config.functionsRouter}
CHAINLINK_DON_ID=${config.donId}
CHAINLINK_SUBSCRIPTION_ID=${config.subscriptionId}
`;

    fs.writeFileSync(path.join(__dirname, "../.env.arbitrum-sepolia"), envVars.trim());

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log(`🌐 Network: Arbitrum Sepolia`);
    console.log(`🔗 Explorer: https://sepolia.arbiscan.io`);
    console.log(`💧 Faucet: https://faucets.chain.link\n`);

    console.log("📋 CONTRACT ADDRESSES:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n📚 NEXT STEPS (A-Z CHECKLIST):");
    console.log("1. ✅ Add Arbitrum Sepolia to MetaMask");
    console.log("2. ✅ Claim ETH from faucet: https://faucets.chain.link");
    console.log("3. ✅ Create Chainlink Functions subscription");
    console.log("4. ✅ Update subscription ID in contracts");
    console.log("5. ✅ Set up Chainlink Automation upkeep");
    console.log("6. ✅ Deploy dummy USDC if needed");
    console.log("7. ✅ Copy .env.arbitrum-sepolia to .env.local");
    console.log("8. ✅ Test vault creation → salary fetch → funding → repayment");

    console.log("\n🔍 VERIFY CONTRACTS:");
    console.log(`npx hardhat verify --network arbitrumSepolia ${deployedContracts.VaultNFT} ${config.functionsRouter} ${config.donId} ${config.subscriptionId} ${config.usdcAddress}`);
    console.log(`npx hardhat verify --network arbitrumSepolia ${deployedContracts.Repayment} ${deployedContracts.VaultNFT} ${config.usdcAddress}`);

    console.log("\n📱 DEMO FLOW READY:");
    console.log("Student: Mint Vault → Chainlink Functions fetches salary");
    console.log("Investor: Fund vault with USDC");
    console.log("Automation: Triggers repayment every 5 minutes");
    console.log("All transactions visible on Arbiscan! 🚀");

    console.log("\n🏆 CHAINLINK SERVICES SETUP:");
    console.log("Functions: https://functions.chain.link (Create subscription)");
    console.log("Automation: https://automation.chain.link (Register upkeep)");
    console.log("Faucet: https://faucets.chain.link (Get testnet tokens)");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    
    // Save failed deployment info
    const failureData = {
      network: "arbitrumSepolia",
      chainId: 421614,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      error: error.message,
      deployedContracts: deployedContracts
    };

    const failurePath = path.join(__dirname, "../deployments/arbitrum-sepolia-failure.json");
    fs.writeFileSync(failurePath, JSON.stringify(failureData, null, 2));
    console.log(`\n💾 Failure data saved to: ${failurePath}`);
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 