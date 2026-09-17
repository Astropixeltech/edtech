import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import { verifyToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role && ['admin', 'teacher', 'student'].includes(role) ? role : 'student';

    const newUser = {
      id: `usr-${assignedRole}-${Date.now()}`,
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      role: assignedRole,
      phoneNumber: phoneNumber || '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      bio: `${assignedRole} account registered on Astropixel Learn`,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Registration successful',
      user: safeUser,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', verifyToken, (req, res) => {
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Update profile
router.put('/profile', verifyToken, (req, res) => {
  try {
    const { fullName, phoneNumber, avatarUrl, bio } = req.body;
    const updated = db.updateUser(req.user.id, {
      ...(fullName && { fullName }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bio !== undefined && { bio })
    });

    const { passwordHash, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
