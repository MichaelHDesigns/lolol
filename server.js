const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const { dashToWHTH, wHTHToDash } = require('./trades');
const { lock, unlock, isLocked } = require('./lock');

app.use(bodyParser.json());
app.use(cors());

app.post('/dash-to-wHTH', async (req, res) => {
  if (isLocked()) {
    return res.status(400).send({ error: 'Trading is currently locked' });
  }
  const { inputAmount } = req.body;
  const outputAmount = await dashToWHTH(inputAmount);
  lock();
  res.send({ outputAmount });
});

app.post('/wHTH-to-dash', async (req, res) => {
  if (isLocked()) {
    return res.status(400).send({ error: 'Trading is currently locked' });
  }
  const { inputAmount } = req.body;
  const outputAmount = await wHTHToDash(inputAmount);
  lock();
  res.send({ outputAmount });
});

app.post('/unlock', async (req, res) => {
  const { password } = req.body;
  if (password !== 'supersecret') {
    return res.status(400).send({ error: 'Incorrect password' });
  }
  unlock();
  res.send({ success: true });
});

app.listen(7000, () => {
  console.log('Server running on port 7000');
});
