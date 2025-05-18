// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authenticateToken = require('../middleware/auth'); // ✅ FIXED: Import missing middleware

// ✅ Total balance across all users
router.get('/total-balances', authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    const total = users.reduce((sum, u) => sum + u.walletBalance, 0); // ✅ Fixed: should use walletBalance
    res.json({ total });
  } catch (err) {
    console.error('💥 Total Balances Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Top users by balance
router.get('/top-users', authenticateToken, async (req, res) => {
  try {
    const topUsers = await User.find().sort({ walletBalance: -1 }).limit(5); // ✅ Fixed: use walletBalance
    res.json(topUsers);
  } catch (err) {
    console.error('💥 Top Users Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Flagged transactions
router.get('/flagged', authenticateToken, async (req, res) => {
  try {
    const flaggedTxs = await Transaction.find({ flagged: true }).sort({ createdAt: -1 });
    res.status(200).json(flaggedTxs);
  } catch (err) {
    console.error('💥 Flagged Transaction Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ GET /admin/top-users → Top 5 users by wallet balance
router.get('/top-users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().sort({ walletBalance: -1 }).limit(5); // descending order
    const result = users.map(u => ({
      username: u.username,
      email: u.email,
      walletBalance: u.walletBalance
    }));
    res.status(200).json(result);
  } catch (err) {
    console.error('💥 Top Users Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ GET /admin/aggregate → Total wallet balance
router.get('/aggregate', authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    const totalBalance = users.reduce((sum, user) => sum + (user.walletBalance || 0), 0);
    res.status(200).json({ totalBalance });
  } catch (err) {
    console.error('💥 Aggregate Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
