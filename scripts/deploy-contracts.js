const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting MediMint contract deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract addresses (update these based on network)
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon Mumbai USDC
  const USDC_PRICE_FEED = process.env.USDC_PRICE_FEED || "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0"; // USDC/USD Price Feed
  const PLATFORM_TREASURY = process.env.PLATFORM_TREASURY || deployer.address;
  
  // Chainlink configuration
  const FUNCTIONS_ROUTER = process.env.CHAINLINK_FUNCTIONS_ROUTER || "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C";
  const DON_ID = process.env.CHAINLINK_DON_ID || "0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000";
  const SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID || "1";
  const GAS_LIMIT = 300000;

  try {
    // 1. Deploy Education SBT
    console.log("\n📜 Deploying Education SBT...");
    const EducationSBT = await ethers.getContractFactory("EducationSBT");
    const educationSBT = await EducationSBT.deploy();
    await educationSBT.deployed();
    console.log("✅ Education SBT deployed to:", educationSBT.address);

    // 2. Deploy RWA Education NFT
    console.log("\n🏦 Deploying RWA Education NFT...");
    const RWAEducationNFT = await ethers.getContractFactory("RWAEducationNFT");
    const rwaEducationNFT = await RWAEducationNFT.deploy(
      USDC_ADDRESS,
      USDC_PRICE_FEED,
      PLATFORM_TREASURY
    );
    await rwaEducationNFT.deployed();
    console.log("✅ RWA Education NFT deployed to:", rwaEducationNFT.address);

    // 3. Deploy Milestone Verifier
    console.log("\n🔍 Deploying Milestone Verifier...");
    const MilestoneVerifier = await ethers.getContractFactory("MilestoneVerifier");
    const milestoneVerifier = await MilestoneVerifier.deploy(
      educationSBT.address,
      FUNCTIONS_ROUTER,
      DON_ID,
      SUBSCRIPTION_ID,
      GAS_LIMIT
    );
    await milestoneVerifier.deployed();
    console.log("✅ Milestone Verifier deployed to:", milestoneVerifier.address);

    // 4. Deploy Cross Chain Payout (if needed)
    console.log("\n🌉 Deploying Cross Chain Payout...");
    const CrossChainPayout = await ethers.getContractFactory("CrossChainPayout");
    const CCIP_ROUTER = process.env.CCIP_ROUTER || "0x70499c328e1e2a3c41108bd3730f6670a44595d1"; // Mumbai CCIP Router
    const LINK_TOKEN = process.env.LINK_TOKEN || "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai LINK
    
    const crossChainPayout = await CrossChainPayout.deploy(
      CCIP_ROUTER,
      LINK_TOKEN,
      rwaEducationNFT.address
    );
    await crossChainPayout.deployed();
    console.log("✅ Cross Chain Payout deployed to:", crossChainPayout.address);

    // 5. Set up permissions
    console.log("\n🔐 Setting up contract permissions...");
    
    // Allow milestone verifier to update SBT
    await educationSBT.setAuthorizedUpdater(milestoneVerifier.address, true);
    console.log("✅ Milestone Verifier authorized for SBT updates");
    
    // Allow RWA NFT contract to mint SBTs
    await educationSBT.setAuthorizedUpdater(rwaEducationNFT.address, true);
    console.log("✅ RWA Education NFT authorized for SBT minting");

    // 6. Display deployment summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("================================================");
    console.log("📋 CONTRACT ADDRESSES:");
    console.log("================================================");
    console.log("Education SBT:", educationSBT.address);
    console.log("RWA Education NFT:", rwaEducationNFT.address);
    console.log("Milestone Verifier:", milestoneVerifier.address);
    console.log("Cross Chain Payout:", crossChainPayout.address);
    console.log("================================================");

    // 7. Generate environment variables
    console.log("\n📝 Environment Variables for Frontend:");
    console.log("================================================");
    console.log(`NEXT_PUBLIC_EDUCATION_SBT_ADDRESS=${educationSBT.address}`);
    console.log(`NEXT_PUBLIC_RWA_EDUCATION_NFT_ADDRESS=${rwaEducationNFT.address}`);
    console.log(`NEXT_PUBLIC_MILESTONE_VERIFIER_ADDRESS=${milestoneVerifier.address}`);
    console.log(`NEXT_PUBLIC_CROSS_CHAIN_PAYOUT_ADDRESS=${crossChainPayout.address}`);
    console.log("================================================");

    // 8. Create a demo vault for testing
    console.log("\n🏗️  Creating demo vault for testing...");
    const demoTx = await rwaEducationNFT.createVault(
      deployer.address, // beneficiary
      "Medical Doctor (MD) - Demo",
      ethers.utils.parseUnits("50000", 6), // 50,000 USDC
      6, // 6 years
      "https://demo.medimint.com/metadata/1"
    );
    await demoTx.wait();
    console.log("✅ Demo vault created successfully!");

    // 9. Mint demo SBT
    console.log("\n🏆 Minting demo SBT...");
    const sbtTx = await educationSBT.mintSBT(
      deployer.address,
      1, // vault ID
      "Medical Doctor (MD) - Demo",
      12 // total milestones
    );
    await sbtTx.wait();
    console.log("✅ Demo SBT minted successfully!");

    console.log("\n🎊 All setup complete! Your MediMint platform is ready to use.");
    
    // 10. Verification instructions
    console.log("\n📚 Next Steps:");
    console.log("1. Update your .env.local file with the contract addresses above");
    console.log("2. Verify contracts on blockchain explorer (optional)");
    console.log("3. Add Chainlink Functions subscription funding");
    console.log("4. Test the application at http://localhost:8947");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 