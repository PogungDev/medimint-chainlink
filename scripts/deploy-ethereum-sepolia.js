const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting MediMint deployment on Ethereum Sepolia...");
  console.log("================================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // Chainlink addresses for Ethereum Sepolia
  const CHAINLINK_ETH_USD_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const CHAINLINK_VRF_COORDINATOR = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const USDC_ADDRESS = "0xA0b86a33E6417a8aD1baaf85b0F3600a2F3F42B6"; // Sepolia USDC

  let deploymentInfo = {
    network: "ethereumSepolia",
    chainId: 11155111,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // 1. Deploy MockERC20 for USDC first
    console.log("\n💰 1. Deploying MockERC20 (USDC for testing)...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockERC20.deploy("Mock USDC", "mUSDC", 6, hre.ethers.parseUnits("1000000", 6)); // 1M USDC initial supply
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    
    console.log("✅ MockERC20 (USDC) deployed to:", mockUSDCAddress);
    deploymentInfo.contracts.MockUSDC = mockUSDCAddress;

    // 2. Deploy VaultNFT (Core contract)
    console.log("\n📋 2. Deploying VaultNFT...");
    const VaultNFT = await hre.ethers.getContractFactory("VaultNFT");
    const vaultNFT = await VaultNFT.deploy(mockUSDCAddress);
    await vaultNFT.waitForDeployment();
    const vaultAddress = await vaultNFT.getAddress();
    
    console.log("✅ VaultNFT deployed to:", vaultAddress);
    deploymentInfo.contracts.VaultNFT = vaultAddress;

    // 3. Deploy ChainlinkDataFeeds
    console.log("\n📊 3. Deploying ChainlinkDataFeeds...");
    const ChainlinkDataFeeds = await hre.ethers.getContractFactory("ChainlinkDataFeeds");
    const dataFeeds = await ChainlinkDataFeeds.deploy(CHAINLINK_ETH_USD_FEED, vaultAddress);
    await dataFeeds.waitForDeployment();
    const dataFeedsAddress = await dataFeeds.getAddress();
    
    console.log("✅ ChainlinkDataFeeds deployed to:", dataFeedsAddress);
    deploymentInfo.contracts.ChainlinkDataFeeds = dataFeedsAddress;

    // 4. Deploy ChainlinkVRF
    console.log("\n🎲 4. Deploying ChainlinkVRF...");
    const ChainlinkVRF = await hre.ethers.getContractFactory("ChainlinkVRF");
    const vrfContract = await ChainlinkVRF.deploy(vaultAddress);
    await vrfContract.waitForDeployment();
    const vrfAddress = await vrfContract.getAddress();
    
    console.log("✅ ChainlinkVRF deployed to:", vrfAddress);
    deploymentInfo.contracts.ChainlinkVRF = vrfAddress;

    // 5. Initialize contracts and create test data
    console.log("\n🔗 5. Initializing contracts...");
    
    // Create a test vault
    console.log("Creating test vault...");
    const createVaultTx = await vaultNFT.mintVault(
      deployer.address, // student address
      hre.ethers.parseUnits("10000", 6), // 10,000 USDC target
      "Doctor", // education track
      "STUDENT001", // student ID
      "ipfs://QmTestHash123" // token URI
    );
    await createVaultTx.wait();
    console.log("✅ Test vault created with ID: 1");

    // Start a lottery round in VRF contract
    console.log("Starting lottery round...");
    const startLotteryTx = await vrfContract.startLotteryRound();
    await startLotteryTx.wait();
    console.log("✅ Lottery round started");

    // Skip Data Feeds testing on local network (no real price feeds)
    console.log("⏭️  Skipping Data Feeds testing (local network)");

    // 6. Save deployment information
    console.log("\n💾 6. Saving deployment information...");
    
    const deploymentPath = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentPath, `ethereum-sepolia-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    // Update .env.local file
    console.log("Updating .env.local with contract addresses...");
    const envPath = path.join(__dirname, "..", ".env.local");
    let envContent = fs.readFileSync(envPath, "utf8");
    
    envContent = envContent.replace(
      /NEXT_PUBLIC_VAULT_NFT_ADDRESS=.*/,
      `NEXT_PUBLIC_VAULT_NFT_ADDRESS=${vaultAddress}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_CHAINLINK_DATA_FEEDS_ADDRESS=.*/,
      `NEXT_PUBLIC_CHAINLINK_DATA_FEEDS_ADDRESS=${dataFeedsAddress}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_CHAINLINK_VRF_ADDRESS=.*/,
      `NEXT_PUBLIC_CHAINLINK_VRF_ADDRESS=${vrfAddress}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_USDC_ADDRESS=.*/,
      `NEXT_PUBLIC_USDC_ADDRESS=${mockUSDCAddress}`
    );
    
    fs.writeFileSync(envPath, envContent);

    // 7. Display deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("================================================================");
    console.log("📋 Contract Addresses:");
    console.log(`   VaultNFT: ${vaultAddress}`);
    console.log(`   ChainlinkDataFeeds: ${dataFeedsAddress}`);
    console.log(`   ChainlinkVRF: ${vrfAddress}`);
    console.log(`   MockUSDC: ${mockUSDCAddress}`);
    console.log("\n🔗 Chainlink Integration:");
    console.log(`   ETH/USD Price Feed: ${CHAINLINK_ETH_USD_FEED}`);
    console.log(`   VRF Coordinator: ${CHAINLINK_VRF_COORDINATOR}`);
    console.log("\n📊 Testing Features Available:");
    console.log("   ✅ Data Feeds: Price-based vault multipliers");
    console.log("   ✅ VRF: Random lottery system");
    console.log("   ✅ Automation: Ready for upkeep registration");
    console.log("   ✅ Test Vault: Created and ready for interactions");
    console.log("\n🌐 Frontend Integration:");
    console.log(`   Network: Ethereum Sepolia (Chain ID: 11155111)`);
    console.log(`   .env.local updated with contract addresses`);
    console.log(`   Ready to start frontend: npm run dev`);
    console.log("\n💡 Next Steps:");
    console.log("   1. Start the frontend: npm run dev");
    console.log("   2. Connect Rabby wallet to Ethereum Sepolia");
    console.log("   3. Test Data Feed price updates");
    console.log("   4. Test VRF lottery functionality");
    console.log("   5. Monitor transactions on Sepolia Etherscan");

    return deploymentInfo;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then((deploymentInfo) => {
    console.log("\n✅ Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  }); 