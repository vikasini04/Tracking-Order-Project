class TrakShipChatbot {
  constructor() {
    this.sessionId = null;
    this.isOpen = false;
    this.messageHistory = [];
    this.isTyping = false;
    this.init();
  }

  init() {
    this.createChatbotHTML();
    this.bindEvents();
    this.startChatSession();
  }

  createChatbotHTML() {
    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'trakship-chatbot';
    chatbotContainer.className = 'chatbot-container';
    
    chatbotContainer.innerHTML = `
      <!-- Chat Toggle Button -->
      <div id="chat-toggle" class="chat-toggle">
        <div class="chat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="chat-close-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="chat-badge" id="chat-badge">1</div>
      </div>

      <!-- Chat Window -->
      <div id="chat-window" class="chat-window">
        <div class="chat-header">
          <div class="chat-header-content">
            <div class="chat-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                      fill="currentColor"/>
              </svg>
            </div>
            <div class="chat-info">
              <div class="chat-title">TrakShip Assistant</div>
              <div class="chat-status">Online</div>
            </div>
          </div>
          <button id="chat-minimize" class="chat-minimize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12l12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="chat-messages" id="chat-messages">
          <div class="welcome-message">
            <div class="bot-message">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="message-text">Hello! Welcome to TrakShip. How can I help you today?</div>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-replies" id="quick-replies"></div>

        <div class="chat-input-area">
          <div class="chat-input-container">
            <input type="text" id="chat-input" class="chat-input" placeholder="Type your message..." maxlength="500">
            <button id="chat-send" class="chat-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div class="chat-footer">
            <span class="powered-by">Powered by TrakShip AI</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(chatbotContainer);
    this.loadChatbotCSS();
  }

  loadChatbotCSS() {
    // Check if CSS is already loaded
    if (document.getElementById('chatbot-css')) return;
    
    const link = document.createElement('link');
    link.id = 'chatbot-css';
    link.rel = 'stylesheet';
    link.href = '/css/chatbot.css';
    document.head.appendChild(link);
  }

  bindEvents() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatMinimize = document.getElementById('chat-minimize');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');

    // Toggle chat window
    chatToggle.addEventListener('click', () => {
      this.toggleChat();
    });

    // Minimize chat
    chatMinimize.addEventListener('click', () => {
      this.toggleChat();
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Send message on button click
    chatSend.addEventListener('click', () => {
      this.sendMessage();
    });

    // Auto-resize input
    chatInput.addEventListener('input', () => {
      this.autoResizeInput();
    });
  }

  toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatToggle = document.getElementById('chat-toggle');
    const chatBadge = document.getElementById('chat-badge');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      chatWindow.classList.add('open');
      chatToggle.classList.add('active');
      chatBadge.style.display = 'none';
      this.scrollToBottom();
      document.getElementById('chat-input').focus();
    } else {
      chatWindow.classList.remove('open');
      chatToggle.classList.remove('active');
    }
  }

  async startChatSession() {
    try {
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        this.sessionId = data.sessionId;
        this.displayQuickReplies(data.quickReplies);
      } else {
        console.error('Error starting chat session:', data.error);
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
    }
  }

  async sendMessage(messageText = null) {
    const input = document.getElementById('chat-input');
    const message = messageText || input.value.trim();
    
    if (!message || this.isTyping) return;

    // Clear input if not using quick reply
    if (!messageText) {
      input.value = '';
    }

    // Display user message
    this.displayMessage(message, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const token = localStorage.getItem('authToken');
      const userId = this.getCurrentUserId();

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message: message,
          userId: userId
        })
      });

      const data = await response.json();

      // Hide typing indicator
      this.hideTypingIndicator();

      if (response.ok) {
        // Display bot response
        this.displayMessage(data.response, 'bot');
        
        // Update quick replies
        this.displayQuickReplies(data.quickReplies);
      } else {
        this.displayMessage('Sorry, I encountered an error processing your message. Please try again.', 'bot');
        console.error('Chat error:', data.error);
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.displayMessage('Sorry, I am currently unable to respond. Please check your connection and try again.', 'bot');
      console.error('Error sending message:', error);
    }
  }

  displayMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'user') {
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="message-text">${this.escapeHtml(text)}</div>
          <div class="message-time">${currentTime}</div>
        </div>
        <div class="message-avatar">👤</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text">${this.formatBotMessage(text)}</div>
          <div class="message-time">${currentTime}</div>
        </div>
      `;
    }
    
    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
    
    // Store message in history
    this.messageHistory.push({ text, sender, timestamp: new Date() });
  }

  formatBotMessage(text) {
    // Convert newlines to line breaks
    return this.escapeHtml(text).replace(/\n/g, '<br>').replace(/•/g, '•');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showTypingIndicator() {
    this.isTyping = true;
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'bot-message typing-indicator';
    
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  displayQuickReplies(replies) {
    const quickRepliesContainer = document.getElementById('quick-replies');
    quickRepliesContainer.innerHTML = '';
    
    if (replies && replies.length > 0) {
      replies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply;
        button.addEventListener('click', () => {
          this.sendMessage(reply);
          // Clear quick replies after selection
          quickRepliesContainer.innerHTML = '';
        });
        quickRepliesContainer.appendChild(button);
      });
    }
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  autoResizeInput() {
    const input = document.getElementById('chat-input');
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  }

  getCurrentUserId() {
    // Try to get user ID from localStorage or session storage
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      console.log('No user data found');
    }
    return null;
  }

  // Public methods for external control
  openChat() {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  closeChat() {
    if (this.isOpen) {
      this.toggleChat();
    }
  }

  sendPredefinedMessage(message) {
    this.sendMessage(message);
    this.openChat();
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if not already present
  if (!document.getElementById('trakship-chatbot')) {
    window.trakShipChatbot = new TrakShipChatbot();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrakShipChatbot;
}
