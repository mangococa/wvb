const { ethers } = require('ethers');
require('dotenv').config();

try {
    // Attempt to use the new style if ethers has changed exports
    let provider;
    if (ethers.providers && typeof ethers.providers.JsonRpcProvider === 'function') {
        provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
    } else if (typeof ethers.JsonRpcProvider === 'function') {
        provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
    } else {
        throw new Error("JsonRpcProvider not found in ethers library");
    }
    console.log("JsonRpcProvider setup successful!");
} catch (error) {
    console.error("Error setting up JsonRpcProvider:", error.message);
}
