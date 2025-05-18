const Transaction = require('../models/Transaction');

async function dailyFraudScan() {
  console.log('Running daily fraud scan...');

  try {
    const threshold = 10000;

    const suspiciousTxns = await Transaction.find({
      amount: { $gt: threshold },
      flagged: false
    });

    for (const txn of suspiciousTxns) {
      txn.flagged = true;
      await txn.save();
      console.log(` Flagged transaction ID ${txn._id} for amount ₹${txn.amount}`);
    }

    console.log(`Daily fraud scan complete. Flagged ${suspiciousTxns.length} transactions.`);
  } catch (err) {
    console.error(' Fraud Scan Error:', err);
  }
}

module.exports = dailyFraudScan;
