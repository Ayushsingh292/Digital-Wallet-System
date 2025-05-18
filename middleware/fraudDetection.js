const Transaction = require('../models/Transaction');

const fraudDetection = async (req, res, next) => {
  try {
    const { userId, amount, type } = req.body;

    if (type === 'withdraw' && amount > 1000) {
      console.warn(`Fraud Alert: Large withdrawal by user ${userId}`);
      req.flagged = true;
    }

    if (type === 'transfer') {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentTransfers = await Transaction.find({
        sender: userId,
        type: 'transfer',
        timestamp: { $gt: oneMinuteAgo }
      });

      if (recentTransfers.length >= 3) {
        console.warn(` Fraud Alert: High frequency transfers by user ${userId}`);
        req.flagged = true;
      }
    }

    next();
  } catch (err) {
    console.error(err);
    next(); 
  }
};

module.exports = fraudDetection;
