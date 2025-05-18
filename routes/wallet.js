const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const authenticateToken = require('../middleware/auth');
const fraudDetection = require('../middleware/fraudDetection');

const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ balance: user.walletBalance });
  } catch (err) {
    console.error(' Balance Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Deposit funds
router.post('/deposit', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  console.log('Deposit amount received:', amount);
  console.log(' Token payload:', req.user);

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Invalid deposit amount' });
  }

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.walletBalance += amount;
    await user.save();

    await new Transaction({
      username: user.username,
      type: 'deposit',
      amount,
      status: 'completed',
      flagged: false,
      details: 'Deposited to wallet',
    }).save();

    res.status(200).json({ msg: 'Deposit successful', balance: user.walletBalance });
  } catch (err) {
    console.error('Deposit Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Withdraw funds
router.post('/withdraw', authenticateToken, fraudDetection, async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ msg: 'Invalid withdrawal amount' });

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.walletBalance < amount) return res.status(400).json({ msg: 'Insufficient balance' });

    user.walletBalance -= amount;
    await user.save();

    await new Transaction({
      username: user.username,
      type: 'withdraw',
      amount,
      status: 'completed',
      flagged: req.flagged || false,
      details: 'Withdrawn from wallet',
    }).save();

    res.status(200).json({ msg: 'Withdrawal successful', balance: user.walletBalance });
  } catch (err) {
    console.error(' Withdraw Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Transfer funds
router.post('/transfer', authenticateToken, fraudDetection, async (req, res) => {
  const { recipientEmail, amount } = req.body;

  if (!recipientEmail || !amount || amount <= 0) {
    return res.status(400).json({ msg: 'Invalid input' });
  }

  if (recipientEmail === req.user.email) {
    return res.status(400).json({ msg: 'Cannot transfer to yourself' });
  }

  try {
    const sender = await User.findOne({ email: req.user.email });
    const recipient = await User.findOne({ email: recipientEmail });

    if (!sender || !recipient) {
      return res.status(404).json({ msg: 'Sender or recipient not found' });
    }

    if (sender.walletBalance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      sender.walletBalance -= amount;
      recipient.walletBalance += amount;

      await sender.save({ session });
      await recipient.save({ session });

      await new Transaction({
        username: sender.username,
        type: 'transfer',
        amount,
        status: 'completed',
        flagged: req.flagged || false,
        details: `Transferred to ${recipient.username}`,
      }).save({ session });

      await new Transaction({
        username: recipient.username,
        type: 'receive',
        amount,
        status: 'completed',
        flagged: false,
        details: `Received from ${sender.username}`,
      }).save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ msg: 'Transfer successful' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(' Transaction Save Error:', error);
      res.status(500).json({ msg: 'Transaction failed' });
    }

  } catch (err) {
    console.error('Transfer Route Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

//   Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ username: req.user.username }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Transaction History Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
