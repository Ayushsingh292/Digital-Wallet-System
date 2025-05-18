const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.transferFunds = async (req, res) => {
  const senderId = req.user.id; 
  const { recipientEmail, amount } = req.body;

  if (!recipientEmail || !amount) {
    return res.status(400).json({ message: 'Recipient email and amount are required.' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Transfer amount must be positive.' });
  }

  if (req.user.email === recipientEmail) {
    return res.status(400).json({ message: 'Cannot transfer to yourself.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(senderId).session(session);
    const recipient = await User.findOne({ email: recipientEmail }).session(session);

    if (!recipient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Recipient not found.' });
    }

    if (sender.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    sender.balance -= amount;
    await sender.save({ session });

    recipient.balance += amount;
    await recipient.save({ session });

    const senderTx = new Transaction({
      userId: sender._id,
      type: 'transfer-out',
      amount,
      description: `Transfer to ${recipient.email}`,
      timestamp: new Date(),
    });
    await senderTx.save({ session });

    const recipientTx = new Transaction({
      userId: recipient._id,
      type: 'transfer-in',
      amount,
      description: `Transfer from ${sender.email}`,
      timestamp: new Date(),
    });
    await recipientTx.save({ session });

    if (amount > 10000) {
      console.warn(`Large transfer detected: ${amount} from ${sender.email} to ${recipient.email}`);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Transfer successful.' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: 'Server error during transfer.' });
  }
};
