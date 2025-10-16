// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    // User Menu Dropdown
    const userInfo = document.querySelector('.user-info');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userInfo && dropdownMenu) {
        userInfo.addEventListener('click', function() {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!userInfo.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real app, this would clear the session/token
            alert('You have been logged out successfully');
            window.location.href = 'index.html';
        });
    }
    
    // Form validation for signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // In a real app, this would send data to the server
            alert('Account created successfully! Please sign in.');
            window.location.href = 'signin.html';
        });
    }
    
    // Form validation for signin
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, this would send data to the server
            alert('Sign in successful!');
            window.location.href = 'dashboard.html';
        });
    }
    
    // Chatbot functionality
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.querySelector('.chatbot-messages');
    
    if (chatbotToggle && chatbotContainer) {
        chatbotToggle.addEventListener('click', function() {
            chatbotContainer.style.display = 'flex';
            chatbotToggle.style.display = 'none';
        });
        
        if (chatbotClose) {
            chatbotClose.addEventListener('click', function() {
                chatbotContainer.style.display = 'none';
                chatbotToggle.style.display = 'flex';
            });
        }
        
        // Simple chatbot responses
        const botResponses = [
            "Hello! How can I help you today?",
            "I can help you track your shipment. Please provide your tracking ID.",
            "Our customer service team is available 24/7 to assist you.",
            "You can track your shipment on our Track page.",
            "For faster delivery, consider our Express Delivery service.",
            "I'm here to help with any logistics questions you might have.",
            "You can sign up for an account to track all your shipments in one place.",
            "Our delivery network covers over 500 cities across India."
        ];
        
        function addMessage(message, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
            
            const messageText = document.createElement('p');
            messageText.textContent = message;
            
            messageDiv.appendChild(messageText);
            chatMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                addMessage(message, true);
                chatInput.value = '';
                
                // Simulate bot response
                setTimeout(() => {
                    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                    addMessage(randomResponse);
                }, 1000);
            }
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
    }
});