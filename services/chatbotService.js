const { ChatSession, FAQ } = require('../models/Chatbot');
const crypto = require('crypto');

class ChatbotService {
  
  // Generate unique session ID
  static generateSessionId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize predefined FAQs
  static async initializeFAQs() {
    const existingFAQs = await FAQ.countDocuments();
    if (existingFAQs > 0) return;

    const defaultFAQs = [
      {
        question: "How can I track my shipment?",
        keywords: ["track", "tracking", "shipment", "package", "order", "status"],
        answer: "You can track your shipment by entering your tracking number on our tracking page. Simply go to the Track section and enter your tracking ID.",
        category: "tracking",
        priority: 1
      },
      {
        question: "What are your shipping rates?",
        keywords: ["price", "cost", "rates", "shipping", "fees", "charges", "how much"],
        answer: "Our shipping rates depend on the package size, weight, and destination. Please visit our Services page for detailed pricing information or contact our support team for a custom quote.",
        category: "pricing",
        priority: 1
      },
      {
        question: "How long does delivery take?",
        keywords: ["delivery", "time", "how long", "duration", "days", "when", "arrive"],
        answer: "Delivery times vary based on the service type and destination. Standard delivery takes 3-5 business days, Express delivery takes 1-2 business days, and Same-day delivery is available in select areas.",
        category: "delivery",
        priority: 1
      },
      {
        question: "What shipping services do you offer?",
        keywords: ["services", "types", "options", "shipping methods", "delivery options"],
        answer: "We offer Standard Shipping, Express Delivery, Same-day Delivery, International Shipping, and Freight Services. Each service has different pricing and delivery timeframes.",
        category: "shipping",
        priority: 1
      },
      {
        question: "How do I create an account?",
        keywords: ["account", "register", "sign up", "signup", "create", "join"],
        answer: "You can create an account by clicking the 'Sign Up' button on our homepage. You'll need to provide your name, email, phone number, and address information.",
        category: "account",
        priority: 1
      },
      {
        question: "What if my package is lost or damaged?",
        keywords: ["lost", "damaged", "missing", "broken", "claim", "insurance"],
        answer: "If your package is lost or damaged, please contact our customer support immediately. We'll investigate the issue and provide appropriate compensation based on our insurance policy.",
        category: "support",
        priority: 1
      },
      {
        question: "Can I change my delivery address?",
        keywords: ["change", "address", "delivery", "redirect", "modify"],
        answer: "You can change your delivery address before the package is out for delivery. Please contact our support team as soon as possible with your tracking number and new address.",
        category: "delivery",
        priority: 1
      },
      {
        question: "Do you offer international shipping?",
        keywords: ["international", "overseas", "abroad", "global", "worldwide", "export"],
        answer: "Yes, we offer international shipping to over 200 countries. International delivery times and rates vary by destination. Additional customs fees may apply.",
        category: "shipping",
        priority: 1
      },
      {
        question: "How can I contact customer support?",
        keywords: ["contact", "support", "help", "customer service", "phone", "email"],
        answer: "You can contact our customer support through this chatbot, email us at support@trakship.com, or call us at 1-800-TRAKSHIP. Our support team is available 24/7.",
        category: "support",
        priority: 1
      },
      {
        question: "What payment methods do you accept?",
        keywords: ["payment", "pay", "credit card", "debit", "paypal", "methods", "billing"],
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and bank transfers. Payment is processed securely through our encrypted system.",
        category: "general",
        priority: 1
      }
    ];

    await FAQ.insertMany(defaultFAQs);
    console.log('Default FAQs initialized');
  }

  // Get or create chat session
  static async getOrCreateSession(sessionId, userId = null) {
    let session = await ChatSession.findOne({ sessionId });
    
    if (!session) {
      session = new ChatSession({
        sessionId,
        userId,
        messages: []
      });
      await session.save();
    }
    
    return session;
  }

  // Add message to session
  static async addMessage(sessionId, sender, message, userId = null) {
    const session = await this.getOrCreateSession(sessionId, userId);
    
    session.messages.push({
      sender,
      message,
      timestamp: new Date()
    });
    
    await session.save();
    return session;
  }

  // Find best matching FAQ
  static async findBestMatch(userMessage) {
    const faqs = await FAQ.find({ isActive: true }).sort({ priority: -1 });
    const userMessageLower = userMessage.toLowerCase();
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const faq of faqs) {
      let score = 0;
      
      // Check keywords
      for (const keyword of faq.keywords) {
        if (userMessageLower.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
      // Check question similarity
      const questionWords = faq.question.toLowerCase().split(' ');
      const userWords = userMessageLower.split(' ');
      
      for (const word of questionWords) {
        if (word.length > 3 && userWords.some(userWord => userWord.includes(word) || word.includes(userWord))) {
          score += 1;
        }
      }
      
      if (score > highestScore && score > 0) {
        highestScore = score;
        bestMatch = faq;
      }
    }
    
    return bestMatch;
  }

  // Generate bot response
  static async generateResponse(userMessage, sessionId, userId = null) {
    // Add user message to session
    await this.addMessage(sessionId, 'user', userMessage, userId);
    
    let botResponse;
    
    // Handle greeting
    if (this.isGreeting(userMessage)) {
      botResponse = this.getGreetingResponse();
    }
    // Handle goodbye
    else if (this.isGoodbye(userMessage)) {
      botResponse = this.getGoodbyeResponse();
    }
    // Handle tracking request
    else if (this.isTrackingRequest(userMessage)) {
      botResponse = this.getTrackingResponse(userMessage);
    }
    // Handle help request
    else if (this.isHelpRequest(userMessage)) {
      botResponse = this.getHelpResponse();
    }
    // Find FAQ match
    else {
      const faqMatch = await this.findBestMatch(userMessage);
      if (faqMatch) {
        botResponse = faqMatch.answer;
      } else {
        botResponse = this.getDefaultResponse();
      }
    }
    
    // Add bot response to session
    await this.addMessage(sessionId, 'bot', botResponse, userId);
    
    return botResponse;
  }

  // Check if message is a greeting
  static isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting));
  }

  // Check if message is a goodbye
  static isGoodbye(message) {
    const goodbyes = ['bye', 'goodbye', 'see you', 'farewell', 'thanks', 'thank you'];
    return goodbyes.some(goodbye => message.toLowerCase().includes(goodbye));
  }

  // Check if message is a tracking request
  static isTrackingRequest(message) {
    const trackingKeywords = ['track', 'tracking', 'where is my', 'status', 'package'];
    return trackingKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  // Check if message is a help request
  static isHelpRequest(message) {
    const helpKeywords = ['help', 'support', 'assistance', 'problem', 'issue'];
    return helpKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  // Get greeting response
  static getGreetingResponse() {
    const greetings = [
      "Hello! Welcome to TrakShip. How can I help you today?",
      "Hi there! I'm here to help you with your shipping needs. What can I do for you?",
      "Welcome to TrakShip! I can help you track packages, answer questions about our services, and more. How may I assist you?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Get goodbye response
  static getGoodbyeResponse() {
    const goodbyes = [
      "Thank you for using TrakShip! Have a great day!",
      "Goodbye! Feel free to return if you have any more questions.",
      "Thanks for chatting with us. Safe shipping!"
    ];
    return goodbyes[Math.floor(Math.random() * goodbyes.length)];
  }

  // Get tracking response
  static getTrackingResponse(message) {
    // Extract tracking number if present (improved pattern matching)
    const trackingPattern = /(SW\d{9}IN|[A-Z]{2}\d{8,12}[A-Z]{2})/g;
    const matches = message.match(trackingPattern);
    
    if (matches && matches.length > 0) {
      const trackingNumber = matches[0];
      return `I found tracking number ${trackingNumber}. Let me help you track this shipment. If you're on our tracking page, I'll fill it in automatically. Otherwise, please visit our Track page to see the full tracking details.`;
    } else {
      return "I can help you track your package! Please provide your tracking number (format: SW123456789IN), or you can visit our Track page to enter it there. You can also try asking 'track SW123456789IN' with your tracking number.";
    }
  }

  // Get help response
  static getHelpResponse() {
    return `I'm here to help! I can assist you with:
• Package tracking
• Shipping rates and services
• Delivery information
• Account questions
• General support

What specific question can I answer for you?`;
  }

  // Get default response when no match found
  static getDefaultResponse() {
    const defaultResponses = [
      "I'm not sure I understand that question. Could you please rephrase it or ask about shipping, tracking, or our services?",
      "I'd be happy to help, but I didn't quite understand your question. Can you try asking about package tracking, shipping rates, or delivery information?",
      "That's an interesting question! I can help you with shipping services, package tracking, delivery information, and account support. What would you like to know about these topics?"
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Get chat history
  static async getChatHistory(sessionId) {
    const session = await ChatSession.findOne({ sessionId });
    return session ? session.messages : [];
  }

  // Get quick reply suggestions
  static getQuickReplies() {
    return [
      "Track my package",
      "Shipping rates",
      "Delivery time",
      "Contact support",
      "Create account",
      "Services offered"
    ];
  }
}

module.exports = ChatbotService;
