const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 Private Key Updater");
  console.log("========================");

  const envPath = path.join(__dirname, "../.env.local");
  
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found!");
    return;
  }

  const targetAddress = "0x22A196A5D71B30542a9EEd349BE98DE352Fdb565";
  
  console.log("🎯 Target Address:", targetAddress);
  console.log("💰 Balance: 0.05151 ETH (✅ Enough for deployment!)");
  console.log("");
  
  console.log("📝 TO UPDATE PRIVATE KEY:");
  console.log("1. Buka file: .env.local");
  console.log("2. Cari line: PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("3. Ganti dengan: PRIVATE_KEY=your_private_key_here");
  console.log("");
  
  console.log("🔍 CARA DAPAT PRIVATE KEY:");
  console.log("- MetaMask: Account Details → Export Private Key");
  console.log("- Trust Wallet: Settings → Private Key");
  console.log("- Rabby: Account → Export Private Key");
  console.log("");
  
  console.log("⚠️  SECURITY TIPS:");
  console.log("- Private key dimulai dengan 0x");
  console.log("- 64 karakter hexadecimal setelah 0x");
  console.log("- JANGAN share ke siapa-siapa!");
  console.log("- Backup private key dengan aman");
  console.log("");
  
  console.log("🚀 SETELAH UPDATE:");
  console.log("npm run check-balance  # Verifikasi address benar");
  console.log("npm run deploy        # Deploy contracts");
  console.log("npm run dev           # Start frontend");
  
  // Read current env file
  const envContent = fs.readFileSync(envPath, "utf8");
  const currentPrivateKey = envContent.match(/PRIVATE_KEY=(.+)/)?.[1];
  
  console.log("\n📋 CURRENT STATUS:");
  console.log("Current private key:", currentPrivateKey?.substring(0, 10) + "...");
  console.log("Target address:", targetAddress);
  
  console.log("\n💡 QUICK EDIT COMMAND:");
  console.log("nano .env.local  # Edit file directly");
  console.log("atau");
  console.log("code .env.local  # Edit with VS Code");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 