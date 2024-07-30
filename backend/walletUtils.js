const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const mnemonic = process.env.MNEMONIC;
const providerUrl = process.env.ALCHEMY_API_URL;

// Initialize the provider using JsonRpcProvider
let provider;
try {
  provider = new ethers.providers.JsonRpcProvider(providerUrl);
  console.log('JsonRpcProvider setup successful!');
} catch (error) {
  console.error('Error setting up JsonRpcProvider:', error);
}

// File paths for storing wallets and index
const walletsFilePath = path.join(__dirname, 'wallets.json');
const walletIndexFilePath = path.join(__dirname, 'walletIndex.json');

// Generate new wallet addresses
function generateNewWallets() {
  // Load current wallet index
  let walletIndex;
  try {
    const walletIndexData = fs.readFileSync(walletIndexFilePath, 'utf8');
    walletIndex = JSON.parse(walletIndexData);
  } catch (error) {
    console.error('Error reading wallet index:', error);
    walletIndex = { currentIndex: 2 }; // Start at 2, reserving index 1 for the parent wallet
  }

  // Load current wallets data
  let wallets = [];
  try {
    const walletsData = fs.readFileSync(walletsFilePath, 'utf8');
    wallets = JSON.parse(walletsData);
  } catch (error) {
    console.error('Error reading wallets file:', error);
  }

  // Generate 5 new wallets starting from the current index
  const newWallets = [];
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  for (let i = 0; i < 5; i++) {
    const walletNode = hdNode.derivePath(`m/44'/60'/0'/0/${walletIndex.currentIndex}`);
    const wallet = new ethers.Wallet(walletNode.privateKey, provider);
    newWallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
    });
    wallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      index: walletIndex.currentIndex,
    });
    walletIndex.currentIndex++;
  }

  // Save updated wallets and wallet index
  fs.writeFileSync(walletsFilePath, JSON.stringify(wallets, null, 2));
  fs.writeFileSync(walletIndexFilePath, JSON.stringify(walletIndex, null, 2));

  return newWallets;
}

module.exports = {
  generateNewWallets,
};
