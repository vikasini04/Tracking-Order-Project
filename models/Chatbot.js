const mongoose = require('mongoose');

// Chat Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Chat Session Schema
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous users
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// FAQ Schema for predefined responses
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  answer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['shipping', 'tracking', 'delivery', 'pricing', 'account', 'general', 'support']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Update last activity on message addition
chatSessionSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastActivity = new Date();
  }
  next();
});

// Create models
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = {
  ChatSession,
  FAQ,
  messageSchema
};
