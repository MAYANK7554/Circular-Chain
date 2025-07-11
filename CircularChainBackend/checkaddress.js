import { ethers } from 'ethers';
import 'dotenv/config';

function checkAddress() {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("Could not find PRIVATE_KEY in your .env file.");
    return;
  }

  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("The address Hardhat is trying to use is:", wallet.address);
  } catch (error) {
    console.error("The PRIVATE_KEY in your .env file is invalid. Please re-export it from MetaMask.");
  }
}

checkAddress();