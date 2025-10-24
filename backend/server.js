const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const users = new Map();
const bets = new Map();

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (users.has(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    const user = {
      id: userId,
      username,
      password: hashedPassword,
      wallet: 10.00, // Starting with $10
      createdAt: new Date().toISOString()
    };

    users.set(username, user);

    const token = generateToken(userId);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        wallet: user.wallet
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        wallet: user.wallet
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    wallet: user.wallet,
    createdAt: user.createdAt
  });
});

// Place a bet
app.post('/api/bet', authenticateToken, (req, res) => {
  try {
    const { questionId, selectedOption, cost } = req.body;
    const user = Array.from(users.values()).find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet < cost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Deduct cost from wallet
    user.wallet -= cost;

    // Create bet record
    const betId = uuidv4();
    const bet = {
      id: betId,
      userId: user.id,
      questionId,
      selectedOption,
      cost,
      timestamp: new Date().toISOString()
    };

    bets.set(betId, bet);

    res.json({
      message: 'Bet placed successfully',
      bet,
      newWalletBalance: user.wallet
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's bets
app.get('/api/bets', authenticateToken, (req, res) => {
  const userBets = Array.from(bets.values()).filter(bet => bet.userId === req.user.userId);
  res.json({ bets: userBets });
});

// Get all users (for leaderboard)
app.get('/api/users', authenticateToken, (req, res) => {
  const allUsers = Array.from(users.values()).map(user => ({
    id: user.id,
    username: user.username,
    wallet: user.wallet,
    createdAt: user.createdAt
  })).sort((a, b) => b.wallet - a.wallet);

  res.json({ users: allUsers });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
