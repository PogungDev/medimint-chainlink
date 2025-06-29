const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking Balance for Specific Address");
  console.log("=========================================");

  // Address yang user berikan
  const targetAddress = "0x22A196A5D71B30542a9EEd349BE98DE352Fdb565";
  
  try {
    console.log("✅ Target Address:", targetAddress);
    
    const balance = await hre.ethers.provider.getBalance(targetAddress);
    const balanceETH = hre.ethers.formatEther(balance);
    
    console.log("💰 Current Balance:", balanceETH, "ETH");
    
    if (parseFloat(balanceETH) === 0) {
      console.log("\n❌ NO FUNDS!");
      console.log("=====================================");
      console.log("Address ini juga kosong. Perlu ETH dari faucet:");
      console.log("🔗 https://faucets.chain.link");
      console.log("🔗 https://www.alchemy.com/faucets/arbitrum-sepolia");
      console.log("");
      console.log("📋 Steps:");
      console.log("1. Buka faucet");
      console.log("2. Paste address:", targetAddress);
      console.log("3. Request 0.1 ETH");
      console.log("4. Update PRIVATE_KEY di .env.local");
    } else if (parseFloat(balanceETH) < 0.001) {
      console.log("\n⚠️  LOW BALANCE!");
      console.log("Balance:", balanceETH, "ETH");
      console.log("Butuh minimal 0.01 ETH untuk deployment");
      console.log("Request lebih banyak dari faucet: https://faucets.chain.link");
    } else {
      console.log("\n✅ BALANCE BAGUS!");
      console.log("Address ini punya cukup ETH untuk deployment!");
      console.log("");
      console.log("🔧 CARA PAKAI ADDRESS INI:");
      console.log("1. Update PRIVATE_KEY di .env.local dengan private key address ini");
      console.log("2. Atau kalau pakai MetaMask, switch ke address ini");
      console.log("3. Lalu run: npm run deploy");
    }

    // Network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("\n📡 Network Info:");
    console.log("   Chain ID:", network.chainId);
    console.log("   Network:", network.chainId === 421614n ? "✅ Arbitrum Sepolia" : "❌ Wrong Network");
    
    console.log("\n💡 NEXT STEPS:");
    console.log("Kalau balance OK, update .env.local:");
    console.log("PRIVATE_KEY=your_private_key_for_this_address");
    
  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 