const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ✅ Soft delete user account
router.delete('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isDeleted = true;
    await user.save();
    res.json({ msg: 'User soft deleted' });
  } catch (err) {
    console.error('💥 Soft Delete User Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Soft delete a transaction by ID
router.delete('/transaction/:id', authenticateToken, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });

    tx.isDeleted = true;
    await tx.save();
    res.json({ msg: 'Transaction soft deleted' });
  } catch (err) {
    console.error('💥 Soft Delete TX Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
