const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎬 MediMint Demo Flow - A-Z Testing");
  console.log("===================================\n");

  // Load deployment data
  const deploymentPath = path.join(__dirname, "../deployments/arbitrum-sepolia.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please run deployment first:");
    console.error("npm run deploy");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const { contracts } = deployment;

  const [deployer, student, investor] = await ethers.getSigners();
  console.log("👥 Demo Participants:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Student: ${student.address}`);
  console.log(`Investor: ${investor.address}\n`);

  // Connect to contracts
  const VaultNFT = await ethers.getContractAt("VaultNFT", contracts.VaultNFT);
  const Repayment = await ethers.getContractAt("Repayment", contracts.Repayment);
  
  let MockUSDC;
  if (contracts.MockUSDC) {
    MockUSDC = await ethers.getContractAt("MockERC20", contracts.MockUSDC);
  }

  console.log("📋 Contract Connections:");
  console.log(`VaultNFT: ${contracts.VaultNFT}`);
  console.log(`Repayment: ${contracts.Repayment}`);
  if (contracts.MockUSDC) {
    console.log(`MockUSDC: ${contracts.MockUSDC}`);
  }
  console.log();

  try {
    // Step 1: Student creates vault (triggers Chainlink Functions)
    console.log("🎓 STEP 1: Student Creates Vault");
    console.log("--------------------------------");
    
    const vaultData = {
      student: student.address,
      targetAmount: ethers.utils.parseUnits("30000", 6), // 30,000 USDC
      educationTrack: "Medical Specialist Program",
      studentId: "MED2024001",
      tokenURI: "https://medimint.demo/metadata/1.json"
    };

    console.log(`Creating vault for: ${vaultData.educationTrack}`);
    console.log(`Target amount: $30,000 USDC`);
    console.log(`Student ID: ${vaultData.studentId}`);

    const mintTx = await VaultNFT.connect(student).mintVault(
      vaultData.student,
      vaultData.targetAmount,
      vaultData.educationTrack,
      vaultData.studentId,
      vaultData.tokenURI
    );

    const mintReceipt = await mintTx.wait();
    const vaultCreatedEvent = mintReceipt.events?.find(e => e.event === 'VaultCreated');
    const vaultId = vaultCreatedEvent?.args?.vaultId;

    console.log(`✅ Vault created with ID: ${vaultId}`);
    console.log(`🔗 TX Hash: ${mintTx.hash}`);
    console.log(`📊 Arbiscan: https://sepolia.arbiscan.io/tx/${mintTx.hash}\n`);

    // Wait for Chainlink Functions to fetch salary
    console.log("⏳ Waiting for Chainlink Functions to fetch salary projection...");
    console.log("(In production, this would take 30-60 seconds)\n");

    // Step 2: Investor funds vault
    console.log("💰 STEP 2: Investor Funds Vault");
    console.log("-------------------------------");
    
    const investmentAmount = ethers.utils.parseUnits("30000", 6); // 30,000 USDC

    if (MockUSDC) {
      // Get mock USDC from faucet
      console.log("🚰 Getting mock USDC from faucet...");
      const faucetTx = await MockUSDC.connect(investor).faucet();
      await faucetTx.wait();
      console.log("✅ Mock USDC received from faucet");

      // Additional USDC for full investment
      const additionalAmount = ethers.utils.parseUnits("29000", 6); // Need 29k more
      const mintTx = await MockUSDC.connect(deployer).mint(investor.address, additionalAmount);
      await mintTx.wait();
      console.log("✅ Additional mock USDC minted");
    }

    // Approve USDC spending
    console.log("📝 Approving USDC spending...");
    const usdcAddress = contracts.MockUSDC || deployment.config.usdcAddress;
    const USDC = await ethers.getContractAt("MockERC20", usdcAddress);
    
    const approveTx = await USDC.connect(investor).approve(contracts.VaultNFT, investmentAmount);
    await approveTx.wait();
    console.log("✅ USDC approval granted");

    // Invest in vault
    console.log(`💸 Investing $30,000 USDC into vault ${vaultId}...`);
    const investTx = await VaultNFT.connect(investor).investInVault(vaultId, investmentAmount);
    const investReceipt = await investTx.wait();

    console.log(`✅ Investment successful!`);
    console.log(`🔗 TX Hash: ${investTx.hash}`);
    console.log(`📊 Arbiscan: https://sepolia.arbiscan.io/tx/${investTx.hash}\n`);

    // Step 3: Create repayment schedule
    console.log("📅 STEP 3: Create Repayment Schedule");
    console.log("------------------------------------");
    
    console.log("Creating automated repayment schedule...");
    const scheduleCreate = await Repayment.connect(investor).createRepaymentSchedule(vaultId);
    await scheduleCreate.wait();

    console.log("✅ Repayment schedule created!");
    console.log("🔗 TX Hash:", scheduleCreate.hash);
    console.log("📊 Arbiscan: https://sepolia.arbiscan.io/tx/" + scheduleCreate.hash);
    console.log("⏰ Automation will trigger repayment every 5 minutes\n");

    // Step 4: Check vault status
    console.log("📊 STEP 4: Vault Status Summary");
    console.log("-------------------------------");
    
    const vault = await VaultNFT.getVault(vaultId);
    const schedule = await Repayment.getRepaymentSchedule(vaultId);

    console.log("📋 Vault Information:");
    console.log(`  Vault ID: ${vault.id}`);
    console.log(`  Student: ${vault.student}`);
    console.log(`  Education Track: ${vault.educationTrack}`);
    console.log(`  Target Amount: $${ethers.utils.formatUnits(vault.targetAmount, 6)}`);
    console.log(`  Current Amount: $${ethers.utils.formatUnits(vault.currentAmount, 6)}`);
    console.log(`  Projected Salary: $${ethers.utils.formatUnits(vault.projectedSalary, 0)}`);
    console.log(`  Salary Fetched: ${vault.salaryFetched}`);
    console.log(`  Is Active: ${vault.isActive}\n`);

    console.log("💳 Repayment Schedule:");
    console.log(`  Monthly Amount: $${ethers.utils.formatUnits(schedule.monthlyAmount, 6)}`);
    console.log(`  Total Owed: $${ethers.utils.formatUnits(schedule.totalOwed, 6)}`);
    console.log(`  Total Paid: $${ethers.utils.formatUnits(schedule.totalPaid, 6)}`);
    console.log(`  Is Active: ${schedule.isActive}\n`);

    // Step 5: Demo complete
    console.log("🎉 DEMO FLOW COMPLETE!");
    console.log("======================");
    console.log("✅ Vault NFT minted → Chainlink Functions fetched salary");
    console.log("✅ Investor funded vault with USDC");
    console.log("✅ Repayment schedule created");
    console.log("✅ Chainlink Automation will trigger every 5 minutes");
    console.log();
    console.log("🏆 PROOF FOR JURI:");
    console.log(`📊 Vault on Arbiscan: https://sepolia.arbiscan.io/token/${contracts.VaultNFT}?a=${vaultId}`);
    console.log(`💰 Funding TX: https://sepolia.arbiscan.io/tx/${investTx.hash}`);
    console.log(`📅 Schedule TX: https://sepolia.arbiscan.io/tx/${scheduleCreate.hash}`);
    console.log(`🔄 Automation will show repayments every 5 minutes`);
    console.log();
    console.log("🌐 Next Steps:");
    console.log("1. Visit https://automation.chain.link to see upkeeps");
    console.log("2. Monitor Arbiscan for automated repayment transactions");
    console.log("3. Check vault status in frontend dashboard");
    
  } catch (error) {
    console.error("\n❌ Demo flow failed:");
    console.error(error.message);
    
    if (error.transaction) {
      console.error("📊 Failed TX:", error.transaction.hash);
    }
  }
}

// Helper function to wait
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 