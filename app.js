require('dotenv').config(); // Always load env first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const deleteRoutes = require('./routes/delete'); // ✅ optional if added

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Register API routes
app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/admin', adminRoutes);
app.use('/delete', deleteRoutes); // ✅ if created

// Scheduled fraud scan
const dailyFraudScan = require('./utils/fraudScan');
cron.schedule('0 0 * * *', () => {
  dailyFraudScan();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
