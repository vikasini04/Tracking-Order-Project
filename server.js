// server.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const ChatbotService = require('./services/chatbotService');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/parceltracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected successfully');
  // Initialize chatbot FAQs
  await ChatbotService.initializeFAQs();
})
.catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Serve static pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/track', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'track.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


// API Routes

// User Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, phone, address, city, state, pincode, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !pincode || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({ 
      name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      pincode, 
      password: hashedPassword 
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        pincode: newUser.pincode
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User Signin
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user profile (protected route)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Chatbot API Routes

// Start new chat session
app.post('/api/chat/start', (req, res) => {
  try {
    const sessionId = ChatbotService.generateSessionId();
    const quickReplies = ChatbotService.getQuickReplies();
    
    res.status(200).json({
      sessionId,
      message: 'Hello! Welcome to TrakShip. How can I help you today?',
      quickReplies
    });
  } catch (err) {
    console.error('Chat start error:', err);
    res.status(500).json({ error: 'Error starting chat session' });
  }
});

// Send message to chatbot
app.post('/api/chat/message', async (req, res) => {
  const { sessionId, message, userId } = req.body;
  
  try {
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    // Generate bot response
    const botResponse = await ChatbotService.generateResponse(message, sessionId, userId);
    const quickReplies = ChatbotService.getQuickReplies();
    
    res.status(200).json({
      response: botResponse,
      quickReplies,
      sessionId
    });
  } catch (err) {
    console.error('Chat message error:', err);
    res.status(500).json({ error: 'Error processing message' });
  }
});

// Get chat history
app.get('/api/chat/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const history = await ChatbotService.getChatHistory(sessionId);
    res.status(200).json({ history });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Get chat sessions for authenticated user
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
  try {
    const { ChatSession } = require('./models/Chatbot');
    const sessions = await ChatSession.find({ userId: req.user.userId })
                                      .sort({ lastActivity: -1 })
                                      .limit(10)
                                      .select('sessionId createdAt lastActivity messages');
    
    res.status(200).json({ sessions });
  } catch (err) {
    console.error('Chat sessions error:', err);
    res.status(500).json({ error: 'Error fetching chat sessions' });
  }
});

// Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});