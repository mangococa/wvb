const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { generateNewWallets } = require('./walletUtils');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware: Parse incoming request bodies in JSON format
app.use(bodyParser.json());

// Middleware: Set CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint to generate new wallets
app.post('/generate-wallets', (req, res) => {
  try {
    const wallets = generateNewWallets();
    res.status(200).json({ wallets });
  } catch (error) {
    console.error('Error generating wallets:', error);
    res.status(500).json({ error: 'Failed to generate wallets' });
  }
});

// Endpoint to retrieve all generated wallets and their index
app.get('/wallets', (req, res) => {
  try {
    const walletsPath = path.join(__dirname, 'wallets.json');
    const walletIndexPath = path.join(__dirname, 'walletIndex.json');
    
    const wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
    const walletIndex = JSON.parse(fs.readFileSync(walletIndexPath, 'utf8'));

    res.json({ wallets, walletIndex });
  } catch (error) {
    console.error('Error reading wallets or wallet index:', error);
    res.status(500).send('Failed to retrieve wallet data');
  }
});

// Start server: Listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
