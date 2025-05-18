const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ email, isDeleted: false });
    if (existing) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user object
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // Save user to DB
    const savedUser = await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ msg: 'User registered', token });

  } catch (err) {
    console.error('💥 Registration Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Only find non-deleted users
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials or user deleted' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
