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

app.use(bodyParser.json());
app.use(cors());

app.post('/trade', async (req, res) => {
  const wHTHAmount = req.body.wHTHAmount;
  const dashAddress = req.body.dashAddress;

  if (!wHTHAmount || !dashAddress) {
    return res.status(400).send({ error: 'Invalid request body' });
  }

  const wHTHPaymentAddress = await wallet.getAddress();
  const wHTHContract = new ethers.Contract(WHTH_ADDRESS, ['function transferFrom(address from, address to, uint256 value) returns (bool)'], wallet);
  const allowance = await wHTHContract.allowance(dashAddress, wHTHPaymentAddress);

  if (allowance < wHTHAmount) {
    return res.status(400).send({ error: `Insufficient allowance: ${allowance}` });
  }

  const tx = await wHTHContract.transferFrom(dashAddress, wHTHPaymentAddress, wHTHAmount);
  await tx.wait();

  const dashPaymentAddress = dashcore.Address.fromString(DASH_ADDRESS);
  const payment = new dashcore.Payment()
    .from({
      address: DASH_ADDRESS,
      privateKey: privateKey,
      network: 'mainnet'
    })
    .to(dashPaymentAddress, wHTHAmount / 10 ** WHTH_DECIMALS) // Convert wHTH amount to Dash amount (1:1 trade)
    .change(DASH_ADDRESS)
    .sign(privateKey);

  const transactionHash = await sendDashTransaction(payment.serialize());
  res.send({ success: true, transactionHash: transactionHash });
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
