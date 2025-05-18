const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'transfer', 'receive'], // ✅ allowed types
    required: true
  },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  flagged: { type: Boolean, default: false },
  details: { type: String },
  isDeleted: { type: Boolean, default: false }, // ✅ Soft delete flag
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Transaction', transactionSchema);
