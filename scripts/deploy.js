const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting MediMint contract deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH\n");

  // Network-specific configurations
  const networkConfig = {
    polygonMumbai: {
      usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      usdcPriceFeed: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
      linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      chainlinkRouter: "0x70499c328e1E2a3c41108bd3730F6670a44595D1",
      functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
      donId: "fun-polygon-mumbai-1",
      subscriptionId: 1, // You'll need to create this
      gasLimit: 300000,
    },
    hardhat: {
      // Mock addresses for local testing
      usdcAddress: "0x0000000000000000000000000000000000000001",
      usdcPriceFeed: "0x0000000000000000000000000000000000000002",
      linkToken: "0x0000000000000000000000000000000000000003",
      chainlinkRouter: "0x0000000000000000000000000000000000000004",
      functionsRouter: "0x0000000000000000000000000000000000000005",
      donId: "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
      subscriptionId: 1,
      gasLimit: 300000,
    }
  };

  const network = await ethers.provider.getNetwork();
  const networkName = network.chainId === 31337 ? "hardhat" : "polygonMumbai";
  const config = networkConfig[networkName];

  console.log(`📡 Deploying to network: ${networkName} (Chain ID: ${network.chainId})\n`);

  // Contract deployment tracking
  const deployedContracts = {};

  try {
    // 1. Deploy RWAEducationNFT (Main vault contract)
    console.log("📄 Deploying RWAEducationNFT...");
    const RWAEducationNFT = await ethers.getContractFactory("RWAEducationNFT");
    const rwaEducationNFT = await RWAEducationNFT.deploy(
      config.usdcAddress,
      config.usdcPriceFeed,
      deployer.address // Platform treasury
    );
    await rwaEducationNFT.deployed();
    deployedContracts.RWAEducationNFT = rwaEducationNFT.address;
    console.log("✅ RWAEducationNFT deployed to:", rwaEducationNFT.address);

    // 2. Deploy EducationSBT (Soulbound token)
    console.log("\n🎫 Deploying EducationSBT...");
    const EducationSBT = await ethers.getContractFactory("EducationSBT");
    const educationSBT = await EducationSBT.deploy();
    await educationSBT.deployed();
    deployedContracts.EducationSBT = educationSBT.address;
    console.log("✅ EducationSBT deployed to:", educationSBT.address);

    // 3. Deploy MilestoneVerifier (Chainlink automation & functions)
    console.log("\n🔍 Deploying MilestoneVerifier...");
    const MilestoneVerifier = await ethers.getContractFactory("MilestoneVerifier");
    const milestoneVerifier = await MilestoneVerifier.deploy(
      educationSBT.address,
      config.functionsRouter,
      config.donId,
      config.subscriptionId,
      config.gasLimit
    );
    await milestoneVerifier.deployed();
    deployedContracts.MilestoneVerifier = milestoneVerifier.address;
    console.log("✅ MilestoneVerifier deployed to:", milestoneVerifier.address);

    // 4. Deploy CrossChainPayout (CCIP integration)
    console.log("\n🌐 Deploying CrossChainPayout...");
    const CrossChainPayout = await ethers.getContractFactory("CrossChainPayout");
    const crossChainPayout = await CrossChainPayout.deploy(
      config.chainlinkRouter,
      config.linkToken,
      config.usdcAddress
    );
    await crossChainPayout.deployed();
    deployedContracts.CrossChainPayout = crossChainPayout.address;
    console.log("✅ CrossChainPayout deployed to:", crossChainPayout.address);

    // 5. Set up contract permissions and integrations
    console.log("\n⚙️ Setting up contract permissions...");

    // Add MilestoneVerifier as authorized updater for EducationSBT
    await educationSBT.addAuthorizedUpdater(milestoneVerifier.address);
    console.log("✅ MilestoneVerifier authorized to update SBT");

    // Add RWAEducationNFT as authorized updater for EducationSBT
    await educationSBT.addAuthorizedUpdater(rwaEducationNFT.address);
    console.log("✅ RWAEducationNFT authorized to update SBT");

    // Verify deployment
    console.log("\n🔍 Verifying deployments...");
    
    const rwaName = await rwaEducationNFT.name();
    const sbtName = await educationSBT.name();
    console.log("✅ RWA NFT name:", rwaName);
    console.log("✅ SBT name:", sbtName);

    // Save deployment addresses
    const deploymentData = {
      network: networkName,
      chainId: network.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: config
    };

    const deploymentPath = path.join(__dirname, `../deployments/${networkName}-deployment.json`);
    
    // Create deployments directory if it doesn't exist
    const deploymentDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment data saved to: ${deploymentPath}`);

    // Generate environment variables for frontend
    const envVars = `
# MediMint Contract Addresses - ${networkName}
NEXT_PUBLIC_RWA_EDUCATION_NFT_ADDRESS=${deployedContracts.RWAEducationNFT}
NEXT_PUBLIC_EDUCATION_SBT_ADDRESS=${deployedContracts.EducationSBT}
NEXT_PUBLIC_MILESTONE_VERIFIER_ADDRESS=${deployedContracts.MilestoneVerifier}
NEXT_PUBLIC_CROSS_CHAIN_PAYOUT_ADDRESS=${deployedContracts.CrossChainPayout}
NEXT_PUBLIC_USDC_ADDRESS=${config.usdcAddress}
NEXT_PUBLIC_CHAIN_ID=${network.chainId}
NEXT_PUBLIC_NETWORK_NAME=${networkName}
`;

    const envPath = path.join(__dirname, `../.env.${networkName}`);
    fs.writeFileSync(envPath, envVars.trim());
    console.log(`📝 Environment variables saved to: ${envPath}`);

    // Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log(`Network: ${networkName} (${network.chainId})`);
    console.log(`Deployer: ${deployer.address}`);
    console.log("\n📋 Contract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n📚 Next Steps:");
    console.log("1. Copy the contract addresses to your .env.local file");
    console.log("2. Verify contracts on block explorer");
    console.log("3. Set up Chainlink subscription for Functions");
    console.log("4. Fund CrossChainPayout contract with LINK tokens");
    console.log("5. Create initial education vaults for testing");

    if (networkName !== "hardhat") {
      console.log("\n🔍 Verify contracts with:");
      Object.entries(deployedContracts).forEach(([name, address]) => {
        console.log(`npx hardhat verify --network ${networkName} ${address}`);
      });
    }

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    
    // Save failed deployment info
    const failureData = {
      network: networkName,
      chainId: network.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      error: error.message,
      deployedContracts: deployedContracts
    };

    const failurePath = path.join(__dirname, `../deployments/${networkName}-failure.json`);
    fs.writeFileSync(failurePath, JSON.stringify(failureData, null, 2));
    console.log(`\n💾 Failure data saved to: ${failurePath}`);
    
    process.exit(1);
  }
}

// Error handling
main()
  .then(() => {
    console.log("\n✨ Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error in deployment script:");
    console.error(error);
    process.exit(1);
  }); 