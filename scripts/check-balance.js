const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking Arbitrum Sepolia Balance");
  console.log("====================================");

  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("✅ Wallet Address:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceETH = hre.ethers.formatEther(balance);
    
    console.log("💰 Current Balance:", balanceETH, "ETH");
    
    if (parseFloat(balanceETH) === 0) {
      console.log("\n❌ INSUFFICIENT FUNDS!");
      console.log("=====================================");
      console.log("🔗 Get Arbitrum Sepolia ETH from faucet:");
      console.log("   https://faucets.chain.link");
      console.log("   https://sepoliafaucet.com");
      console.log("   https://www.alchemy.com/faucets/arbitrum-sepolia");
      console.log("");
      console.log("📋 Steps:");
      console.log("1. Visit faucet website");
      console.log("2. Connect wallet or paste address:", deployer.address);
      console.log("3. Request 0.1 ETH for gas fees");
      console.log("4. Wait 2-5 minutes for transaction");
      console.log("5. Run this script again to verify");
      console.log("");
      console.log("⚡ Quick Command:");
      console.log("node scripts/check-balance.js");
    } else if (parseFloat(balanceETH) < 0.001) {
      console.log("\n⚠️  LOW BALANCE WARNING!");
      console.log("You have", balanceETH, "ETH but need ~0.01 ETH for deployment");
      console.log("Consider getting more from faucet: https://faucets.chain.link");
    } else {
      console.log("\n✅ BALANCE OK!");
      console.log("You have enough ETH for deployment");
      console.log("");
      console.log("🚀 Ready to deploy:");
      console.log("npx hardhat run scripts/deploy-simple-arbitrum.js --network arbitrumSepolia");
    }

    // Network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("\n📡 Network Info:");
    console.log("   Chain ID:", network.chainId);
    console.log("   Network:", network.chainId === 421614n ? "✅ Arbitrum Sepolia" : "❌ Wrong Network");
    
  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error(error.message);
    
    if (error.code === 'NETWORK_ERROR') {
      console.log("\n🔧 Possible fixes:");
      console.log("1. Check internet connection");
      console.log("2. Verify RPC URL in hardhat.config.js");
      console.log("3. Try again in a few seconds");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 