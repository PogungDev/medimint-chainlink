const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 MediMint Simple Deployment - Arbitrum Sepolia");
  console.log("=================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Arbitrum Sepolia configuration
  const config = {
    functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    donId: "0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000",
    subscriptionId: 1,
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia USDC
    ethUsdFeed: "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08", // ETH/USD price feed
    gasLimit: 300000,
  };

  console.log("📡 Network: Arbitrum Sepolia (Chain ID: 421614)");
  console.log("🔗 Chainlink Functions Router:", config.functionsRouter);
  console.log("💰 USDC Address:", config.usdcAddress);

  const deployedContracts = {};

  try {
    // 1. Deploy VaultNFT
    console.log("\n🏦 Deploying VaultNFT...");
    const VaultNFT = await hre.ethers.getContractFactory("VaultNFT");
    const vaultNFT = await VaultNFT.deploy(
      config.usdcAddress
    );
    await vaultNFT.waitForDeployment();
    deployedContracts.VaultNFT = await vaultNFT.getAddress();
    console.log("✅ VaultNFT deployed to:", deployedContracts.VaultNFT);

    // 2. Deploy Repayment
    console.log("\n💳 Deploying Repayment...");
    const Repayment = await hre.ethers.getContractFactory("Repayment");
    const repayment = await Repayment.deploy(
      deployedContracts.VaultNFT,
      config.usdcAddress
    );
    await repayment.waitForDeployment();
    deployedContracts.Repayment = await repayment.getAddress();
    console.log("✅ Repayment deployed to:", deployedContracts.Repayment);

    // 3. Deploy ChainlinkDataFeeds (optional for price feeds)
    console.log("\n📊 Deploying ChainlinkDataFeeds...");
    const ChainlinkDataFeeds = await hre.ethers.getContractFactory("ChainlinkDataFeeds");
    const dataFeeds = await ChainlinkDataFeeds.deploy(
      config.ethUsdFeed, // ETH/USD price feed as proxy for USDC
      deployedContracts.VaultNFT
    );
    await dataFeeds.waitForDeployment();
    deployedContracts.ChainlinkDataFeeds = await dataFeeds.getAddress();
    console.log("✅ ChainlinkDataFeeds deployed to:", deployedContracts.ChainlinkDataFeeds);

    // Save deployment data
    const deploymentData = {
      network: "arbitrumSepolia",
      chainId: 421614,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: config,
      rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
      explorer: "https://sepolia.arbiscan.io"
    };

    // Create deployments directory
    const deploymentDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentDir, "arbitrum-sepolia.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log(`🌐 Network: Arbitrum Sepolia`);
    console.log(`🔗 Explorer: https://sepolia.arbiscan.io`);

    console.log("\n📋 CONTRACT ADDRESSES:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n📊 Explorer Links:");
    console.log(`VaultNFT: https://sepolia.arbiscan.io/address/${deployedContracts.VaultNFT}`);
    console.log(`Repayment: https://sepolia.arbiscan.io/address/${deployedContracts.Repayment}`);
    console.log(`DataFeeds: https://sepolia.arbiscan.io/address/${deployedContracts.ChainlinkDataFeeds}`);

    console.log("\n🔄 NEXT: Update .env.local with these addresses:");
    console.log(`NEXT_PUBLIC_VAULT_NFT_ADDRESS=${deployedContracts.VaultNFT}`);
    console.log(`NEXT_PUBLIC_REPAYMENT_ADDRESS=${deployedContracts.Repayment}`);
    console.log(`NEXT_PUBLIC_CHAINLINK_DATA_FEEDS_ADDRESS=${deployedContracts.ChainlinkDataFeeds}`);

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 