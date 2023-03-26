const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');
const dashcore = require('@dashevo/dashcore-lib');

const WHTH_ADDRESS = '0x5D09B4771618032BCDF51c19854C495f0d362C43'; // Replace with your own wHTH smart contract address
const WHTH_DECIMALS = 18; // Replace with the number of decimals for your wHTH token
const DASH_ADDRESS = 'yT7gHjPwL....'; // Replace with your own Dash address for receiving payments

const privateKey = '0x123...'; // Replace with the private key of your Dash address

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545'); // Replace with your own Infura project ID or Ethereum node URL
const wallet = new ethers.Wallet(privateKey, provider);

let dashLocked = false; // Set initial lock state to false

app.use(bodyParser.json());
app.use(cors());

app.post('/trade', async (req, res) => {
  const dashAmount = req.body.dashAmount;
  const wHTHAddress = req.body.wHTHAddress;
  const dashReceivingAddress = req.body.dashReceivingAddress; // New parameter for Dash receiving address

  if (!dashAmount || !wHTHAddress || !dashReceivingAddress) { // Check if all parameters are present
    return res.status(400).send({ error: 'Invalid request body' });
  }

  if (dashLocked) { // Check if Dash is locked
    return res.status(400).send({ error: 'Dash is currently locked' });
  }

  dashLocked = true; // Lock Dash before processing the trade

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');
const dashcore = require('@dashevo/dashcore-lib');

const WHTH_ADDRESS = '0x5D09B4771618032BCDF51c19854C495f0d362C43'; // Replace with your own wHTH smart contract address
const WHTH_DECIMALS = 18; // Replace with the number of decimals for your wHTH token
const DASH_ADDRESS = 'yT7gHjPwL....'; // Replace with your own Dash address for receiving payments

const privateKey = '0x123...'; // Replace with the private key of your Dash address

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545'); // Replace with your own Infura project ID or Ethereum node URL
const wallet = new ethers.Wallet(privateKey, provider);

let dashLocked = false; // Set initial lock state to false

app.use(bodyParser.json());
app.use(cors());

app.post('/trade', async (req, res) => {
  const dashAmount = req.body.dashAmount;
  const wHTHAddress = req.body.wHTHAddress;
  const dashReceivingAddress = req.body.dashReceivingAddress; // New parameter for Dash receiving address

  if (!dashAmount || !wHTHAddress || !dashReceivingAddress) { // Check if all parameters are present
    return res.status(400).send({ error: 'Invalid request body' });
  }

  if (dashLocked) { // Check if Dash is locked
    return res.status(400).send({ error: 'Dash is currently locked' });
  }

  dashLocked = true; // Lock Dash before processing the trade

  try {
    const dashPaymentAddress = dashcore.Address.fromString(dashReceivingAddress); // Use the provided Dash receiving address
    const payment = new dashcore.Payment()
      .from({
        address: DASH_ADDRESS,
        privateKey: privateKey,
        network: 'mainnet'
      })
      .to(dashPaymentAddress, dashAmount * 100000000) // Convert Dash amount to satoshis
      .change(DASH_ADDRESS)
      .sign(privateKey);

    const transactionHash = await sendDashTransaction(payment.serialize());
    const wHTHAmount = dashAmount * 10 ** WHTH_DECIMALS; // Convert Dash amount to wHTH amount (1:1 trade)

    const wHTHContract = new ethers.Contract(WHTH_ADDRESS, ['function transfer(address to, uint256 value) returns (bool)'], wallet);
    const tx = await wHTHContract.transfer(wHTHAddress, wHTHAmount);
    await tx.wait();

    res.send({ success: true, transactionHash: transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred during the trade' });
  } finally {
    dashLocked = false; // Unlock Dash after processing the trade
  }
});

async function sendDashTransaction(rawTx) {
  return new Promise((resolve, reject) => {
    const insight = new dashcore.Explorers.Insight('https://insight.hth.world/insight-api', 'mainnet');
    insight.broadcast(rawTx, (err, txId) => {
      if (err) reject(err);
      resolve(txId);
    });
  });
}

app.listen(7000, () => {
  console.log('Server running on port 7000');
});