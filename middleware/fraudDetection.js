// middleware/fraudDetection.js
const Transaction = require('../models/Transaction');

const fraudDetection = async (req, res, next) => {
  try {
    const { userId, amount, type } = req.body;

    // Example Rule 1: Sudden large withdrawal (over 1000 units)
    if (type === 'withdraw' && amount > 1000) {
      console.warn(`🚩 Fraud Alert: Large withdrawal by user ${userId}`);
      req.flagged = true;
    }

    // Example Rule 2: More than 3 transfers in the last 1 minute
    if (type === 'transfer') {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentTransfers = await Transaction.find({
        sender: userId,
        type: 'transfer',
        timestamp: { $gt: oneMinuteAgo }
      });

      if (recentTransfers.length >= 3) {
        console.warn(`🚩 Fraud Alert: High frequency transfers by user ${userId}`);
        req.flagged = true;
      }
    }

    next();
  } catch (err) {
    console.error(err);
    next(); // allow processing even if detection fails
  }
};

module.exports = fraudDetection;
